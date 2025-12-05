import type { Meta, StoryObj } from '@storybook/react';
import { SlidesComponent } from './SlidesComponent';

const meta = {
  title: 'Components/Slides',
  component: SlidesComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SlidesComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const presentationSlides = [
  {
    id: '1',
    title: 'Welcome to Our Product',
    content: 'Discover how our solution can transform your business',
    backgroundColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    id: '2',
    title: 'Key Features',
    content: 'Powerful, easy to use, and scalable for any organization',
    backgroundColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    id: '3',
    title: 'Get Started Today',
    content: 'Join thousands of satisfied customers worldwide',
    backgroundColor: 'bg-gradient-to-br from-green-500 to-green-600',
  },
];

const imageSlides = [
  {
    id: '1',
    title: 'Mountain Peak',
    content: 'Experience breathtaking views',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Ocean Sunset',
    content: 'Relax and unwind',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Forest Trail',
    content: 'Nature awaits you',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
  },
];

const onboardingSlides = [
  {
    id: '1',
    title: '📋 Step 1: Setup',
    content: 'Configure your account and preferences',
    backgroundColor: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
  },
  {
    id: '2',
    title: '🎯 Step 2: Goals',
    content: 'Define your business objectives',
    backgroundColor: 'bg-gradient-to-br from-blue-400 to-blue-500',
  },
  {
    id: '3',
    title: '🚀 Step 3: Launch',
    content: 'Start using our platform',
    backgroundColor: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
  },
  {
    id: '4',
    title: '✨ Step 4: Grow',
    content: 'Scale your business with our tools',
    backgroundColor: 'bg-gradient-to-br from-teal-400 to-teal-500',
  },
];

export const BasicSlides: Story = {
  args: {
    title: 'Product Presentation',
    slides: presentationSlides,
  },
};

export const AutoPlaySlides: Story = {
  args: {
    title: 'Auto-Playing Presentation',
    slides: presentationSlides,
    autoPlay: true,
    autoPlayInterval: 2000,
  },
};

export const WithImages: Story = {
  args: {
    title: 'Travel Gallery',
    slides: imageSlides,
    showNavigationDots: true,
    showNavigationArrows: true,
  },
};

export const WithoutDots: Story = {
  args: {
    title: 'Minimal Slides',
    slides: presentationSlides,
    showNavigationDots: false,
  },
};

export const WithoutArrows: Story = {
  args: {
    title: 'Slides Without Arrows',
    slides: presentationSlides,
    showNavigationArrows: false,
  },
};

export const LargeHeight: Story = {
  args: {
    title: 'Full-Screen Presentation',
    slides: presentationSlides,
    height: 500,
    autoPlay: true,
    autoPlayInterval: 3000,
  },
};

export const OnboardingWalkthrough: Story = {
  args: {
    title: 'Getting Started Guide',
    slides: onboardingSlides,
    autoPlay: false,
    showNavigationArrows: true,
    showNavigationDots: true,
  },
};

export const SingleSlide: Story = {
  args: {
    title: 'Information Card',
    slides: [
      {
        id: '1',
        title: 'Important Notice',
        content: 'This is a single-slide presentation',
        backgroundColor: 'bg-gradient-to-br from-yellow-400 to-orange-400',
      },
    ],
  },
};

export const EmptySlides: Story = {
  args: {
    slides: [],
  },
};
