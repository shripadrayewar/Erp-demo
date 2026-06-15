import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../prisma/types';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
