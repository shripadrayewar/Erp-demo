import { Button, Card, Form, Input, InputNumber, Select, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { accountsApi } from '../../api/accounts';

const { Title } = Typography;

export default function AccountForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm();

  const { data: existing } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getOne(id!),
    enabled: isEdit,
  });

  useEffect(() => { if (existing) form.setFieldsValue(existing); }, [existing, form]);

  const mutation = useMutation({
    mutationFn: (values: any) => isEdit ? accountsApi.update(id!, values) : accountsApi.create(values),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      message.success(isEdit ? 'Account updated' : 'Account created');
      navigate(`/accounts/${data.id}`);
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  return (
    <Card style={{ maxWidth: 720 }}>
      <Title level={4}>{isEdit ? 'Edit Account' : 'New Account'}</Title>
      <Form form={form} layout="vertical" onFinish={mutation.mutate}>
        <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. TechReseller Pvt Ltd" />
        </Form.Item>
        <Form.Item name="type" label="Account Type" rules={[{ required: true }]}>
          <Select options={[{value:'PARTNER',label:'Partner'},{value:'DISTRIBUTOR',label:'Distributor'},{value:'DIRECT',label:'Direct'}]} />
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
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="creditLimit" label="Credit Limit (₹)">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="paymentTerms" label="Payment Terms">
          <Select options={['Net 15','Net 30','Net 45','Net 60','Advance'].map(v => ({ value: v, label: v }))} />
        </Form.Item>
        {isEdit && (
          <Form.Item name="status" label="Status">
            <Select options={[{value:'ACTIVE',label:'Active'},{value:'INACTIVE',label:'Inactive'},{value:'SUSPENDED',label:'Suspended'}]} />
          </Form.Item>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Account'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
