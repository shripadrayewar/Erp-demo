import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CustomerType } from '../../../prisma/types';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUUID()
  accountId: string;

  @IsEnum(CustomerType)
  type: CustomerType;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  billingAddress: string;

  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @IsOptional()
  @IsString()
  industry?: string;
}
