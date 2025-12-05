import type { Meta, StoryObj } from '@storybook/react';
import { ListComponent } from './ListComponent';

const meta = {
  title: 'Components/List',
  component: ListComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ListComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  { id: '1', title: 'First Item', description: 'This is the first item', icon: '📍' },
  { id: '2', title: 'Second Item', description: 'This is the second item', icon: '📌' },
  { id: '3', title: 'Third Item', description: 'This is the third item', icon: '📎' },
];

const todoItems = [
  { id: '1', title: 'Buy groceries', icon: '🛒', badge: 'today' },
  { id: '2', title: 'Complete project', icon: '💼', badge: 'urgent', badgeColor: 'red' },
  { id: '3', title: 'Call dentist', icon: '📞', badge: 'pending', badgeColor: 'yellow' },
  { id: '4', title: 'Exercise', icon: '🏃', badge: 'tomorrow' },
];

export const SimpleList: Story = {
  args: {
    title: 'Simple List',
    items: sampleItems,
    ordered: false,
  },
};

export const OrderedList: Story = {
  args: {
    title: 'Ordered List',
    items: sampleItems,
    ordered: true,
  },
};

export const CardVariant: Story = {
  args: {
    title: 'Card Variant',
    items: todoItems,
    variant: 'card',
  },
};

export const InteractiveVariant: Story = {
  args: {
    title: 'Interactive Variant',
    items: todoItems,
    variant: 'interactive',
  },
};

export const SelectableList: Story = {
  args: {
    title: 'Selectable List',
    items: todoItems,
    variant: 'card',
    selectable: true,
  },
};

export const SearchableList: Story = {
  args: {
    title: 'Searchable List',
    items: [
      { id: '1', title: 'Apple', icon: '🍎' },
      { id: '2', title: 'Banana', icon: '🍌' },
      { id: '3', title: 'Cherry', icon: '🍒' },
      { id: '4', title: 'Date', icon: '📅' },
      { id: '5', title: 'Elderberry', icon: '🫐' },
    ],
    variant: 'card',
    searchable: true,
  },
};

export const WithAvatars: Story = {
  args: {
    title: 'Team Members',
    items: [
      {
        id: '1',
        title: 'Alice Johnson',
        description: 'Product Manager',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      },
      {
        id: '2',
        title: 'Bob Smith',
        description: 'Senior Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      },
      {
        id: '3',
        title: 'Carol Davis',
        description: 'Designer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
      },
    ],
    variant: 'card',
  },
};

export const DisabledItems: Story = {
  args: {
    title: 'With Disabled Items',
    items: [
      { id: '1', title: 'Available', icon: '✓' },
      { id: '2', title: 'Unavailable', icon: '✗', disabled: true },
      { id: '3', title: 'Available', icon: '✓' },
    ],
    variant: 'interactive',
    selectable: true,
  },
};

export const EmptyList: Story = {
  args: {
    items: [],
    title: 'No items',
  },
};
