import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Status } from '../../prisma/types';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // --- Categories ---

  async createCategory(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException(`Parent category ${dto.parentId} not found`);
    }
    return this.prisma.category.create({ data: dto });
  }

  async findAllCategories() {
    const all = await this.prisma.category.findMany({
      include: {
        children: { include: { children: true } },
        _count: { select: { products: true } },
      },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
    return all;
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    if (cat._count.products > 0 || cat._count.children > 0) {
      throw new ConflictException('Category has products or sub-categories. Remove them first.');
    }
    return this.prisma.category.delete({ where: { id } });
  }

  // --- Products ---

  async createProduct(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`SKU ${dto.sku} already exists`);
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException(`Category ${dto.categoryId} not found`);
    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async findAllProducts(query: { search?: string; categoryId?: string; type?: string; status?: string }) {
    const { search, categoryId, type, status } = query;
    return this.prisma.product.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(categoryId && { categoryId }),
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.findOneProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async removeProduct(id: string) {
    await this.findOneProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
