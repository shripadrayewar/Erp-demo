import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { AccountType } from '../../../prisma/types';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  creditLimit?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;
}
