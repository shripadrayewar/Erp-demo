import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Status } from '../../prisma/types';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  private async generateCode(): Promise<string> {
    const count = await this.prisma.account.count();
    return `ACC-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateAccountDto) {
    const code = await this.generateCode();
    return this.prisma.account.create({
      data: { ...dto, code },
    });
  }

  async findAll(query: { search?: string; status?: string; type?: string }) {
    const { search, status, type } = query;
    return this.prisma.account.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
      },
      include: { _count: { select: { customers: true, salesOrders: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        customers: { where: { status: Status.ACTIVE }, take: 10 },
        salesOrders: { take: 10, orderBy: { createdAt: 'desc' }, include: { customer: true } },
        _count: { select: { customers: true, salesOrders: true } },
      },
    });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.findOne(id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.account.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
