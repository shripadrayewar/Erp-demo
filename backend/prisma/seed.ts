import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const connectivity = await prisma.category.create({ data: { name: 'Connectivity', description: 'SDWAN and broadband services' } });
  const hardware = await prisma.category.create({ data: { name: 'Hardware', description: 'Physical networking equipment' } });
  const simCards = await prisma.category.create({ data: { name: 'SIM Cards', description: 'Mobile SIM cards and data plans' } });
  const managedSvc = await prisma.category.create({ data: { name: 'Managed Services', description: 'Managed IT and network services' } });

  const sdwan = await prisma.category.create({ data: { name: 'SDWAN', parentId: connectivity.id } });
  const broadband = await prisma.category.create({ data: { name: 'Broadband', parentId: connectivity.id } });
  const routers = await prisma.category.create({ data: { name: 'Routers', parentId: hardware.id } });
  const switches = await prisma.category.create({ data: { name: 'Switches', parentId: hardware.id } });
  const aps = await prisma.category.create({ data: { name: 'Access Points', parentId: hardware.id } });

  // Products
  await prisma.product.createMany({ data: [
    { sku: 'SDWAN-ENT-1Y', name: 'SDWAN Enterprise License (1 Year)', categoryId: sdwan.id, type: 'SUBSCRIPTION', unitPrice: 120000, costPrice: 80000, unit: 'license' },
    { sku: 'SDWAN-SMB-1Y', name: 'SDWAN SMB License (1 Year)', categoryId: sdwan.id, type: 'SUBSCRIPTION', unitPrice: 60000, costPrice: 40000, unit: 'license' },
    { sku: 'BB-100MBPS', name: 'Broadband 100 Mbps (Monthly)', categoryId: broadband.id, type: 'SUBSCRIPTION', unitPrice: 5000, costPrice: 3000, unit: 'month' },
    { sku: 'BB-1GBPS', name: 'Broadband 1 Gbps (Monthly)', categoryId: broadband.id, type: 'SUBSCRIPTION', unitPrice: 15000, costPrice: 10000, unit: 'month' },
    { sku: 'RTR-CISCO-ISR4331', name: 'Cisco ISR 4331 Router', categoryId: routers.id, type: 'PHYSICAL', unitPrice: 85000, costPrice: 65000, unit: 'each', stockQty: 10 },
    { sku: 'RTR-FORTINET-60F', name: 'Fortinet FortiGate 60F', categoryId: routers.id, type: 'PHYSICAL', unitPrice: 45000, costPrice: 32000, unit: 'each', stockQty: 15 },
    { sku: 'SW-CISCO-2960X', name: 'Cisco Catalyst 2960-X Switch (24-port)', categoryId: switches.id, type: 'PHYSICAL', unitPrice: 55000, costPrice: 42000, unit: 'each', stockQty: 8 },
    { sku: 'AP-UNIFI-AC-PRO', name: 'Ubiquiti UniFi AC Pro AP', categoryId: aps.id, type: 'PHYSICAL', unitPrice: 18000, costPrice: 12000, unit: 'each', stockQty: 25 },
    { sku: 'SIM-4G-UNLTD', name: '4G SIM Unlimited Data', categoryId: simCards.id, type: 'SUBSCRIPTION', unitPrice: 1500, costPrice: 900, unit: 'SIM/month' },
    { sku: 'SIM-5G-50GB', name: '5G SIM 50GB Data', categoryId: simCards.id, type: 'SUBSCRIPTION', unitPrice: 2500, costPrice: 1500, unit: 'SIM/month' },
    { sku: 'MS-NOC-BASIC', name: 'NOC Monitoring (Basic)', categoryId: managedSvc.id, type: 'SERVICE', unitPrice: 8000, costPrice: 4000, unit: 'month' },
    { sku: 'MS-NOC-PREMIUM', name: 'NOC Monitoring (Premium 24x7)', categoryId: managedSvc.id, type: 'SERVICE', unitPrice: 20000, costPrice: 12000, unit: 'month' },
  ]});

  // Accounts
  const account1 = await prisma.account.create({ data: {
    code: 'ACC-0001', name: 'TechReseller Pvt Ltd', type: 'PARTNER',
    email: 'info@techreseller.com', phone: '+91-98765-43210',
    address: 'Andheri East, Mumbai, Maharashtra 400069', contactPerson: 'Rahul Sharma',
    creditLimit: 1000000, paymentTerms: 'Net 30',
  }});
  const account2 = await prisma.account.create({ data: {
    code: 'ACC-0002', name: 'NetConnect Solutions', type: 'DISTRIBUTOR',
    email: 'sales@netconnect.in', phone: '+91-80-1234-5678',
    address: 'Koramangala, Bengaluru, Karnataka 560034', contactPerson: 'Priya Nair',
    creditLimit: 500000, paymentTerms: 'Net 15',
  }});

  // Customers
  const cust1 = await prisma.customer.create({ data: {
    code: 'CUST-0001', name: 'ABC Enterprises', accountId: account1.id, type: 'ENTERPRISE',
    email: 'it@abcenterprises.com', phone: '+91-22-4567-8901',
    billingAddress: 'Nariman Point, Mumbai, Maharashtra 400021',
    shippingAddress: 'BKC, Mumbai, Maharashtra 400051',
    contactPerson: 'Vikram Patel', industry: 'Finance',
  }});
  await prisma.customer.create({ data: {
    code: 'CUST-0002', name: 'Green Retail Stores', accountId: account1.id, type: 'SMB',
    email: 'tech@greenretail.in', phone: '+91-22-9876-5432',
    billingAddress: 'Thane, Maharashtra 400601', shippingAddress: 'Thane, Maharashtra 400601',
    contactPerson: 'Sunita Joshi', industry: 'Retail',
  }});
  await prisma.customer.create({ data: {
    code: 'CUST-0003', name: 'CloudFirst Tech', accountId: account2.id, type: 'ENTERPRISE',
    email: 'procurement@cloudfirst.com', phone: '+91-80-9999-0000',
    billingAddress: 'Whitefield, Bengaluru, Karnataka 560066',
    shippingAddress: 'Whitefield, Bengaluru, Karnataka 560066',
    contactPerson: 'Anand Krishnan', industry: 'Technology',
  }});

  // Sample order
  const sdwanProduct = await prisma.product.findUnique({ where: { sku: 'SDWAN-ENT-1Y' } });
  const routerProduct = await prisma.product.findUnique({ where: { sku: 'RTR-CISCO-ISR4331' } });

  if (sdwanProduct && routerProduct) {
    const subtotal = 120000 + (85000 * 2);
    const taxAmount = subtotal * 0.18;
    await prisma.salesOrder.create({
      data: {
        orderNumber: 'SO-2026-0001', accountId: account1.id, customerId: cust1.id,
        status: 'CONFIRMED',
        billingAddress: 'Nariman Point, Mumbai, Maharashtra 400021',
        shippingAddress: 'BKC, Mumbai, Maharashtra 400051',
        subtotal, taxRate: 18, taxAmount, totalAmount: subtotal + taxAmount,
        notes: 'Initial SDWAN deployment for head office',
        lineItems: { create: [
          { productId: sdwanProduct.id, quantity: 1, unitPrice: 120000, discount: 0, lineTotal: 120000 },
          { productId: routerProduct.id, quantity: 2, unitPrice: 85000, discount: 0, lineTotal: 170000 },
        ]},
      },
    });
    await prisma.orderSequence.upsert({ where: { year: 2026 }, update: { lastN: 1 }, create: { year: 2026, lastN: 1 } });
  }

  console.log('Seed complete ✓');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
