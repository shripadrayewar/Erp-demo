import { Button, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { salesOrdersApi } from '../../api/salesOrders';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

const ORDER_STATUSES = ['DRAFT','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

export default function SalesOrderList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['sales-orders', status],
    queryFn: () => salesOrdersApi.getAll({ ...(status && { status }) }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Sales Orders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales-orders/new')}>New Order</Button>
      </div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select placeholder="Status" options={ORDER_STATUSES.map(v => ({ value: v, label: v }))} onChange={setStatus} style={{ width: 160 }} allowClear />
      </Space>
      <Table
        loading={isLoading}
        dataSource={data}
        rowKey="id"
        size="middle"
        columns={[
          { title: 'Order #', dataIndex: 'orderNumber', width: 150, render: (n, r) => <a onClick={() => navigate(`/sales-orders/${r.id}`)}>{n}</a> },
          { title: 'Account', dataIndex: ['account', 'name'] },
          { title: 'Customer', dataIndex: ['customer', 'name'] },
          { title: 'Date', dataIndex: 'orderDate', width: 110, render: v => new Date(v).toLocaleDateString() },
          { title: 'Status', dataIndex: 'status', render: v => <StatusBadge value={v} />, width: 120 },
          { title: 'Items', dataIndex: ['_count', 'lineItems'], width: 70, align: 'center' },
          { title: 'Total', dataIndex: 'totalAmount', width: 130, align: 'right', render: v => `₹${Number(v).toLocaleString()}` },
          {
            title: '', width: 60, render: (_, r) => (
              <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/sales-orders/${r.id}`)} />
            )
          },
        ]}
      />
    </div>
  );
}
