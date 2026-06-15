import { Button, Card, Col, Descriptions, Divider, Popconfirm, Row, Space, Table, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { salesOrdersApi } from '../../api/salesOrders';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

const NEXT_STATUSES: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirm Order',
  PROCESSING: 'Start Processing',
  SHIPPED: 'Mark Shipped',
  DELIVERED: 'Mark Delivered',
  CANCELLED: 'Cancel Order',
};

export default function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['sales-order', id],
    queryFn: () => salesOrdersApi.getOne(id!),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => salesOrdersApi.updateStatus(id!, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales-order', id] }); qc.invalidateQueries({ queryKey: ['sales-orders'] }); message.success('Status updated'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  const deleteOrder = useMutation({
    mutationFn: () => salesOrdersApi.remove(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales-orders'] }); message.success('Order deleted'); navigate('/sales-orders'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  if (isLoading || !order) return null;

  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')}>Back</Button>
        {nextStatuses.map(s => (
          <Button
            key={s}
            type={s === 'CANCELLED' ? 'default' : 'primary'}
            danger={s === 'CANCELLED'}
            loading={updateStatus.isPending}
            onClick={() => updateStatus.mutate(s)}
          >
            {STATUS_LABELS[s] ?? s}
          </Button>
        ))}
        {order.status === 'DRAFT' && (
          <Popconfirm title="Delete this draft order?" onConfirm={() => deleteOrder.mutate()} okText="Delete" okType="danger">
            <Button danger>Delete Draft</Button>
          </Popconfirm>
        )}
      </Space>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>{order.orderNumber}</Title>
              <StatusBadge value={order.status} />
            </div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Account">
                <a onClick={() => navigate(`/accounts/${order.account?.id}`)}>{order.account?.name} ({order.account?.code})</a>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                <a onClick={() => navigate(`/customers/${order.customer?.id}`)}>{order.customer?.name} ({order.customer?.code})</a>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">{new Date(order.orderDate).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Delivery Date">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Billing Address" span={2}>{order.billingAddress}</Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>{order.shippingAddress}</Descriptions.Item>
              {order.notes && <Descriptions.Item label="Notes" span={2}>{order.notes}</Descriptions.Item>}
            </Descriptions>
          </Card>

          <Card title="Line Items" style={{ marginTop: 16 }}>
            <Table
              dataSource={order.lineItems}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: 'SKU', dataIndex: ['product', 'sku'], width: 110 },
                { title: 'Product', dataIndex: ['product', 'name'] },
                { title: 'Category', dataIndex: ['product', 'category', 'name'], width: 130 },
                { title: 'Qty', dataIndex: 'quantity', width: 70, align: 'center' },
                { title: 'Unit Price', dataIndex: 'unitPrice', width: 120, align: 'right', render: v => `₹${Number(v).toLocaleString()}` },
                { title: 'Disc %', dataIndex: 'discount', width: 80, align: 'center', render: v => `${v}%` },
                { title: 'Line Total', dataIndex: 'lineTotal', width: 130, align: 'right', render: v => `₹${Number(v).toLocaleString()}` },
              ]}
            />
            <Divider />
            <div style={{ textAlign: 'right', paddingRight: 8 }}>
              <p>Subtotal: ₹{Number(order.subtotal).toLocaleString()}</p>
              <p>Tax ({Number(order.taxRate)}%): ₹{Number(order.taxAmount).toLocaleString()}</p>
              <Title level={5}>Total: ₹{Number(order.totalAmount).toLocaleString()}</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Order Info">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Created">{new Date(order.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{new Date((order as any).updatedAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Line Items">{order.lineItems?.length ?? 0}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
