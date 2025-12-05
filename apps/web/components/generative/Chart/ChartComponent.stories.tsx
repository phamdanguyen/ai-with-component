import type { Meta, StoryObj } from '@storybook/react';
import { ChartComponent } from './ChartComponent';

const meta = {
  title: 'Components/Chart',
  component: ChartComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChartComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const monthlyData = [
  { month: 'Jan', value: 400, revenue: 2400 },
  { month: 'Feb', value: 300, revenue: 2210 },
  { month: 'Mar', value: 200, revenue: 2290 },
  { month: 'Apr', value: 278, revenue: 2000 },
  { month: 'May', value: 189, revenue: 2181 },
  { month: 'Jun', value: 239, revenue: 2500 },
];

const productData = [
  { name: 'Product A', sales: 4000 },
  { name: 'Product B', sales: 3000 },
  { name: 'Product C', sales: 2000 },
  { name: 'Product D', sales: 2780 },
  { name: 'Product E', sales: 1890 },
];

export const LineChart: Story = {
  args: {
    title: 'Monthly Performance',
    chartType: 'line',
    data: monthlyData,
    xAxis: { key: 'month', label: 'Month' },
    yAxis: { key: 'value', label: 'Sales' },
    dataKey: 'value',
    showLegend: true,
    showTooltip: true,
  },
};

export const BarChart: Story = {
  args: {
    title: 'Sales by Product',
    chartType: 'bar',
    data: productData,
    xAxis: { key: 'name', label: 'Product' },
    yAxis: { key: 'sales', label: 'Sales' },
    dataKey: 'sales',
  },
};

export const AreaChart: Story = {
  args: {
    title: 'Revenue Trend',
    chartType: 'area',
    data: monthlyData,
    xAxis: { key: 'month' },
    yAxis: { key: 'revenue' },
    dataKey: 'revenue',
    colors: ['#10b981'],
  },
};

export const PieChart: Story = {
  args: {
    title: 'Market Share',
    chartType: 'pie',
    data: [
      { name: 'Market A', value: 400 },
      { name: 'Market B', value: 300 },
      { name: 'Market C', value: 200 },
      { name: 'Market D', value: 100 },
    ],
    xAxis: { key: 'name' },
    dataKey: 'value',
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
  },
};

export const ComboChart: Story = {
  args: {
    title: 'Combined Metrics',
    chartType: 'combo',
    data: monthlyData,
    xAxis: { key: 'month' },
    yAxis: { key: 'value' },
    dataKey: 'value',
    colors: ['#3b82f6', '#ef4444'],
  },
};

export const ChartWithoutLegend: Story = {
  args: {
    title: 'Simple Chart',
    chartType: 'line',
    data: monthlyData,
    xAxis: { key: 'month' },
    dataKey: 'value',
    showLegend: false,
  },
};

export const LargeChart: Story = {
  args: {
    title: 'Large Dataset Chart',
    chartType: 'area',
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 100,
    })),
    xAxis: { key: 'day' },
    dataKey: 'value',
    height: 400,
  },
};

export const CustomColors: Story = {
  args: {
    title: 'Custom Color Scheme',
    chartType: 'bar',
    data: productData,
    xAxis: { key: 'name' },
    dataKey: 'sales',
    colors: ['#ec4899', '#8b5cf6', '#06b6d4'],
  },
};

export const EmptyChart: Story = {
  args: {
    title: 'No Data',
    chartType: 'line',
    data: [],
  },
};
