import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { TeamOutlined, UserOutlined, AppstoreOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { accountsApi } from '../api/accounts';
import { customersApi } from '../api/customers';
import { inventoryApi } from '../api/inventory';
import { salesOrdersApi } from '../api/salesOrders';

const { Title } = Typography;

export default function Dashboard() {
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsApi.getAll() });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersApi.getAll() });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => inventoryApi.getProducts() });
  const { data: orders } = useQuery({ queryKey: ['sales-orders'], queryFn: () => salesOrdersApi.getAll() });

  const openOrders = orders?.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)) ?? [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Total Accounts" value={accounts?.length ?? 0} prefix={<TeamOutlined />} valueStyle={{ color: '#6366f1' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Total Customers" value={customers?.length ?? 0} prefix={<UserOutlined />} valueStyle={{ color: '#0ea5e9' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Products" value={products?.length ?? 0} prefix={<AppstoreOutlined />} valueStyle={{ color: '#10b981' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Open Orders" value={openOrders.length} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#f59e0b' }} /></Card>
        </Col>
      </Row>
    </div>
  );
}
