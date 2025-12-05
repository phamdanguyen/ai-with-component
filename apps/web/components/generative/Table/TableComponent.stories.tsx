import type { Meta, StoryObj } from '@storybook/react';
import { TableComponent } from './TableComponent';

const meta = {
  title: 'Components/Table',
  component: TableComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TableComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'age', label: 'Age', type: 'number' as const, sortable: true },
  { key: 'status', label: 'Status', type: 'status' as const },
];

const sampleData = [
  { name: 'Alice Johnson', email: 'alice@example.com', age: 28, status: 'active' },
  { name: 'Bob Smith', email: 'bob@example.com', age: 34, status: 'active' },
  { name: 'Carol Davis', email: 'carol@example.com', age: 29, status: 'inactive' },
  { name: 'David Lee', email: 'david@example.com', age: 45, status: 'active' },
  { name: 'Eve Wilson', email: 'eve@example.com', age: 31, status: 'active' },
];

export const BasicTable: Story = {
  args: {
    title: 'User Directory',
    columns: sampleColumns,
    data: sampleData,
  },
};

export const WithSorting: Story = {
  args: {
    title: 'Sortable Table',
    columns: sampleColumns,
    data: sampleData,
  },
};

export const WithPagination: Story = {
  args: {
    title: 'Table with Pagination',
    columns: sampleColumns,
    data: Array.from({ length: 25 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50 + 20),
      status: Math.random() > 0.5 ? 'active' : 'inactive',
    })),
    pagination: { enabled: true, pageSize: 5 },
  },
};

export const VariantWithoutStripes: Story = {
  args: {
    title: 'Table without Striped Rows',
    columns: sampleColumns,
    data: sampleData,
    striped: false,
  },
};

export const CompactTable: Story = {
  args: {
    title: 'Compact Table',
    columns: [
      { key: 'name', label: 'Name', width: '40%', sortable: true },
      { key: 'email', label: 'Email', width: '60%' },
    ],
    data: sampleData.slice(0, 3),
    maxHeight: 200,
  },
};

export const LargeDataset: Story = {
  args: {
    title: 'Large Dataset Table',
    columns: sampleColumns,
    data: Array.from({ length: 100 }, (_, i) => ({
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50 + 20),
      status: Math.random() > 0.5 ? 'active' : 'inactive',
    })),
    pagination: { enabled: true, pageSize: 10 },
    maxHeight: 400,
  },
};

export const EmptyTable: Story = {
  args: {
    title: 'Empty Table',
    columns: sampleColumns,
    data: [],
  },
};

const salesColumns = [
  { key: 'product', label: 'Product', sortable: true },
  { key: 'quantity', label: 'Quantity', type: 'number' as const, sortable: true },
  { key: 'price', label: 'Price', type: 'number' as const, sortable: true },
  { key: 'date', label: 'Date', type: 'date' as const, sortable: true },
];

const salesData = [
  { product: 'Laptop', quantity: 5, price: 1200, date: '2024-01-15' },
  { product: 'Monitor', quantity: 12, price: 350, date: '2024-01-20' },
  { product: 'Keyboard', quantity: 25, price: 75, date: '2024-02-01' },
  { product: 'Mouse', quantity: 30, price: 25, date: '2024-02-05' },
];

export const SalesTable: Story = {
  args: {
    title: 'Sales Report',
    columns: salesColumns,
    data: salesData,
    striped: true,
    hover: true,
  },
};
