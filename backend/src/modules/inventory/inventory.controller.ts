import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Categories
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories')
  findAllCategories() {
    return this.inventoryService.findAllCategories();
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(200)
  removeCategory(@Param('id') id: string) {
    return this.inventoryService.removeCategory(id);
  }

  // Products
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(dto);
  }

  @Get('products')
  findAllProducts(@Query() query: { search?: string; categoryId?: string; type?: string; status?: string }) {
    return this.inventoryService.findAllProducts(query);
  }

  @Get('products/:id')
  findOneProduct(@Param('id') id: string) {
    return this.inventoryService.findOneProduct(id);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(200)
  removeProduct(@Param('id') id: string) {
    return this.inventoryService.removeProduct(id);
  }
}
