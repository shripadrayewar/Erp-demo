import { Button, Card, Form, Input, Select, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { customersApi } from '../../api/customers';
import { accountsApi } from '../../api/accounts';

const { Title } = Typography;

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm();

  const { data: existing } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getOne(id!),
    enabled: isEdit,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll({ status: 'ACTIVE' }),
  });

  useEffect(() => {
    if (existing) form.setFieldsValue(existing);
    const preselectedAccount = searchParams.get('accountId');
    if (preselectedAccount) form.setFieldValue('accountId', preselectedAccount);
  }, [existing, form, searchParams]);

  const mutation = useMutation({
    mutationFn: (values: any) => isEdit ? customersApi.update(id!, values) : customersApi.create(values),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      message.success(isEdit ? 'Customer updated' : 'Customer created');
      navigate(`/customers/${data.id}`);
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  return (
    <Card style={{ maxWidth: 720 }}>
      <Title level={4}>{isEdit ? 'Edit Customer' : 'New Customer'}</Title>
      <Form form={form} layout="vertical" onFinish={mutation.mutate}>
        <Form.Item name="name" label="Customer Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="accountId" label="Account (Reseller)" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="Select account"
            filterOption={(input, opt) => String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={accounts.map(a => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
          />
        </Form.Item>
        <Form.Item name="type" label="Customer Type" rules={[{ required: true }]}>
          <Select options={[{value:'ENTERPRISE',label:'Enterprise'},{value:'SMB',label:'SMB'},{value:'RESIDENTIAL',label:'Residential'}]} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contactPerson" label="Contact Person" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="industry" label="Industry">
          <Input placeholder="e.g. Healthcare, Finance, Retail" />
        </Form.Item>
        <Form.Item name="billingAddress" label="Billing Address" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="shippingAddress" label="Shipping Address" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        {isEdit && (
          <Form.Item name="status" label="Status">
            <Select options={[{value:'ACTIVE',label:'Active'},{value:'INACTIVE',label:'Inactive'}]} />
          </Form.Item>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
