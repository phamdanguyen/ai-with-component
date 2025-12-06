import { useState, useEffect, useRef } from 'react'
import apiService from '../services/apiService'
// componentRenderer utility available if needed
// import { renderComponent } from '../utils/componentRenderer'
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

// Default greeting message
const DEFAULT_GREETING = {
  role: 'assistant',
  content: 'Hello! I can help you visualize data in multiple formats. Try asking me to create a table, chart, card, list, form, button, slides, or report.',
}

function PlaygroundPage() {
  const [messages, setMessages] = useState([DEFAULT_GREETING])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [customerName, setCustomerName] = useState(null)
  const [isTransferSession, setIsTransferSession] = useState(false)
  const [pendingComponent, setPendingComponent] = useState(null)
  const hasInitialized = useRef(false)

  /**
   * Session Transfer: Read data from bubble chat on mount
   * This enables smooth transition when user clicks "Expand" in bubble chat
   * Also handles component data for auto-expand feature (v8.12.0)
   */
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    try {
      // 1. Check for session transfer from bubble chat
      const transferData = sessionStorage.getItem('superchat_session_transfer')

      if (transferData) {
        const { session_id, customer_name, messages: prevMessages, timestamp } = JSON.parse(transferData)

        console.log('[SuperChat] Session transfer detected:', {
          session_id,
          customer_name,
          messageCount: prevMessages?.length || 0,
          timestamp: new Date(timestamp).toISOString()
        })

        // Restore session state
        if (session_id) {
          setSessionId(session_id)
        }
        if (customer_name) {
          setCustomerName(customer_name)
        }

        // Restore messages (convert from bubble format if needed)
        if (prevMessages && prevMessages.length > 0) {
          const convertedMessages = prevMessages.map(msg => ({
            role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
            content: msg.content || msg.text || '',
            thinking: msg.thinking || '',
            component: msg.component || null
          }))
          setMessages(convertedMessages)
          setIsTransferSession(true)
        }

        // Clear transfer data (one-time use)
        sessionStorage.removeItem('superchat_session_transfer')

        console.log('[SuperChat] Session restored successfully')
      } else {
        // No transfer - generate new session ID
        setSessionId(`superchat_${Date.now()}`)
        console.log('[SuperChat] New session started')
      }

      // 2. Check for component data from auto-expand (v8.12.0)
      const componentData = sessionStorage.getItem('superchat_component_data')
      const componentId = sessionStorage.getItem('superchat_component_id')

      // Also check URL parameter for component ID
      const urlParams = new URLSearchParams(window.location.search)
      const urlComponentId = urlParams.get('component')

      if (componentData) {
        // Component data passed via sessionStorage
        try {
          const parsedComponent = JSON.parse(componentData)
          console.log('[SuperChat] Component data received:', {
            componentId,
            type: parsedComponent.component_type,
            hasProps: !!parsedComponent.props
          })

          // Add component as a message
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Hien thi ${parsedComponent.component_type} tu bubble chat:`,
            component: parsedComponent
          }])

          // Clear component data (one-time use)
          sessionStorage.removeItem('superchat_component_data')
          sessionStorage.removeItem('superchat_component_id')

        } catch (parseError) {
          console.error('[SuperChat] Error parsing component data:', parseError)
        }
      } else if (urlComponentId) {
        // Component ID in URL - fetch from sessionStorage by ID
        const storedComponent = sessionStorage.getItem(urlComponentId)
        if (storedComponent) {
          try {
            const parsedComponent = JSON.parse(storedComponent)
            console.log('[SuperChat] Component loaded from URL param:', {
              componentId: urlComponentId,
              type: parsedComponent.component_type
            })

            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Hien thi ${parsedComponent.component_type}:`,
              component: parsedComponent
            }])

          } catch (parseError) {
            console.error('[SuperChat] Error parsing URL component:', parseError)
          }
        }
      }

    } catch (error) {
      console.error('[SuperChat] Error reading session transfer:', error)
      // Fallback to new session
      setSessionId(`superchat_${Date.now()}`)
    }
  }, [])

  /**
   * Render GenUI component based on component spec (v8.0.0)
   * Supports all 8 component types from ResponseTransformer
   */
  const renderGenUIComponent = (componentSpec) => {
    if (!componentSpec || !componentSpec.component_type) {
      return null
    }

    const { component_type, props = {} } = componentSpec

    switch (component_type) {
      case 'table':
        return (
          <TableComponent
            columns={props.columns || []}
            rows={props.rows || []}
            title={props.title}
            sortable={props.sortable}
            searchable={props.searchable}
          />
        )

      case 'chart':
        return (
          <ChartComponent
            chartType={props.chartType || props.type || 'bar'}
            data={props.data || []}
            title={props.title}
            colors={props.colors}
          />
        )

      case 'card':
        return (
          <CardComponent
            title={props.title}
            subtitle={props.subtitle}
            content={props.content}
            image={props.image}
            actions={props.actions}
          />
        )

      case 'list':
        return (
          <ListComponent
            items={props.items || []}
            title={props.title}
            ordered={props.ordered}
          />
        )

      case 'form':
        return (
          <FormComponent
            fields={props.fields || []}
            title={props.title}
            description={props.description}
            submitLabel={props.submitLabel}
            submitAction={props.submitAction || 'custom'}
            submitData={props.submitData}
            onSubmit={(formData) => {
              // v8.0.0: Send form submission back to chat as follow-up
              console.log('[GenUI Form] Submitted:', formData)
              const summary = Object.entries(formData)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
              setInput(`Form submitted with: ${summary}`)
            }}
          />
        )

      case 'button':
        return (
          <ButtonComponent
            label={props.label}
            action={props.action || 'custom'}
            actionData={props.actionData}
            variant={props.variant}
            icon={props.icon}
            size={props.size}
            onClick={() => {
              // v8.0.0: Handle button click - send to chat
              console.log('[GenUI Button] Clicked:', props.label)
              setInput(`Button clicked: ${props.label}`)
            }}
          />
        )

      case 'slides':
        return (
          <SlidesComponent
            slides={props.slides || []}
            title={props.title}
            autoPlay={props.autoPlay}
          />
        )

      case 'report':
        return (
          <ReportComponent
            sections={props.sections || []}
            title={props.title}
            summary={props.summary}
          />
        )

      default:
        console.warn(`Unknown component type: ${component_type}`)
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Unknown component type: {component_type}</p>
          </div>
        )
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const messageText = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Call SuperChat API endpoint (integrated with odoo_ai_chat orchestrator)
    try {
      const url = `/superchat/api/chat/stream`
      const currentSessionId = sessionId || `superchat_${Date.now()}`
      const params = new URLSearchParams({
        message: messageText,
        session_id: currentSessionId,
      })

      // Update session ID if not set
      if (!sessionId) {
        setSessionId(currentSessionId)
      }

      const eventSource = new EventSource(`${url}?${params}`)
      let assistantMessage = { role: 'assistant', content: '', thinking: '' }
      let messageIndex = messages.length + 1

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'thinking') {
            // Update thinking content
            assistantMessage.thinking = (assistantMessage.thinking || '') + data.content
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage }
              return newMessages
            })
          } else if (data.type === 'text') {
            // Update answer content
            assistantMessage.content = (assistantMessage.content || '') + data.content
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage }
              return newMessages
            })
          } else if (data.type === 'component') {
            // Component received
            assistantMessage.component = data
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage }
              return newMessages
            })
          } else if (data.type === 'done') {
            // Stream complete
            eventSource.close()
            setIsLoading(false)
          } else if (data.type === 'error') {
            // Error received
            assistantMessage.content = `Error: ${data.error}`
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage }
              return newMessages
            })
            eventSource.close()
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        eventSource.close()
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Connection error. Please try again.',
          },
        ])
        setIsLoading(false)
      }

      // Add placeholder message immediately
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred. Please try again.',
        },
      ])
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="mb-4">AI Playground</h1>
        <p className="text-lg text-gray-600">
          Interact with AI and see responses transform into beautiful UI components in real-time.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Thinking section (if available) */}
                {message.thinking && (
                  <div className="mb-3 pb-3 border-b border-gray-300">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Thinking...</p>
                    <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{message.thinking}</p>
                  </div>
                )}

                {/* Answer section */}
                <p className="whitespace-pre-wrap">{message.content}</p>

                {/* GenUI Component section (v8.0.0 - All 8 components) */}
                {message.component && (
                  <div className="mt-4 genui-container">
                    {renderGenUIComponent(message.component)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to create a table, chart, form, or any UI component..."
              className="input-field flex-1"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions - All 8 GenUI Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setInput('Show me top 10 products in a table')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Table</h3>
          <p className="text-sm text-gray-600">Interactive data table</p>
        </button>
        <button
          onClick={() => setInput('Create a bar chart of monthly revenue')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Chart</h3>
          <p className="text-sm text-gray-600">Bar, line, pie charts</p>
        </button>
        <button
          onClick={() => setInput('Show product details as a card')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Card</h3>
          <p className="text-sm text-gray-600">Content card with image</p>
        </button>
        <button
          onClick={() => setInput('List all features of the product')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">List</h3>
          <p className="text-sm text-gray-600">Bullet or numbered list</p>
        </button>
        <button
          onClick={() => setInput('Generate a customer registration form')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Form</h3>
          <p className="text-sm text-gray-600">Smart form with validation</p>
        </button>
        <button
          onClick={() => setInput('Create a subscribe button for newsletter')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Button</h3>
          <p className="text-sm text-gray-600">CTA with actions</p>
        </button>
        <button
          onClick={() => setInput('Create a product presentation with slides')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Slides</h3>
          <p className="text-sm text-gray-600">Carousel presentation</p>
        </button>
        <button
          onClick={() => setInput('Generate a sales report summary')}
          className="card text-left hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Report</h3>
          <p className="text-sm text-gray-600">Structured report view</p>
        </button>
      </div>
    </div>
  )
}

export default PlaygroundPage
