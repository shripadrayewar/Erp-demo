import { Type } from 'class-transformer';
import {
  IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';

export class OrderLineItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount?: number;
}

export class CreateOrderDto {
  @IsUUID()
  accountId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsNotEmpty()
  @IsString()
  billingAddress: string;

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  lineItems: OrderLineItemDto[];
}
