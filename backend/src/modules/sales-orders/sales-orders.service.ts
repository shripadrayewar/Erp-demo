import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderStatus } from '../../prisma/types';

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:      [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED:  [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED:    [OrderStatus.DELIVERED],
  DELIVERED:  [],
  CANCELLED:  [],
};

@Injectable()
export class SalesOrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const seq = await this.prisma.orderSequence.upsert({
      where: { year },
      update: { lastN: { increment: 1 } },
      create: { year, lastN: 1 },
    });
    return `SO-${year}-${String(seq.lastN).padStart(4, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    const account = await this.prisma.account.findUnique({ where: { id: dto.accountId } });
    if (!account) throw new NotFoundException(`Account ${dto.accountId} not found`);
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);
    if (customer.accountId !== dto.accountId) {
      throw new BadRequestException('Customer does not belong to the selected account');
    }

    const taxRate = dto.taxRate ?? 0;
    let subtotal = 0;
    const lineItemsData = dto.lineItems.map((item) => {
      const discount = item.discount ?? 0;
      const lineTotal = item.quantity * item.unitPrice * (1 - discount / 100);
      subtotal += lineTotal;
      return { ...item, discount, lineTotal };
    });
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const orderNumber = await this.generateOrderNumber();

    return this.prisma.salesOrder.create({
      data: {
        orderNumber,
        accountId: dto.accountId,
        customerId: dto.customerId,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
        taxRate,
        subtotal,
        taxAmount,
        totalAmount,
        notes: dto.notes,
        lineItems: { create: lineItemsData.map(({ productId, quantity, unitPrice, discount, lineTotal }) => ({
          productId, quantity, unitPrice, discount, lineTotal,
        })) },
      },
      include: {
        account: true,
        customer: true,
        lineItems: { include: { product: { include: { category: true } } } },
      },
    });
  }

  async findAll(query: { accountId?: string; customerId?: string; status?: string; from?: string; to?: string }) {
    const { accountId, customerId, status, from, to } = query;
    return this.prisma.salesOrder.findMany({
      where: {
        ...(accountId && { accountId }),
        ...(customerId && { customerId }),
        ...(status && { status: status as OrderStatus }),
        ...(from || to ? {
          orderDate: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        } : {}),
      },
      include: {
        account: { select: { id: true, name: true, code: true } },
        customer: { select: { id: true, name: true, code: true } },
        _count: { select: { lineItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        account: true,
        customer: true,
        lineItems: { include: { product: { include: { category: true } } } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }
    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: dto.status },
      include: { account: true, customer: true, lineItems: { include: { product: true } } },
    });
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT orders can be deleted');
    }
    return this.prisma.salesOrder.delete({ where: { id } });
  }
}
