import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, theme } from 'antd';
import {
  TeamOutlined, UserOutlined, AppstoreOutlined, ShoppingCartOutlined, DashboardOutlined,
} from '@ant-design/icons';
import AccountList from './pages/accounts/AccountList';
import AccountDetail from './pages/accounts/AccountDetail';
import AccountForm from './pages/accounts/AccountForm';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import CustomerForm from './pages/customers/CustomerForm';
import InventoryPage from './pages/inventory/InventoryPage';
import SalesOrderList from './pages/sales-orders/SalesOrderList';
import SalesOrderDetail from './pages/sales-orders/SalesOrderDetail';
import SalesOrderCreate from './pages/sales-orders/SalesOrderCreate';
import Dashboard from './pages/Dashboard';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/accounts', icon: <TeamOutlined />, label: <Link to="/accounts">Accounts</Link> },
  { key: '/customers', icon: <UserOutlined />, label: <Link to="/customers">Customers</Link> },
  { key: '/inventory', icon: <AppstoreOutlined />, label: <Link to="/inventory">Inventory</Link> },
  { key: '/sales-orders', icon: <ShoppingCartOutlined />, label: <Link to="/sales-orders">Sales Orders</Link> },
];

export default function App() {
  const location = useLocation();
  const { token } = theme.useToken();
  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark" style={{ position: 'fixed', height: '100vh', left: 0, top: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Title level={5} style={{ color: '#fff', margin: 0, fontSize: 13, opacity: 0.6 }}>NESECURE</Title>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>ERP System</Title>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} style={{ marginTop: 8 }} />
      </Sider>
      <Layout style={{ marginLeft: 220 }}>
        <Header style={{ background: token.colorBgContainer, padding: '0 24px', borderBottom: `1px solid ${token.colorBorderSecondary}`, display: 'flex', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0, color: token.colorTextSecondary }}>
            Nesecure Telecom — ERP
          </Title>
        </Header>
        <Content style={{ padding: 24, background: token.colorBgLayout, minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/accounts/new" element={<AccountForm />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/accounts/:id/edit" element={<AccountForm />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/sales-orders" element={<SalesOrderList />} />
            <Route path="/sales-orders/new" element={<SalesOrderCreate />} />
            <Route path="/sales-orders/:id" element={<SalesOrderDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
