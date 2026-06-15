import { Button, Input, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { customersApi } from '../../api/customers';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

export default function CustomerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['customers', search, status, type],
    queryFn: () => customersApi.getAll({ ...(search && { search }), ...(status && { status }), ...(type && { type }) }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Customers</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/customers/new')}>New Customer</Button>
      </div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search placeholder="Search by name" onSearch={setSearch} onChange={e => !e.target.value && setSearch('')} style={{ width: 240 }} allowClear />
        <Select placeholder="Status" options={[{value:'ACTIVE',label:'Active'},{value:'INACTIVE',label:'Inactive'}]} onChange={setStatus} style={{ width: 130 }} allowClear />
        <Select placeholder="Type" options={[{value:'ENTERPRISE',label:'Enterprise'},{value:'SMB',label:'SMB'},{value:'RESIDENTIAL',label:'Residential'}]} onChange={setType} style={{ width: 140 }} allowClear />
      </Space>
      <Table
        loading={isLoading}
        dataSource={data}
        rowKey="id"
        size="middle"
        columns={[
          { title: 'Code', dataIndex: 'code', width: 110 },
          { title: 'Name', dataIndex: 'name', render: (name, r) => <a onClick={() => navigate(`/customers/${r.id}`)}>{name}</a> },
          { title: 'Account', dataIndex: ['account', 'name'], render: (name, r) => name ? <a onClick={() => navigate(`/accounts/${r.account?.id}`)}>{name}</a> : '-' },
          { title: 'Type', dataIndex: 'type', render: v => <StatusBadge value={v} />, width: 120 },
          { title: 'Contact', dataIndex: 'contactPerson', width: 160 },
          { title: 'Industry', dataIndex: 'industry', width: 130 },
          { title: 'Status', dataIndex: 'status', render: v => <StatusBadge value={v} />, width: 100 },
          {
            title: 'Actions', width: 100, render: (_, r) => (
              <Space>
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${r.id}`)} />
                <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/customers/${r.id}/edit`)} />
              </Space>
            )
          },
        ]}
      />
    </div>
  );
}
