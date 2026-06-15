import { useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tree, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import type { Category, Product } from '../../api/inventory';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

function buildTreeData(cats: Category[]): any[] {
  return cats.map(c => ({
    key: c.id,
    title: `${c.name} (${c._count?.products ?? 0} products)`,
    children: c.children ? buildTreeData(c.children) : [],
  }));
}

export default function InventoryPage() {
  const qc = useQueryClient();
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [prodModal, setProdModal] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [catForm] = Form.useForm();
  const [prodForm] = Form.useForm();

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: inventoryApi.getCategories });
  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products', search, filterCat, filterType],
    queryFn: () => inventoryApi.getProducts({ ...(search && { search }), ...(filterCat && { categoryId: filterCat }), ...(filterType && { type: filterType }) }),
  });

  const allCategories: Category[] = [];
  const flattenCats = (cats: Category[]) => cats.forEach(c => { allCategories.push(c); if (c.children) flattenCats(c.children); });
  flattenCats(categories);

  const saveCat = useMutation({
    mutationFn: (v: any) => catModal.editing ? inventoryApi.updateCategory(catModal.editing.id, v) : inventoryApi.createCategory(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setCatModal({ open: false }); catForm.resetFields(); message.success('Saved'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });
  const deleteCat = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); message.success('Deleted'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });
  const saveProd = useMutation({
    mutationFn: (v: any) => prodModal.editing ? inventoryApi.updateProduct(prodModal.editing.id, v) : inventoryApi.createProduct(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setProdModal({ open: false }); prodForm.resetFields(); message.success('Saved'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });
  const deactivateProd = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); message.success('Product deactivated'); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? 'Error'),
  });

  const openCatEdit = (cat?: Category) => {
    setCatModal({ open: true, editing: cat });
    catForm.setFieldsValue(cat ?? { name: '', description: '', parentId: null });
  };
  const openProdEdit = (prod?: Product) => {
    setProdModal({ open: true, editing: prod });
    prodForm.setFieldsValue(prod ?? { unit: 'each', stockQty: 0 });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Inventory</Title>
      <Row gutter={16}>
        <Col xs={24} lg={7}>
          <Card title="Categories" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openCatEdit()}>Add</Button>}>
            {categories.length === 0
              ? <p style={{ color: '#999' }}>No categories yet</p>
              : <Tree treeData={buildTreeData(categories)} defaultExpandAll />}
            <div style={{ marginTop: 12 }}>
              <Table
                dataSource={allCategories}
                rowKey="id" size="small" showHeader={false} pagination={false}
                columns={[
                  { dataIndex: 'name' },
                  {
                    width: 80, render: (_, r) => (
                      <Space>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openCatEdit(r)} />
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteCat.mutate(r.id)} />
                      </Space>
                    )
                  },
                ]}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card title="Products" extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openProdEdit()}>Add Product</Button>}>
            <Space style={{ marginBottom: 12 }} wrap>
              <Input.Search placeholder="Search" onSearch={setSearch} onChange={e => !e.target.value && setSearch('')} style={{ width: 200 }} allowClear />
              <Select placeholder="Category" style={{ width: 160 }} allowClear onChange={setFilterCat}
                options={allCategories.map(c => ({ value: c.id, label: c.name }))} />
              <Select placeholder="Type" style={{ width: 140 }} allowClear onChange={setFilterType}
                options={[{value:'PHYSICAL',label:'Physical'},{value:'SERVICE',label:'Service'},{value:'SUBSCRIPTION',label:'Subscription'}]} />
            </Space>
            <Table
              loading={prodLoading}
              dataSource={products}
              rowKey="id" size="small"
              columns={[
                { title: 'SKU', dataIndex: 'sku', width: 110 },
                { title: 'Name', dataIndex: 'name' },
                { title: 'Category', dataIndex: ['category', 'name'], width: 130 },
                { title: 'Type', dataIndex: 'type', render: v => <StatusBadge value={v} />, width: 110 },
                { title: 'Unit Price', dataIndex: 'unitPrice', render: v => `₹${Number(v).toLocaleString()}`, width: 110, align: 'right' },
                { title: 'Stock', dataIndex: 'stockQty', width: 70, align: 'center', render: (v, r) => r.type === 'PHYSICAL' ? v : '-' },
                { title: 'Status', dataIndex: 'status', render: v => <StatusBadge value={v} />, width: 90 },
                {
                  title: '', width: 80, render: (_, r) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openProdEdit(r)} />
                      {r.status === 'ACTIVE' && <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deactivateProd.mutate(r.id)} />}
                    </Space>
                  )
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal title={catModal.editing ? 'Edit Category' : 'New Category'} open={catModal.open}
        onOk={() => catForm.submit()} onCancel={() => setCatModal({ open: false })} confirmLoading={saveCat.isPending}>
        <Form form={catForm} layout="vertical" onFinish={saveCat.mutate} style={{ marginTop: 12 }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label="Parent Category">
            <Select allowClear options={allCategories.filter(c => !catModal.editing || c.id !== catModal.editing.id).map(c => ({ value: c.id, label: c.name }))} placeholder="None (top-level)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={prodModal.editing ? 'Edit Product' : 'New Product'} open={prodModal.open}
        onOk={() => prodForm.submit()} onCancel={() => setProdModal({ open: false })} confirmLoading={saveProd.isPending} width={600}>
        <Form form={prodForm} layout="vertical" onFinish={saveProd.mutate} style={{ marginTop: 12 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input disabled={Boolean(prodModal.editing)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                <Select options={allCategories.map(c => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select options={[{value:'PHYSICAL',label:'Physical'},{value:'SERVICE',label:'Service'},{value:'SUBSCRIPTION',label:'Subscription'}]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="unitPrice" label="Unit Price (₹)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="costPrice" label="Cost Price (₹)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Unit">
                <Select options={['each','license','port','GB','month','year','SIM'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'PHYSICAL' && (
              <Form.Item name="stockQty" label="Stock Quantity">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            )}
          </Form.Item>
          {prodModal.editing && (
            <Form.Item name="status" label="Status">
              <Select options={[{value:'ACTIVE',label:'Active'},{value:'INACTIVE',label:'Inactive'}]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
