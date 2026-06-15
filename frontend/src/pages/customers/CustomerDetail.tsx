import { Button, Card, Col, Descriptions, Row, Space, Table, Tabs, Typography, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { customersApi } from '../../api/customers';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getOne(id!),
  });

  const deactivate = useMutation({
    mutationFn: () => customersApi.remove(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); message.success('Customer deactivated'); navigate('/customers'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  if (isLoading || !customer) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>Back</Button>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/customers/${id}/edit`)}>Edit</Button>
        {customer.status === 'ACTIVE' && (
          <Button danger onClick={() => deactivate.mutate()} loading={deactivate.isPending}>Deactivate</Button>
        )}
      </Space>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={4} style={{ marginBottom: 16 }}>{customer.name} <StatusBadge value={customer.status} /></Title>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Code">{customer.code}</Descriptions.Item>
              <Descriptions.Item label="Type"><StatusBadge value={customer.type} /></Descriptions.Item>
              <Descriptions.Item label="Account">
                <a onClick={() => navigate(`/accounts/${customer.account?.id}`)}>{customer.account?.name}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Industry">{customer.industry ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
              <Descriptions.Item label="Contact Person">{customer.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(customer.createdAt).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Billing Address" span={2}>{customer.billingAddress}</Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>{customer.shippingAddress}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        <Tabs items={[
          {
            key: 'orders', label: 'Orders',
            children: (
              <Table
                dataSource={(customer as any).salesOrders ?? []}
                rowKey="id" size="small"
                columns={[
                  { title: 'Order #', dataIndex: 'orderNumber', render: (n: string, r: any) => <a onClick={() => navigate(`/sales-orders/${r.id}`)}>{n}</a> },
                  { title: 'Date', dataIndex: 'orderDate', render: (v: string) => new Date(v).toLocaleDateString() },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <StatusBadge value={v} /> },
                  { title: 'Total', dataIndex: 'totalAmount', render: (v: number) => `₹${Number(v).toLocaleString()}` },
                ]}
              />
            )
          },
        ]} />
      </Card>
    </div>
  );
}
