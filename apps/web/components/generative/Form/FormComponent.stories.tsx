import type { Meta, StoryObj } from '@storybook/react';
import { FormComponent } from './FormComponent';

const meta = {
  title: 'Components/Form',
  component: FormComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicForm: Story = {
  args: {
    title: 'Contact Form',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'John Doe' },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'john@example.com',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Your message here...',
        rows: 4,
      },
    ],
    submitLabel: 'Send',
  },
};

export const RegistrationForm: Story = {
  args: {
    title: 'Create Account',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'johndoe',
        validation: { minLength: 3, maxLength: 20 },
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'john@example.com',
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        validation: { minLength: 8 },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        required: true,
        placeholder: '••••••••',
      },
      {
        name: 'agreeToTerms',
        label: 'I agree to the Terms of Service',
        type: 'checkbox',
        required: true,
      },
    ],
    submitLabel: 'Register',
  },
};

export const SurveyForm: Story = {
  args: {
    title: 'Customer Feedback Survey',
    fields: [
      {
        name: 'rating',
        label: 'How satisfied are you with our service?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Very Satisfied', value: '5' },
          { label: 'Satisfied', value: '4' },
          { label: 'Neutral', value: '3' },
          { label: 'Dissatisfied', value: '2' },
        ],
      },
      {
        name: 'recommend',
        label: 'Would you recommend us?',
        type: 'select',
        required: true,
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'Maybe', value: 'maybe' },
          { label: 'No', value: 'no' },
        ],
      },
      {
        name: 'feedback',
        label: 'Additional Comments',
        type: 'textarea',
        placeholder: 'Please share any feedback...',
        rows: 3,
      },
    ],
    submitLabel: 'Submit Survey',
  },
};

export const HorizontalLayout: Story = {
  args: {
    title: 'Search Form',
    layout: 'horizontal',
    fields: [
      {
        name: 'keyword',
        label: 'Keyword',
        type: 'text',
        placeholder: 'Search...',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'All', value: '' },
          { label: 'Products', value: 'products' },
          { label: 'Services', value: 'services' },
          { label: 'Articles', value: 'articles' },
        ],
      },
    ],
    submitLabel: 'Search',
    cancelLabel: 'Clear',
  },
};

export const AdvancedForm: Story = {
  args: {
    title: 'Advanced Booking Form',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        placeholder: '+1 (555) 000-0000',
        validation: { pattern: '^[0-9+\\-() ]{10,}$' },
      },
      {
        name: 'date',
        label: 'Preferred Date',
        type: 'date',
        required: true,
      },
      {
        name: 'time',
        label: 'Time Slot',
        type: 'select',
        required: true,
        options: [
          { label: '9:00 AM', value: '09:00' },
          { label: '10:00 AM', value: '10:00' },
          { label: '2:00 PM', value: '14:00' },
          { label: '4:00 PM', value: '16:00' },
        ],
      },
      {
        name: 'participants',
        label: 'Number of Participants',
        type: 'number',
        required: true,
        defaultValue: '1',
      },
      {
        name: 'specialRequests',
        label: 'Special Requests',
        type: 'textarea',
        placeholder: 'Any special requirements?',
      },
      {
        name: 'subscribe',
        label: 'Subscribe to our newsletter',
        type: 'checkbox',
      },
    ],
    submitLabel: 'Book Now',
  },
};

export const FormWithValidation: Story = {
  args: {
    title: 'Profile Update',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        validation: { minLength: 3, maxLength: 20 },
      },
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea',
        placeholder: 'Tell us about yourself',
        validation: { maxLength: 500 },
        rows: 3,
      },
      {
        name: 'website',
        label: 'Website URL',
        type: 'text',
        placeholder: 'https://example.com',
      },
      {
        name: 'privacyLevel',
        label: 'Privacy Level',
        type: 'select',
        required: true,
        options: [
          { label: 'Public', value: 'public' },
          { label: 'Friends Only', value: 'friends' },
          { label: 'Private', value: 'private' },
        ],
      },
    ],
    submitLabel: 'Update Profile',
  },
};

export const SimpleForm: Story = {
  args: {
    title: 'Newsletter Signup',
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your@email.com',
      },
    ],
    submitLabel: 'Subscribe',
    cancelLabel: undefined,
  },
};
