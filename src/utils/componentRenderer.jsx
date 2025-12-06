// Component Renderer Utility v8.0.0
// Maps component specifications from backend to React components

import {
  TableComponent,
  ChartComponent,
  CardComponent,
  ListComponent,
  FormComponent,
  SlidesComponent,
  ReportComponent,
  ButtonComponent,
} from '@components/genui'

const componentMap = {
  table: TableComponent,
  chart: ChartComponent,
  card: CardComponent,
  list: ListComponent,
  form: FormComponent,
  slides: SlidesComponent,
  report: ReportComponent,
  button: ButtonComponent,
}

export function renderComponent(componentSpec) {
  const { type, props } = componentSpec

  if (!type || !componentMap[type]) {
    console.error('Unknown component type:', type)
    return null
  }

  const Component = componentMap[type]
  return <Component {...props} />
}

export function parseComponentFromResponse(response) {
  // TODO: Implement response parsing logic
  // This will transform LLM response into component specification

  // Example structure:
  // {
  //   type: 'table',
  //   props: {
  //     columns: ['Name', 'Price', 'Stock'],
  //     rows: [
  //       { Name: 'Product A', Price: '$100', Stock: 50 },
  //       { Name: 'Product B', Price: '$200', Stock: 30 },
  //     ]
  //   }
  // }

  return response
}

export function detectComponentType(content) {
  // Simple heuristics to detect component type from content
  // v8.0.0: Use ResponseTransformerService on backend for 3-layer detection

  const contentLower = content.toLowerCase()

  if (contentLower.includes('table') || contentLower.includes('columns')) {
    return 'table'
  }

  if (contentLower.includes('chart') || contentLower.includes('graph')) {
    return 'chart'
  }

  if (contentLower.includes('form') || contentLower.includes('input field')) {
    return 'form'
  }

  if (contentLower.includes('list') || contentLower.includes('items')) {
    return 'list'
  }

  if (contentLower.includes('card') || contentLower.includes('cards')) {
    return 'card'
  }

  if (contentLower.includes('slide') || contentLower.includes('presentation')) {
    return 'slides'
  }

  if (contentLower.includes('report') || contentLower.includes('summary')) {
    return 'report'
  }

  // v8.0.0: Add button detection
  if (contentLower.includes('click here') || contentLower.includes('button') ||
      contentLower.includes('subscribe') || contentLower.includes('download')) {
    return 'button'
  }

  return 'text'
}
