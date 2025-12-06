import { useState } from 'react'
import {
  TableComponent,
  ChartComponent,
  CardComponent,
  ListComponent,
  FormComponent,
  SlidesComponent,
  ReportComponent,
  ButtonComponent,
} from '../components/genui'

/**
 * DemoPage v8.0.0 - GenUI Components Showcase
 *
 * Interactive demo page showcasing all 8 GenUI components
 * with real sample data for demonstration purposes.
 */
function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState('table')

  // Sample data for each component type
  const sampleData = {
    table: {
      columns: ['Product', 'Price', 'Stock', 'Rating'],
      rows: [
        { Product: 'MacBook Pro 16"', Price: '$2,499', Stock: '45', Rating: '4.8' },
        { Product: 'iPhone 15 Pro', Price: '$999', Stock: '120', Rating: '4.9' },
        { Product: 'iPad Pro 12.9"', Price: '$1,099', Stock: '78', Rating: '4.7' },
        { Product: 'AirPods Pro 2', Price: '$249', Stock: '200', Rating: '4.6' },
        { Product: 'Apple Watch Ultra', Price: '$799', Stock: '55', Rating: '4.8' },
      ],
      title: 'Top Products Inventory',
    },
    chart: {
      chartType: 'bar',
      title: 'Monthly Revenue 2024',
      data: [
        { label: 'Jan', value: 45000 },
        { label: 'Feb', value: 52000 },
        { label: 'Mar', value: 48000 },
        { label: 'Apr', value: 61000 },
        { label: 'May', value: 55000 },
        { label: 'Jun', value: 67000 },
      ],
    },
    card: {
      title: 'MacBook Pro 16"',
      subtitle: 'Apple M3 Max - Space Black',
      content: 'The most powerful MacBook Pro ever. Up to 22 hours of battery life, stunning Liquid Retina XDR display, and the blazing-fast Apple M3 Max chip.',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=400',
    },
    list: {
      title: 'Product Features',
      items: [
        { title: 'M3 Max chip with 16-core CPU', description: 'Up to 40% faster than M1 Max' },
        { title: '48GB unified memory', description: 'For demanding pro workflows' },
        { title: '1TB SSD storage', description: 'Lightning-fast read/write speeds' },
        { title: '22-hour battery life', description: 'All-day power for any task' },
        { title: 'Liquid Retina XDR display', description: '3456x2234 resolution, ProMotion' },
      ],
      ordered: false,
    },
    form: {
      title: 'Customer Registration',
      description: 'Create your account to get started',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
        { name: 'company', label: 'Company Name', type: 'text', required: false },
        { name: 'terms', label: 'I agree to the Terms of Service', type: 'checkbox', required: true },
      ],
      submitLabel: 'Create Account',
    },
    button: {
      label: 'Subscribe to Newsletter',
      action: 'call_api',
      variant: 'primary',
      icon: 'mail',
      size: 'lg',
      actionData: {
        endpoint: '/api/subscribe',
        successMessage: 'Successfully subscribed!',
      },
    },
    slides: {
      title: 'Product Showcase',
      slides: [
        { title: 'Slide 1: Introduction', content: 'Welcome to our product showcase' },
        { title: 'Slide 2: Features', content: 'Key features and benefits' },
        { title: 'Slide 3: Pricing', content: 'Flexible pricing options' },
      ],
    },
    report: {
      title: 'Q4 Sales Report',
      subtitle: 'Overall performance exceeded targets by 15%',
      sections: [
        {
          title: 'Revenue Overview',
          type: 'metrics',
          metrics: [
            { label: 'Total Revenue', value: '$2.4M', change: '+18% YoY' },
            { label: 'Net Profit', value: '$890K', change: '+22% YoY' },
            { label: 'Avg Order Value', value: '$156', change: '+5% YoY' },
          ]
        },
        {
          title: 'Customer Acquisition',
          type: 'text',
          description: 'New customers this quarter',
          content: 'We acquired 1,240 new customers this quarter, representing a 25% increase year-over-year. Customer retention rate improved to 94%.'
        },
        {
          title: 'Top Products',
          type: 'list',
          items: [
            'MacBook Pro - 45% of total sales',
            'iPhone 15 Pro - 30% of total sales',
            'iPad Pro - 15% of total sales',
            'Accessories - 10% of total sales',
          ]
        },
      ],
      footer: 'Report generated automatically by GenUI v8.0.0',
    },
  }

  const demos = {
    table: {
      title: 'Interactive Table',
      description: 'Sortable, searchable data table with pagination',
      icon: 'grid',
    },
    chart: {
      title: 'Dynamic Chart',
      description: 'Bar, line, pie, and doughnut charts with Chart.js',
      icon: 'bar-chart',
    },
    card: {
      title: 'Content Card',
      description: 'Product cards with image, title, and actions',
      icon: 'square',
    },
    list: {
      title: 'Smart List',
      description: 'Bullet or numbered lists with descriptions',
      icon: 'list',
    },
    form: {
      title: 'Form Generator',
      description: 'Dynamic forms with validation and submission',
      icon: 'edit',
    },
    button: {
      title: 'Action Button',
      description: 'CTA buttons with various actions and styles',
      icon: 'mouse-pointer',
    },
    slides: {
      title: 'Slides/Carousel',
      description: 'Presentation slides with navigation',
      icon: 'layers',
    },
    report: {
      title: 'Report View',
      description: 'Structured reports with sections',
      icon: 'file-text',
    },
  }

  const renderDemoComponent = () => {
    const data = sampleData[selectedDemo]

    switch (selectedDemo) {
      case 'table':
        return <TableComponent {...data} />
      case 'chart':
        return <ChartComponent {...data} />
      case 'card':
        return <CardComponent {...data} />
      case 'list':
        return <ListComponent {...data} />
      case 'form':
        return <FormComponent {...data} onSubmit={(formData) => console.log('Form submitted:', formData)} />
      case 'button':
        return <ButtonComponent {...data} onClick={() => console.log('Button clicked')} />
      case 'slides':
        return <SlidesComponent {...data} />
      case 'report':
        return <ReportComponent {...data} />
      default:
        return <div className="text-gray-500">Select a component to preview</div>
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4">GenUI Components v8.0.0</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore all 8 GenUI components. Each component is dynamically rendered
          from AI responses using our 3-layer architecture.
        </p>
      </div>

      {/* Component Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {Object.keys(demos).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedDemo(key)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedDemo === key
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {demos[key].title}
          </button>
        ))}
      </div>

      {/* Demo Display */}
      <div className="card max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">{demos[selectedDemo].title}</h2>
          <p className="text-gray-600">{demos[selectedDemo].description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
          {renderDemoComponent()}
        </div>

        {/* Sample Data Preview */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              View component props (JSON)
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(sampleData[selectedDemo], null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">3-Layer GenUI Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">Layer 1</div>
              <div className="text-sm text-gray-600">GenUI JSON parsing from LLM structured output</div>
              <div className="text-xs text-gray-400 mt-2">Confidence: 1.0 - 0.85</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-1">Layer 2</div>
              <div className="text-sm text-gray-600">Regex extraction for tables, lists, charts</div>
              <div className="text-xs text-gray-400 mt-2">Confidence: 0.75 - 0.55</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-1">Layer 3</div>
              <div className="text-sm text-gray-600">LLM2 fallback with response caching</div>
              <div className="text-xs text-gray-400 mt-2">Confidence: Variable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPage
