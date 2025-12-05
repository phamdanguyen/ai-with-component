import type { Meta, StoryObj } from '@storybook/react';
import { CardComponent } from './CardComponent';

const meta = {
  title: 'Components/Card',
  component: CardComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof CardComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    content: 'This is a default card with title, content, and footer.',
    footer: 'Footer text',
  },
};

export const Success: Story = {
  args: {
    title: '✓ Success',
    content: 'Operation completed successfully!',
    footer: 'Generated just now',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    title: '⚠ Warning',
    content: 'Please review this information before proceeding.',
    footer: 'Action required',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    title: '✗ Error',
    content: 'An error occurred while processing your request.',
    footer: 'Try again later',
    variant: 'error',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Important Update',
    content: 'New features have been added to your account.',
    footer: 'Learn more',
    icon: '📢',
    variant: 'default',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Detailed Information',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    footer: 'Read full article',
    variant: 'default',
  },
};

export const MinimalCard: Story = {
  args: {
    content: 'Just content without title or footer.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Confirm Action',
    content: 'Are you sure you want to proceed?',
    actions: [
      { label: 'Cancel' },
      { label: 'Confirm' },
    ],
    variant: 'warning',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Beautiful Landscape',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    content: 'A stunning mountain landscape photo.',
    footer: 'Unsplash image',
  },
};

export const ClickableCard: Story = {
  args: {
    title: 'Click Me!',
    content: 'This card is clickable and has hover effects.',
    icon: '👆',
    clickable: true,
    variant: 'info',
  },
};

export const Info: Story = {
  args: {
    title: 'ℹ️ Information',
    content: 'This is an info variant card for displaying information.',
    footer: 'Click for more details',
    variant: 'info',
  },
};
