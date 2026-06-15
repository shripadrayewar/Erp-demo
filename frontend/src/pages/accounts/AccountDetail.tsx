import { Button, Card, Col, Descriptions, Row, Space, Table, Tabs, Typography, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { accountsApi } from '../../api/accounts';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getOne(id!),
  });

  const deactivate = useMutation({
    mutationFn: () => accountsApi.remove(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); message.success('Account deactivated'); navigate('/accounts'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  if (isLoading || !account) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/accounts')}>Back</Button>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/accounts/${id}/edit`)}>Edit</Button>
        {account.status === 'ACTIVE' && (
          <Button danger onClick={() => deactivate.mutate()} loading={deactivate.isPending}>Deactivate</Button>
        )}
      </Space>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={4} style={{ marginBottom: 16 }}>{account.name} <StatusBadge value={account.status} /></Title>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Code">{account.code}</Descriptions.Item>
              <Descriptions.Item label="Type"><StatusBadge value={account.type} /></Descriptions.Item>
              <Descriptions.Item label="Email">{account.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{account.phone}</Descriptions.Item>
              <Descriptions.Item label="Contact Person">{account.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="Payment Terms">{account.paymentTerms}</Descriptions.Item>
              <Descriptions.Item label="Credit Limit" span={2}>₹{Number(account.creditLimit).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{account.address}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Descriptions column={1}>
              <Descriptions.Item label="Customers">{(account as any)._count?.customers ?? 0}</Descriptions.Item>
              <Descriptions.Item label="Total Orders">{(account as any)._count?.salesOrders ?? 0}</Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(account.createdAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        <Tabs items={[
          {
            key: 'customers', label: 'Customers',
            children: (
              <Table
                dataSource={(account as any).customers ?? []}
                rowKey="id" size="small"
                columns={[
                  { title: 'Code', dataIndex: 'code', width: 110 },
                  { title: 'Name', dataIndex: 'name', render: (name, r: any) => <a onClick={() => navigate(`/customers/${r.id}`)}>{name}</a> },
                  { title: 'Type', dataIndex: 'type', render: (v: string) => <StatusBadge value={v} /> },
                  { title: 'Status', dataIndex: 'status', render: (v: string) => <StatusBadge value={v} /> },
                ]}
              />
            )
          },
          {
            key: 'orders', label: 'Recent Orders',
            children: (
              <Table
                dataSource={(account as any).salesOrders ?? []}
                rowKey="id" size="small"
                columns={[
                  { title: 'Order #', dataIndex: 'orderNumber', render: (n: string, r: any) => <a onClick={() => navigate(`/sales-orders/${r.id}`)}>{n}</a> },
                  { title: 'Customer', dataIndex: ['customer', 'name'] },
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
