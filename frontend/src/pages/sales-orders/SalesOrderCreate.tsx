import { useState } from 'react';
import { Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Space, Steps, Table, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../../api/accounts';
import { customersApi } from '../../api/customers';
import { inventoryApi } from '../../api/inventory';
import { salesOrdersApi } from '../../api/salesOrders';
import type { CreateOrderPayload } from '../../api/salesOrders';

const { Title, Text } = Typography;

export default function SalesOrderCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [headerData, setHeaderData] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [disc, setDisc] = useState(0);

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsApi.getAll({ status: 'ACTIVE' }) });
  const [selectedAccount, setSelectedAccount] = useState('');
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', selectedAccount],
    queryFn: () => customersApi.getAll({ accountId: selectedAccount, status: 'ACTIVE' }),
    enabled: Boolean(selectedAccount),
  });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => inventoryApi.getProducts({ status: 'ACTIVE' }) });

  const createOrder = useMutation({
    mutationFn: (payload: CreateOrderPayload) => salesOrdersApi.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sales-orders'] });
      message.success(`Order ${data.orderNumber} created`);
      navigate(`/sales-orders/${data.id}`);
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error creating order'),
  });

  const addLineItem = () => {
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;
    const existing = lineItems.find(l => l.productId === selectedProduct);
    if (existing) { message.warning('Product already added, edit quantity instead'); return; }
    const lineTotal = qty * Number(prod.unitPrice) * (1 - disc / 100);
    setLineItems([...lineItems, { productId: prod.id, productName: prod.name, sku: prod.sku, quantity: qty, unitPrice: Number(prod.unitPrice), discount: disc, lineTotal }]);
    setSelectedProduct('');
    setQty(1);
    setDisc(0);
  };

  const removeLineItem = (productId: string) => setLineItems(lineItems.filter(l => l.productId !== productId));

  const subtotal = lineItems.reduce((s, l) => s + l.lineTotal, 0);
  const taxRate = headerData?.taxRate ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const submit = () => {
    if (lineItems.length === 0) { message.error('Add at least one product'); return; }
    const payload: CreateOrderPayload = {
      accountId: headerData.accountId,
      customerId: headerData.customerId,
      billingAddress: headerData.billingAddress,
      shippingAddress: headerData.shippingAddress,
      taxRate: headerData.taxRate ?? 0,
      notes: headerData.notes,
      deliveryDate: headerData.deliveryDate?.toISOString(),
      lineItems: lineItems.map(({ productId, quantity, unitPrice, discount }) => ({ productId, quantity, unitPrice, discount })),
    };
    createOrder.mutate(payload);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')}>Back</Button>
      </Space>
      <Title level={4}>New Sales Order</Title>
      <Steps current={step} style={{ marginBottom: 24 }} items={[
        { title: 'Select Account & Customer' },
        { title: 'Add Products' },
        { title: 'Review & Submit' },
      ]} />

      {step === 0 && (
        <Card style={{ maxWidth: 720 }}>
          <Form form={form} layout="vertical" onFinish={values => { setHeaderData(values); setStep(1); }}>
            <Form.Item name="accountId" label="Account (Reseller)" rules={[{ required: true }]}>
              <Select showSearch placeholder="Select account"
                filterOption={(i, o) => String(o?.label ?? '').toLowerCase().includes(i.toLowerCase())}
                options={accounts.map(a => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
                onChange={v => { setSelectedAccount(v); form.setFieldValue('customerId', undefined); }} />
            </Form.Item>
            <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
              <Select showSearch placeholder="Select customer" disabled={!selectedAccount}
                filterOption={(i, o) => String(o?.label ?? '').toLowerCase().includes(i.toLowerCase())}
                options={customers.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }))} />
            </Form.Item>
            <Form.Item name="billingAddress" label="Billing Address" rules={[{ required: true }]}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="shippingAddress" label="Shipping Address" rules={[{ required: true }]}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="deliveryDate" label="Expected Delivery Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="taxRate" label="Tax Rate (%)">
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="e.g. 18" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit">Next: Add Products</Button>
          </Form>
        </Card>
      )}

      {step === 1 && (
        <div>
          <Card title="Add Products" style={{ marginBottom: 16 }}>
            <Space wrap style={{ marginBottom: 12 }}>
              <Select showSearch placeholder="Select product" style={{ width: 280 }} value={selectedProduct || undefined}
                onChange={v => { setSelectedProduct(v); const p = products.find(x => x.id === v); if (p) setQty(1); }}
                filterOption={(i, o) => String(o?.label ?? '').toLowerCase().includes(i.toLowerCase())}
                options={products.map(p => ({ value: p.id, label: `${p.sku} — ${p.name} (₹${Number(p.unitPrice).toLocaleString()})` }))} />
              <InputNumber min={1} value={qty} onChange={v => setQty(v ?? 1)} placeholder="Qty" style={{ width: 80 }} />
              <InputNumber min={0} max={100} value={disc} onChange={v => setDisc(v ?? 0)} placeholder="Disc %" style={{ width: 90 }} suffix="%" />
              <Button type="primary" icon={<PlusOutlined />} onClick={addLineItem} disabled={!selectedProduct}>Add</Button>
            </Space>
            <Table
              dataSource={lineItems}
              rowKey="productId" size="small"
              columns={[
                { title: 'SKU', dataIndex: 'sku', width: 110 },
                { title: 'Product', dataIndex: 'productName' },
                { title: 'Qty', dataIndex: 'quantity', width: 70, align: 'center' },
                { title: 'Unit Price', dataIndex: 'unitPrice', width: 110, align: 'right', render: v => `₹${v.toLocaleString()}` },
                { title: 'Disc %', dataIndex: 'discount', width: 80, align: 'center', render: v => `${v}%` },
                { title: 'Line Total', dataIndex: 'lineTotal', width: 120, align: 'right', render: v => `₹${v.toFixed(2)}` },
                { title: '', width: 50, render: (_, r) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeLineItem(r.productId)} /> },
              ]}
              footer={() => <Text strong>Subtotal: ₹{subtotal.toFixed(2)}</Text>}
            />
          </Card>
          <Space>
            <Button onClick={() => setStep(0)}>Back</Button>
            <Button type="primary" onClick={() => { if (lineItems.length === 0) { message.error('Add at least one product'); return; } setStep(2); }} disabled={lineItems.length === 0}>Review Order</Button>
          </Space>
        </div>
      )}

      {step === 2 && (
        <div>
          <Card title="Order Summary" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}><Text strong>Account:</Text> {accounts.find(a => a.id === headerData?.accountId)?.name}</Col>
              <Col span={12}><Text strong>Customer:</Text> {customers.find(c => c.id === headerData?.customerId)?.name}</Col>
              <Col span={24} style={{ marginTop: 8 }}><Text strong>Billing Address:</Text> {headerData?.billingAddress}</Col>
              <Col span={24} style={{ marginTop: 4 }}><Text strong>Shipping Address:</Text> {headerData?.shippingAddress}</Col>
              {headerData?.notes && <Col span={24} style={{ marginTop: 4 }}><Text strong>Notes:</Text> {headerData.notes}</Col>}
            </Row>
            <Divider />
            <Table
              dataSource={lineItems}
              rowKey="productId" size="small" pagination={false}
              columns={[
                { title: 'SKU', dataIndex: 'sku', width: 110 },
                { title: 'Product', dataIndex: 'productName' },
                { title: 'Qty', dataIndex: 'quantity', width: 70, align: 'center' },
                { title: 'Unit Price', dataIndex: 'unitPrice', width: 110, align: 'right', render: v => `₹${v.toLocaleString()}` },
                { title: 'Disc %', dataIndex: 'discount', width: 80, align: 'center', render: v => `${v}%` },
                { title: 'Line Total', dataIndex: 'lineTotal', width: 130, align: 'right', render: v => `₹${v.toFixed(2)}` },
              ]}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>Tax ({taxRate}%): ₹{taxAmount.toFixed(2)}</p>
              <Title level={5}>Total: ₹{total.toFixed(2)}</Title>
            </div>
          </Card>
          <Space>
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button type="primary" onClick={submit} loading={createOrder.isPending}>Confirm & Create Order</Button>
          </Space>
        </div>
      )}
    </div>
  );
}
