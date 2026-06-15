import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';

@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    CustomersModule,
    InventoryModule,
    SalesOrdersModule,
  ],
})
export class AppModule {}
