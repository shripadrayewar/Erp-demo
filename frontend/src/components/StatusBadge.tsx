import { Tag } from 'antd';

const statusColor: Record<string, string> = {
  ACTIVE: 'green', INACTIVE: 'default', SUSPENDED: 'red',
  DRAFT: 'default', CONFIRMED: 'blue', PROCESSING: 'orange',
  SHIPPED: 'cyan', DELIVERED: 'green', CANCELLED: 'red',
  PARTNER: 'purple', DISTRIBUTOR: 'geekblue', DIRECT: 'volcano',
  ENTERPRISE: 'blue', SMB: 'cyan', RESIDENTIAL: 'lime',
  PHYSICAL: 'orange', SERVICE: 'blue', SUBSCRIPTION: 'purple',
};

export default function StatusBadge({ value }: { value: string }) {
  return <Tag color={statusColor[value] ?? 'default'}>{value}</Tag>;
}
