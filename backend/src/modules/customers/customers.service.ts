import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Status } from '../../prisma/types';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private async generateCode(): Promise<string> {
    const count = await this.prisma.customer.count();
    return `CUST-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateCustomerDto) {
    const account = await this.prisma.account.findUnique({ where: { id: dto.accountId } });
    if (!account) throw new NotFoundException(`Account ${dto.accountId} not found`);
    const code = await this.generateCode();
    return this.prisma.customer.create({
      data: { ...dto, code },
      include: { account: true },
    });
  }

  async findAll(query: { search?: string; status?: string; type?: string; accountId?: string }) {
    const { search, status, type, accountId } = query;
    return this.prisma.customer.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        ...(accountId && { accountId }),
      },
      include: { account: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        account: true,
        salesOrders: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
      include: { account: true },
    });
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    if (customer.salesOrders.length > 0) {
      throw new BadRequestException('Cannot deactivate customer with existing orders');
    }
    return this.prisma.customer.update({
      where: { id },
      data: { status: Status.INACTIVE },
    });
  }
}
