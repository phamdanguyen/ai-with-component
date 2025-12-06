/* eslint-disable react/prop-types */
/**
 * Sprint C - Story C1.3: ESLint Cleanup
 * - Disabled react/prop-types for inline GenUI component rendering
 * - Components receive props from componentSpec.props which is dynamic JSON
 * - Type validation happens at runtime via component implementations
 */
import { useState, useEffect, useRef, useCallback } from 'react'
// Sprint C - Story C1.3: Removed unused apiService import
import SessionManager from '../shared/services/SessionManager'
import {
  TableComponent,
  ChartComponent,
  CardComponent,
  ListComponent,
  FormComponent,
  SlidesComponent,
  ReportComponent,
  ButtonComponent,
  GalleryComponent,
  QRPaymentComponent,
} from '../components/genui'
// Sprint B - Story B4.1: Removed CrayonRenderer (dead code - all types use legacy)
// Sprint B - Story B4.1: Removed shouldUseCrayon import (unused)
import {
  WelcomeScreen,
  TrustFooter,
  ChatInput,
  MessageBubble,
  TypingIndicator,
  ConversationSidebar,
  SuggestionChips,
  // Sprint C - Story C1.3: Removed unused MiniCart import
  ProductCarousel,
  OrderPanel,
  CalculatorPanel,
} from '../components/b2c'

/**
 * ExpandPage - B2C Customer Experience
 * Full-screen Super Chat with conversation sidebar (ChatGPT/Claude style)
 *
 * v8.13.0: B2C transformation
 * v8.14.0: Added ConversationSidebar with 2-column layout
 * v8.15.0: Improved session transfer with loading feedback
 * - Added conversation history sidebar
 * - Added new chat functionality
 * - Added responsive collapse for mobile
 * - Added loading state during session transfer
 * v10.7.2: Fixed session ID retrieval for cart operations
 * - All cart API calls (add, remove, checkout) now use SessionManager.getSessionId() directly
 * - Prevents null session ID timing issues when cart operations happen before sessionId state is set
 * - Session stored in 'ai_chat_session' localStorage key via SessionManager
 */
function ExpandPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingStatus, setTypingStatus] = useState('')
  const [sessionId, setSessionId] = useState(null)
  // Sprint B - Story B3.2: Use ref for synchronous session ID access (prevents race condition)
  const sessionIdRef = useRef(null)
  const [customerName, setCustomerName] = useState(null)
  // Sprint C - Story C1.3: Track transfer session for future features
  const [, setIsTransferSession] = useState(false)
  // Sprint C - Story C1.3: Track component data for future features
  const [, setHasComponentData] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isReturningVisitor, setIsReturningVisitor] = useState(false) // v9.6.0 AC7.3
  const [isTransferring, setIsTransferring] = useState(true) // v8.15.0: Loading state
  const [transferStatus, setTransferStatus] = useState('Dang khoi phuc phien...')
  const hasInitialized = useRef(false)
  const messagesEndRef = useRef(null)

  // Sidebar state
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768)

  // User auth state (for ConversationSidebar footer)
  const [userInfo, setUserInfo] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // v9.5.0: Dynamic config from init-config API
  const [initConfig, setInitConfig] = useState(null)

  // v9.7.0: Mini cart state (Task 4.4)
  const [cartData, setCartData] = useState({
    itemCount: 0,
    totalPrice: 0,
    items: []
  })

  // v9.8.0: Product carousel state (Task 5.0)
  // Vehicle Insurance ONLY - No health, travel, life insurance
  // Fetch products from database via API
  const [products, setProducts] = useState([])

  // v10.6.0: QR Payment state (E2E Integration)
  const [qrPaymentData, setQrPaymentData] = useState(null)
  // Sprint C - Story C1.3: checkoutLoading used in handleCheckout, suppress warning
  const [, setCheckoutLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Sprint B - Story B3.2: Helper to get session ID synchronously (prevents race condition)
  // Priority: 1) SessionManager (localStorage), 2) ref (synchronous), 3) state (async)
  const getCurrentSessionId = () => {
    return SessionManager.getSessionId() || sessionIdRef.current || sessionId
  }

  // Sprint B - Story B3.2: Helper to update session ID in both ref and state
  const updateSessionId = (newSessionId) => {
    sessionIdRef.current = newSessionId
    setSessionId(newSessionId)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // v9.5.0: Fetch init-config for dynamic suggestion chips
  useEffect(() => {
    const fetchInitConfig = async () => {
      try {
        const response = await fetch('/superchat/api/init-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params: {} })
        })
        const data = await response.json()
        if (data.result && data.result.success) {
          // Transform chips to format expected by WelcomeScreen
          const transformedConfig = {
            greeting_message: data.result.greeting_message,
            initial_chips: (data.result.initial_chips || []).map((chip, idx) => ({
              id: `chip-${idx}`,
              icon: chip.icon || 'circle',
              label: chip.label,
              message: chip.message || chip.label
            })),
            popular_questions: (data.result.popular_questions || []).map(q => q.question || q),
            welcome_config: data.result.welcome_config || {}
          }
          setInitConfig(transformedConfig)
          console.log('[ExpandPage] Loaded dynamic config:', transformedConfig.initial_chips?.length, 'chips')
        }
      } catch (err) {
        console.warn('[ExpandPage] Failed to load init config:', err.message)
      }
    }
    fetchInitConfig()
  }, [])

  // Fetch user info on mount (for ConversationSidebar footer)
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/superchat/api/user/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        const data = await response.json()

        // JSON-RPC format: data.result contains actual response
        if (data.result && data.result.success && data.result.is_logged_in) {
          setUserInfo(data.result.user)
        } else {
          setUserInfo(null)
        }
      } catch (error) {
        console.error('[ExpandPage] Failed to fetch user info:', error)
        setUserInfo(null)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // v10.7.2: Fetch cart data from sale.order (Task 1.4.3)
  // Sprint C - Story C1.3: Wrap in useCallback for stable reference
  const fetchCartData = useCallback(async () => {
    try {
      // Get session ID from SessionManager
      const currentSessionId = SessionManager.getSessionId() || sessionId
      if (!currentSessionId) {
        console.warn('[MiniCart] No session ID - cart will be empty')
        setCartData({ itemCount: 0, totalPrice: 0, items: [] })
        return
      }

      // Call new cart_get endpoint
      const response = await fetch('/superchat/api/cart/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: { session_id: currentSessionId }
        })
      })

      const data = await response.json()

      if (data.result && data.result.success) {
        const cartSummary = data.result.cart

        // Map backend structure to frontend structure
        const itemCount = cartSummary.item_count || 0
        const totalPrice = cartSummary.total || 0
        const items = (cartSummary.items || []).map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.qty,
          price: item.price,
          image_url: item.image_url
        }))

        setCartData({ itemCount, totalPrice, items })
        console.log('[MiniCart] Cart data updated from sale.order:', { itemCount, totalPrice, items })
      } else {
        console.warn('[MiniCart] Failed to fetch cart:', data.result?.error)
        setCartData({ itemCount: 0, totalPrice: 0, items: [] })
      }
    } catch (err) {
      console.warn('[MiniCart] Failed to fetch cart data:', err.message)
      setCartData({ itemCount: 0, totalPrice: 0, items: [] })
    }
  }, [sessionId])  // Sprint C - Story C1.3: Added sessionId dependency

  // v10.7.2: Fetch cart data on mount and when sessionId changes
  useEffect(() => {
    fetchCartData()
    // Refresh cart every 30 seconds
    const interval = setInterval(fetchCartData, 30000)
    return () => clearInterval(interval)
  }, [sessionId, fetchCartData]) // Sprint C - Story C1.3: Added fetchCartData dependency

  // v9.8.0: Fetch products from database (Task 5.3)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/superchat/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        })

        if (response.ok) {
          const data = await response.json()
          // v10.6.2: Handle JSON-RPC wrapper (data.result) from Odoo endpoints
          const result = data.result || data
          if (result.success && result.products) {
            setProducts(result.products)
            console.log('[ExpandPage] Loaded products from DB:', result.products.length)
          }
        } else {
          console.warn('[ExpandPage] Failed to fetch products, using empty list')
        }
      } catch (err) {
        console.warn('[ExpandPage] Product fetch error:', err.message)
      }
    }
    fetchProducts()
  }, [])

  // v9.8.0: ProductCarousel handlers (Task 5.0)
  const handleAddToCart = async (productId) => {
    try {
      console.log('[ProductCarousel] Adding product to cart:', productId)

      // Find product
      const product = products.find(p => p.id === productId)
      if (!product) return

      // v10.7.2: Get session ID directly from SessionManager (fixes null sessionId timing issue)
      const currentSessionId = SessionManager.getSessionId() || sessionId
      if (!currentSessionId) {
        console.error('[ProductCarousel] No session ID available')
        return
      }

      // v10.6.1: Use new JSON API endpoint (fixes FormData 415 error)
      const response = await fetch('/superchat/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: {
            session_id: currentSessionId,
            product_id: productId,
            quantity: 1
          }
        })
      })

      const data = await response.json()

      if (data.result && data.result.success) {
        // Refresh cart data immediately
        await fetchCartData()

        // Show success message in chat
        const successMsg = {
          role: 'assistant',
          content: `Da them ${product.name} vao gio hang! Kiem tra ben phai de xem don hang.`
        }
        setMessages(prev => [...prev, successMsg])
      } else {
        console.error('[ProductCarousel] Failed to add to cart:', data.result?.error)
      }
    } catch (err) {
      console.error('[ProductCarousel] Error adding to cart:', err)
    }
  }

  // v9.8.0: OrderPanel handlers (Task 5.1)
  const handleRemoveCartItem = async (itemId) => {
    try {
      console.log('[OrderPanel] Removing item from cart:', itemId)

      // v10.7.2: Get session ID directly from SessionManager
      const currentSessionId = SessionManager.getSessionId() || sessionId
      if (!currentSessionId) {
        console.error('[OrderPanel] No session ID available for cart remove')
        return
      }

      // v10.6.1: Use new JSON API endpoint
      const response = await fetch('/superchat/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: {
            session_id: currentSessionId,
            product_id: itemId
          }
        })
      })

      const data = await response.json()

      if (data.result && data.result.success) {
        // Refresh cart data
        await fetchCartData()
      } else {
        console.error('[OrderPanel] Failed to remove item:', data.result?.error)
      }
    } catch (err) {
      console.error('[OrderPanel] Error removing item:', err)
    }
  }

  const handleCheckout = async () => {
    console.log('[OrderPanel] Checkout clicked')

    if (!sessionId) {
      console.error('[Checkout] No session ID available')
      alert('Loi: Khong tim thay phien lam viec')
      return
    }

    if (cartData.itemCount === 0) {
      alert('Gio hang trong')
      return
    }

    setCheckoutLoading(true)

    try {
      // v10.7.2: Get session ID directly from SessionManager
      const currentSessionId = SessionManager.getSessionId() || sessionId
      if (!currentSessionId) {
        console.error('[Checkout] No session ID available')
        setCheckoutLoading(false)
        return
      }

      // Call checkout API
      const response = await fetch('/superchat/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: { session_id: currentSessionId }
        })
      })

      const data = await response.json()

      if (data.result && data.result.success) {
        const { order_name, order_total, qr_data } = data.result

        console.log('[Checkout] Success:', {
          order: order_name,
          total: order_total,
          qr: qr_data
        })

        // Save QR data for modal (Task 1.4)
        setQrPaymentData({
          orderName: order_name,
          orderTotal: order_total,
          qrData: qr_data
        })

        // Show QR modal
        setShowQRModal(true)

      } else {
        console.error('[Checkout] Failed:', data.result?.error)
        alert(`Loi thanh toan: ${data.result?.error || 'Unknown error'}`)
      }

    } catch (err) {
      console.error('[Checkout] Error:', err)
      alert('Loi ket noi server')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // v9.8.0: CalculatorPanel handlers (Task 5.2)
  const handleCalculate = (params) => {
    console.log('[CalculatorPanel] Calculation params:', params)
    // Calculator component handles calculation internally
  }

  const handleSubmitToAI = (params) => {
    console.log('[CalculatorPanel] Submitting to AI:', params)

    // Build message based on calculation params
    // Sprint C - Story C1.3: Use only result object (contains vehicleType, engineCC, coverageType)
    const { result } = params
    const message = `Toi muon mua bao hiem ${result.vehicleType} dung tich ${result.engineCC}, goi ${result.coverageType}. Phi da tinh la ${new Intl.NumberFormat('vi-VN').format(result.total)} VND. Vui long tu van chi tiet.`

    // Add to chat
    setInput(message)
    handleSend(message)
  }

  /**
   * Session Transfer: Read data from bubble chat on mount
   * v8.15.0: Enhanced with loading feedback
   */
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Start transfer process
    const processTransfer = async () => {
      try {
        setTransferStatus('Đang kiểm tra phiên...')
        await new Promise(r => setTimeout(r, 200)) // Small delay for visual feedback

        // 1. Check for session transfer from bubble chat
        const transferData = sessionStorage.getItem('superchat_session_transfer')

        if (transferData) {
          setTransferStatus('Đang khôi phục lịch sử trò chuyện...')
          await new Promise(r => setTimeout(r, 300))

          const { session_id, customer_name, messages: prevMessages, timestamp, transfer_version } = JSON.parse(transferData)

          console.log('[ExpandPage] Session transfer detected:', {
            session_id,
            customer_name,
            messageCount: prevMessages?.length || 0,
            timestamp: new Date(timestamp).toISOString(),
            transfer_version: transfer_version || 'legacy'
          })

          // Restore session state (Sprint B - Story B3.2: use updateSessionId)
          if (session_id) {
            updateSessionId(session_id)
          }
          if (customer_name) {
            setCustomerName(customer_name)
          }

          // Restore messages (convert from bubble format if needed)
          if (prevMessages && prevMessages.length > 0) {
            setTransferStatus(`Đang tải ${prevMessages.length} tin nhắn...`)
            await new Promise(r => setTimeout(r, 200))

            const convertedMessages = prevMessages.map(msg => ({
              role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
              content: msg.content || msg.text || '',
              thinking: msg.thinking || '',
              component: msg.component || null,
              timestamp: msg.timestamp || Date.now()
            }))
            setMessages(convertedMessages)
            setIsTransferSession(true)
            setShowWelcome(false) // Hide welcome if messages exist
          }

          // Clear transfer data (one-time use)
          sessionStorage.removeItem('superchat_session_transfer')

          setTransferStatus('Hoan tat!')
          console.log('[ExpandPage] Session restored successfully')
        } else {
          // No transfer - use SessionManager to create/restore session
          const session = SessionManager.getOrCreate('super')
          // Sprint B - Story B3.2: use updateSessionId
          updateSessionId(session.sessionId)
          console.log('[ExpandPage] Session initialized:', session.sessionId)
        }

        // 2. Check for component data from auto-expand
        const componentData = sessionStorage.getItem('superchat_component_data')
        const componentId = sessionStorage.getItem('superchat_component_id')

        // Also check URL parameter for component ID
        const urlParams = new URLSearchParams(window.location.search)
        const urlComponentId = urlParams.get('component')

        if (componentData) {
          // Component data passed via sessionStorage
          try {
            const parsedComponent = JSON.parse(componentData)
            console.log('[ExpandPage] Component data received:', {
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
            setHasComponentData(true)
            setShowWelcome(false)

            // Clear component data (one-time use)
            sessionStorage.removeItem('superchat_component_data')
            sessionStorage.removeItem('superchat_component_id')

          } catch (parseError) {
            console.error('[ExpandPage] Error parsing component data:', parseError)
          }
        } else if (urlComponentId) {
          // Component ID in URL - fetch from sessionStorage by ID
          const storedComponent = sessionStorage.getItem(urlComponentId)
          if (storedComponent) {
            try {
              const parsedComponent = JSON.parse(storedComponent)
              console.log('[ExpandPage] Component loaded from URL param:', {
                componentId: urlComponentId,
                type: parsedComponent.component_type
              })

              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Hien thi ${parsedComponent.component_type}:`,
                component: parsedComponent
              }])
              setHasComponentData(true)
              setShowWelcome(false)

            } catch (parseError) {
              console.error('[ExpandPage] Error parsing URL component:', parseError)
            }
          }
        }

        // 3. Check for returning visitor (v9.6.0 AC7.3)
        const lastVisit = localStorage.getItem('superchat_last_visit')
        const savedConversations = JSON.parse(localStorage.getItem('superchat_conversations') || '[]')
        if (lastVisit && savedConversations.length > 0) {
          setIsReturningVisitor(true)
          console.log('[ExpandPage] Returning visitor detected:', savedConversations.length, 'conversations')
        }
        localStorage.setItem('superchat_last_visit', Date.now().toString())

      } catch (error) {
        console.error('[ExpandPage] Error reading session transfer:', error)
        setTransferStatus('Co loi xay ra')
        // Fallback to new session (Sprint B - Story B3.2: use updateSessionId)
        updateSessionId(`superchat_expand_${Date.now()}`)
      } finally {
        // Hide loading overlay after a small delay
        setTimeout(() => {
          setIsTransferring(false)
        }, 300)
      }
    }

    // Execute the transfer process
    processTransfer()
  }, [])

  /**
   * v9.9.0: Handle URL query parameter 'message' (Task 7.4)
   * Auto-send message if message parameter exists in URL (from homepage search)
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const messageParam = urlParams.get('message')

    if (messageParam && messageParam.trim()) {
      console.log('[ExpandPage] Message parameter detected:', messageParam)

      // Set input value and hide welcome screen
      setInput(messageParam)
      setShowWelcome(false)

      // Auto-send after a short delay to ensure component is ready
      setTimeout(() => {
        handleSend(messageParam)
      }, 500)

      // Clear URL parameter to avoid re-sending on refresh
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
    // Sprint C - Story C1.3: Run only on mount (handleSend uses refs/state that are stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // v10.9.1: State for active inline form
  const [activeFormConfig, setActiveFormConfig] = useState(null)

  /**
   * Sprint B - Story B4.2: Unified Action Handler
   * Consolidates Gallery CTA, Suggestion clicks, and form actions into single handler
   * Replaces handleCrayonAction (removed in Story B4.1)
   *
   * @param {Object} action - Action object with type and data
   * @param {Object} item - Item context (product, form data, etc.)
   * @param {string} source - Source identifier ('gallery', 'suggestion', 'form')
   */
  // Sprint C - Story C1.3: Reserved for future unified action handling
  // eslint-disable-next-line no-unused-vars
  const handleComponentAction = async (action, item = null, source = 'unknown') => {
    console.log('[Action]', { type: action?.type || action?.action, item: item?.id, source })

    const actionType = action?.type || action?.action

    switch (actionType) {
      case 'buy':
      case 'add_to_cart': {
        const productId = item?.id || action?.actionData?.product_id
        if (productId) {
          const currentSessionId = SessionManager.getSessionId() || sessionId
          if (currentSessionId) {
            try {
              const response = await fetch('/superchat/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  params: {
                    session_id: currentSessionId,
                    product_id: productId,
                    quantity: 1
                  }
                })
              })
              const data = await response.json()
              if (data.result && data.result.success) {
                console.log('[Action] Added to cart:', productId)
                setCartData(prev => ({
                  itemCount: data.result.cart?.item_count || prev.itemCount + 1,
                  totalPrice: data.result.cart?.total_price || prev.totalPrice,
                  items: data.result.cart?.items || prev.items
                }))
                handleSend(`Da them ${item?.title || 'san pham'} vao gio hang`)
              } else {
                console.error('[Action] Cart add failed:', data)
                handleSend(`Toi muon mua san pham: ${item?.title || productId}`)
              }
            } catch (err) {
              console.error('[Action] Cart API error:', err)
              handleSend(`Toi muon mua san pham: ${item?.title || productId}`)
            }
          } else {
            handleSend(`Toi muon mua san pham: ${item?.title || productId}`)
          }
        }
        break
      }

      case 'detail':
      case 'view_detail': {
        const detailMsg = `Cho toi xem chi tiet san pham ID: ${item?.id || action?.actionData?.id}`
        setInput(detailMsg)
        setTimeout(() => handleSend(detailMsg), 100)
        break
      }

      case 'form':
      case 'show_form': {
        console.log('[Action] Form action triggered:', action)
        try {
          const currentSessionId = SessionManager.getSessionId() || sessionId
          const response = await fetch('/superchat/api/action/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                action_id: action.id || action.tool_code,
                action_type: 'form',
                item: item,
                context: { session_id: currentSessionId }
              }
            })
          })
          const data = await response.json()
          if (data.result?.show_form && data.result?.form_config) {
            setActiveFormConfig({
              ...data.result.form_config,
              item: item,
              onSubmit: async (formData) => {
                const submitResponse = await fetch('/superchat/api/form/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                      form_id: data.result.form_config.name,
                      data: formData,
                      context: { session_id: currentSessionId }
                    }
                  })
                })
                const submitData = await submitResponse.json()
                if (submitData.result?.success) {
                  setActiveFormConfig(null)
                  if (submitData.result.should_send_to_chat) {
                    setInput(submitData.result.message)
                    setTimeout(() => handleSend(submitData.result.message), 100)
                  }
                }
                return submitData.result
              },
              onCancel: () => setActiveFormConfig(null)
            })
          } else if (action.tool_code) {
            const formRequest = `Toi muon dien form ${action.tool_code}`
            setInput(formRequest)
            setTimeout(() => handleSend(formRequest), 100)
          }
        } catch (error) {
          console.error('[Action] Form action error:', error)
        }
        break
      }

      case 'instant': {
        console.log('[Action] Instant action triggered:', action)
        try {
          const currentSessionId = SessionManager.getSessionId() || sessionId
          const response = await fetch('/superchat/api/action/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                action_id: action.id,
                action_type: 'instant',
                item: item,
                context: { session_id: currentSessionId }
              }
            })
          })
          const data = await response.json()
          console.log('[Action] Instant action result:', data.result)
        } catch (error) {
          console.error('[Action] Instant action error:', error)
        }
        break
      }

      case 'intent': {
        const messageText = action.message || action.intent || ''
        if (messageText) {
          setInput(messageText)
          setTimeout(() => handleSend(messageText), 100)
        }
        break
      }

      case 'open_url': {
        const url = action.url
        const target = action.target || '_blank'
        if (url) {
          if (url.includes('/shop/cart/add')) {
            try {
              const urlObj = new URL(url, window.location.origin)
              const productId = urlObj.searchParams.get('product_id')
              const quantity = urlObj.searchParams.get('quantity') || '1'
              const currentSessionId = SessionManager.getSessionId() || sessionId
              if (currentSessionId && productId) {
                const response = await fetch('/superchat/api/cart/add', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    params: {
                      session_id: currentSessionId,
                      product_id: productId,
                      quantity: parseInt(quantity)
                    }
                  })
                })
                const data = await response.json()
                if (data.result && data.result.success) {
                  await fetchCartData()
                }
              }
            } catch (err) {
              console.error('[Action] Cart URL error:', err)
            }
          } else {
            window.open(url, target)
          }
        }
        break
      }

      case 'compare': {
        setInput(`So sanh san pham: ${item?.title || ''}`)
        break
      }

      case 'tool_direct': {
        const toolCode = action.tool_code
        const toolParams = action.tool_params || {}
        if (toolCode) {
          const toolRequest = `Thuc hien ${toolCode}: ${JSON.stringify(toolParams)}`
          setInput(toolRequest)
          setTimeout(() => handleSend(toolRequest), 100)
        }
        break
      }

      default: {
        console.warn('[Action] Unknown type:', actionType)
        const fallbackMsg = action?.message || action?.label || item?.title
        if (fallbackMsg) {
          setInput(fallbackMsg)
          setTimeout(() => handleSend(fallbackMsg), 100)
        }
      }
    }
  }

  /**
   * Sprint B - Story B4.1: Simplified component renderer
   * All component types now use legacy renderer (CrayonRenderer removed)
   * This simplifies the codebase and maintains consistency
   */
  const renderGenUIComponent = (componentSpec) => {
    console.log('[renderGenUIComponent] Called with:', componentSpec)
    if (!componentSpec || !componentSpec.component_type) {
      console.log('[renderGenUIComponent] Returning null - no componentSpec or component_type')
      return null
    }

    // Sprint B - Story B4.1: All types use legacy renderer (Crayon removed)
    return renderLegacyComponent(componentSpec)
  }

  /**
   * Legacy component renderer (for custom components and fallback)
   */
  const renderLegacyComponent = (componentSpec) => {
    console.log('[DEBUG renderLegacyComponent] Called with:', componentSpec)
    if (!componentSpec || !componentSpec.component_type) {
      console.log('[DEBUG renderLegacyComponent] Returning null - no componentSpec or component_type')
      return null
    }

    const { component_type, props = {} } = componentSpec
    console.log('[DEBUG renderLegacyComponent] component_type:', component_type)
    console.log('[DEBUG renderLegacyComponent] props:', props)

    switch (component_type) {
      case 'table':
        console.log('[DEBUG renderLegacyComponent] Rendering TableComponent')
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
              console.log('[GenUI Form] Submitted:', formData)
              const summary = Object.entries(formData)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
              setInput(`Form đã gửi: ${summary}`)
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
              console.log('[GenUI Button] Clicked:', props.label)
              setInput(`Nút đã nhấn: ${props.label}`)
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

      case 'gallery':
        return (
          <GalleryComponent
            title={props.title}
            items={props.items || []}
            layout={props.layout || 'grid'}
            columns={props.columns || 2}
            showPrice={props.showPrice !== false}
            showCTA={props.showCTA !== false}
            onItemClick={(item) => {
              console.log('[GenUI Gallery] Item clicked:', item)
              setInput(`Cho toi xem chi tiet san pham: ${item.title}`)
            }}
            onCTAClick={(item, cta) => {
              console.log('[GenUI Gallery] CTA clicked:', cta.action, item, cta.actionData)
              if (cta.action === 'detail') {
                // v9.3.5: View product details - use item.id for precise lookup
                const detailMessage = `Cho toi xem chi tiet san pham ID: ${item.id}`
                setInput(detailMessage)
                setTimeout(() => handleSend(detailMessage), 100)
              } else if (cta.action === 'buy') {
                // v14.0.8: Direct cart add with product_id from actionData
                // Bypass AI message - use cart API directly for reliability
                const productId = cta.actionData?.product_id || item.id
                if (productId) {
                  const currentSessionId = SessionManager.getSessionId() || sessionId
                  if (currentSessionId) {
                    // Add to cart directly via API
                    fetch('/superchat/api/cart/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        params: {
                          session_id: currentSessionId,
                          product_id: productId,
                          quantity: 1
                        }
                      })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.result && data.result.success) {
                        console.log('[GenUI Gallery] Added to cart:', productId)
                        // Update cart state
                        setCartData(prev => ({
                          itemCount: data.result.cart.item_count || prev.itemCount + 1,
                          totalPrice: data.result.cart.total_price || prev.totalPrice,
                          items: data.result.cart.items || prev.items
                        }))
                        // Send confirmation message to AI
                        handleSend(`Da them ${item.title} vao gio hang`)
                      } else {
                        console.error('[GenUI Gallery] Cart add failed:', data)
                        handleSend(`Toi muon mua san pham: ${item.title}`)
                      }
                    })
                    .catch(err => {
                      console.error('[GenUI Gallery] Cart API error:', err)
                      // Fallback to AI message
                      handleSend(`Toi muon mua san pham: ${item.title}`)
                    })
                  } else {
                    // No session - fallback to AI message
                    handleSend(`Toi muon mua san pham: ${item.title}`)
                  }
                } else {
                  // No product_id - fallback to AI message
                  handleSend(`Toi muon mua san pham: ${item.title}`)
                }
              } else if (cta.action === 'compare') {
                // Legacy: Compare action (rarely used, suggest use suggestion buttons instead)
                setInput(`So sanh san pham: ${item.title}`)
              }
            }}
            // v9.4.1: For form-type CTAs with ai_message submit mode
            onSendMessage={(message) => {
              console.log('[GenUI Gallery] Form submitted (ai_message):', message)
              setInput(message)
              setTimeout(() => handleSend(message), 100)
            }}
          />
        )

      case 'suggestions':
        // v9.4.0: Purchase buttons for insurance products
        console.log('[DEBUG GenUI] Rendering suggestions component')
        console.log('[DEBUG GenUI] Full props:', props)
        console.log('[DEBUG GenUI] Buttons count:', props.buttons ? props.buttons.length : 0)
        console.log('[DEBUG GenUI] Buttons data:', props.buttons)
        return (
          <SuggestionChips
            prompt={props.prompt}
            chips={props.buttons || []}
            onSelect={(suggestion) => {
              console.log('[GenUI Suggestions] Chip clicked:', suggestion)
              // v9.4.1: Handle suggestion objects with actions
              if (suggestion && suggestion.action && suggestion.action.type === 'open_url') {
                const url = suggestion.action.url
                // Purchase button - use AJAX (v10.6.1: fixes FormData 415 error)
                if (url.includes('/shop/cart/add')) {
                  // Sprint C - Story C1.3: IIFE for async cart add
                  (async () => {
                    try {
                      const urlObj = new URL(url, window.location.origin)
                      const productId = urlObj.searchParams.get('product_id')
                      const quantity = urlObj.searchParams.get('quantity') || '1'

                      // v10.7.2: Get session ID directly from SessionManager
                      const currentSessionId = SessionManager.getSessionId() || sessionId
                      if (!currentSessionId) {
                        console.error('[GenUI] No session ID available for cart add')
                        return
                      }

                      const response = await fetch('/superchat/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          params: {
                            session_id: currentSessionId,
                            product_id: productId,
                            quantity: parseInt(quantity)
                          }
                        })
                      })

                      const data = await response.json()

                      if (data.result && data.result.success) {
                        console.log('[ComponentRouter] Product added to cart')
                        await fetchCartData()
                      } else {
                        console.error('[ComponentRouter] Failed to add to cart:', data.result?.error)
                      }
                    } catch (err) {
                      console.error('[ComponentRouter] Error adding to cart:', err)
                    }
                  })()
                } else {
                  // Other URLs - navigate directly
                  window.location.href = url
                }
              } else if (suggestion && (suggestion.message || suggestion.label)) {
                // Fallback: regular suggestion - send to AI
                const promptText = suggestion.message || suggestion.label
                setInput(promptText)
                setTimeout(() => handleSend(promptText), 100)
              }
            }}
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

  /**
   * Handle suggestion click from WelcomeScreen
   * v9.4.0: Now handles both string prompts and suggestion objects with actions
   * v9.7.0: Use AJAX for cart add (stay on page, update mini cart immediately)
   */
  const handleSuggestionSelect = async (suggestion) => {
    // v9.4.0: Handle suggestion objects with actions (e.g., purchase buttons)
    if (typeof suggestion === 'object' && suggestion !== null) {
      // Check if this is a button with action
      if (suggestion.action && suggestion.action.type === 'open_url') {
        const url = suggestion.action.url

        // v9.7.0: Handle cart add with AJAX (Task 4.4.4)
        if (url.includes('/shop/cart/add')) {
          try {
            // Extract parameters from URL
            const urlObj = new URL(url, window.location.origin)
            const productId = urlObj.searchParams.get('product_id')
            const quantity = urlObj.searchParams.get('quantity') || '1'

            console.log('[Cart] Adding product to cart:', { productId, quantity })

            // v10.7.2: Get session ID directly from SessionManager
            const currentSessionId = SessionManager.getSessionId() || sessionId
            if (!currentSessionId) {
              console.error('[Cart] No session ID available for cart add')
              return
            }

            // v10.6.1: Use new JSON API endpoint (fixes FormData 415 error)
            const response = await fetch('/superchat/api/cart/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                params: {
                  session_id: currentSessionId,
                  product_id: productId,
                  quantity: parseInt(quantity)
                }
              })
            })

            const data = await response.json()

            if (data.result && data.result.success) {
              console.log('[Cart] Product added successfully')
              // Refresh mini cart immediately
              await fetchCartData()
              // Show success notification (optional - using AI message)
              const productName = suggestion.label?.replace('Mua ', '') || 'Sản phẩm'
              const successMsg = {
                role: 'assistant',
                content: `Da them ${productName} vao gio hang! Nhan vao icon gio hang ben phai de xem.`
              }
              setMessages(prev => [...prev, successMsg])
            } else {
              console.error('[Cart] Failed to add product:', data.result?.error)
            }
          } catch (err) {
            console.error('[Cart] Error adding to cart:', err)
          }
          return
        }

        // Fallback: navigate directly for non-cart URLs
        window.location.href = url
        return
      }
      // Otherwise, extract message/label and send to AI
      const promptText = suggestion.message || suggestion.label
      setInput(promptText)
      setShowWelcome(false)
      setTimeout(() => {
        handleSend(promptText)
      }, 100)
    } else {
      // Backward compatibility: handle string prompts
      setInput(suggestion)
      setShowWelcome(false)
      setTimeout(() => {
        handleSend(suggestion)
      }, 100)
    }
  }

  /**
   * Handle "Continue" button click (v9.6.0 AC7.3)
   * Load most recent conversation
   */
  const handleContinueConversation = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('superchat_conversations') || '[]')
      if (saved.length > 0) {
        const mostRecent = saved[0] // Most recent is first (unshift order)
        // Sprint B - Story B3.2: use updateSessionId
        updateSessionId(mostRecent.id)
        setMessages(mostRecent.messages || [])
        setShowWelcome(false)
        setActiveConversationId(mostRecent.id)
        console.log('[ExpandPage] Continued conversation:', mostRecent.id, mostRecent.messages.length, 'messages')
      }
    } catch (e) {
      console.error('[ExpandPage] Error loading conversation:', e)
    }
  }

  /**
   * Handle "Start New" button click (v9.6.0 AC7.3)
   * Reset everything and start fresh
   */
  const handleStartNew = () => {
    // Reset current session first (v9.6.0 AC7.3 - Force new session)
    SessionManager.reset()
    // Generate fresh session via SessionManager
    const session = SessionManager.getOrCreate('super')
    // Sprint B - Story B3.2: use updateSessionId
    updateSessionId(session.sessionId)
    setMessages([])
    setInput('')
    setShowWelcome(false) // Hide welcome, show empty chat
    setActiveConversationId(null)
    console.log('[ExpandPage] Started new conversation:', session.sessionId)
  }

  /**
   * Handle send message
   */
  const handleSend = async (directMessage = null) => {
    const messageText = directMessage || input
    if (!messageText.trim()) return

    const userMessage = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowWelcome(false)
    setTypingStatus('Dang ket noi...')

    // Call Unified Chat API endpoint (v9.4.0 - supports ui_components from tool results)
    try {
      const url = `/superchat/api/chat/stream`
      // Sprint B - Story B3.2: use getCurrentSessionId for synchronous access
      const currentSessionId = getCurrentSessionId() || `superchat_expand_${Date.now()}`
      const params = new URLSearchParams({
        message: messageText,
        session_id: currentSessionId,
        source: 'super',  // Track SuperChat as source
      })

      // Update session ID if not set (Sprint B - Story B3.2: use updateSessionId)
      if (!getCurrentSessionId()) {
        updateSessionId(currentSessionId)
      }

      const eventSource = new EventSource(`${url}?${params}`)
      // v8.15.0: Enhanced message structure with activities
      let assistantMessage = {
        role: 'assistant',
        content: '',
        thinking: '',
        activities: [],
        component: null
      }
      let messageIndex = messages.length + 1

      // Helper to update or add activity
      const updateActivity = (type, status, content) => {
        const existingIndex = assistantMessage.activities.findIndex(a => a.type === type)
        if (existingIndex >= 0) {
          assistantMessage.activities[existingIndex] = {
            ...assistantMessage.activities[existingIndex],
            status,
            content: assistantMessage.activities[existingIndex].content + (content || '')
          }
        } else {
          assistantMessage.activities.push({ type, status, content: content || '' })
        }
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // v9.2.1 DEBUG: Log all SSE events
          console.log('[SSE] Event received:', data.type, data)

          if (data.type === 'thinking') {
            setTypingStatus('Dang suy nghi...')
            // v8.15.0: Store as activity
            updateActivity('thinking', 'active', data.content)
            // Also keep legacy field for backward compatibility
            assistantMessage.thinking = (assistantMessage.thinking || '') + data.content
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
          } else if (data.type === 'rag' || data.type === 'retrieval') {
            // v8.15.0: RAG/Knowledge retrieval activity
            setTypingStatus('Dang tra cuu kien thuc...')
            updateActivity('rag', data.status || 'active', data.content)
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
          } else if (data.type === 'tool' || data.type === 'tools' || data.type === 'function_call') {
            // v8.15.0: Tool execution activity
            console.log('[SSE] Tools event - adding activity:', data)
            setTypingStatus('Dang thuc thi cong cu...')
            const toolContent = data.name ? `${data.name}: ${data.content || ''}` : data.content
            updateActivity('tools', data.status || 'active', toolContent)
            console.log('[SSE] Activities after update:', assistantMessage.activities)
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
          } else if (data.type === 'handoff') {
            // v8.15.0: Agent handoff activity
            setTypingStatus('Đang chuyển tiếp...')
            updateActivity('handoff', data.status || 'active', data.content)
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
          } else if (data.type === 'text') {
            setTypingStatus('Dang tra loi...')
            // Mark all active activities as completed when text starts
            assistantMessage.activities = assistantMessage.activities.map(a =>
              a.status === 'active' ? { ...a, status: 'completed' } : a
            )
            assistantMessage.content = (assistantMessage.content || '') + data.content
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
          } else if (data.type === 'component') {
            setTypingStatus('Dang tao noi dung...')
            console.log('[DEBUG SSE] Component event received:', data)
            console.log('[DEBUG SSE] Component type:', data.component_type)
            console.log('[DEBUG SSE] Component props:', data.props)
            console.log('[DEBUG SSE] messageIndex:', messageIndex)
            console.log('[DEBUG SSE] messages.length before update:', messages.length)
            if (data.props && data.props.buttons) {
              console.log('[DEBUG SSE] Component buttons count:', data.props.buttons.length)
              console.log('[DEBUG SSE] Component buttons:', data.props.buttons)
            }
            assistantMessage.component = data
            console.log('[DEBUG SSE] assistantMessage after setting component:', JSON.stringify(assistantMessage, null, 2))
            setMessages((prev) => {
              console.log('[DEBUG SSE] prev.length in setMessages:', prev.length)
              console.log('[DEBUG SSE] Updating messageIndex:', messageIndex, 'prev[messageIndex]:', prev[messageIndex])
              const newMessages = [...prev]
              const updatedMessage = { ...assistantMessage, activities: [...assistantMessage.activities] }
              console.log('[DEBUG SSE] updatedMessage.component:', updatedMessage.component)
              newMessages[messageIndex] = updatedMessage
              console.log('[DEBUG SSE] newMessages[messageIndex].component:', newMessages[messageIndex]?.component)
              return newMessages
            })
          } else if (data.type === 'suggestions') {
            // v9.1.0: Proactive AI suggestions
            console.log('[SSE] Suggestions received:', data.data)
            if (data.data && data.data.enabled && data.data.buttons && data.data.buttons.length > 0) {
              assistantMessage.suggestions = data.data
              setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
                return newMessages
              })
            }
          } else if (data.type === 'done') {
            // Mark all activities as completed
            assistantMessage.activities = assistantMessage.activities.map(a => ({ ...a, status: 'completed' }))
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
            eventSource.close()
            setIsLoading(false)
            setTypingStatus('')
          } else if (data.type === 'error') {
            assistantMessage.content = `Loi: ${data.error}`
            setMessages((prev) => {
              const newMessages = [...prev]
              newMessages[messageIndex] = { ...assistantMessage, activities: [...assistantMessage.activities] }
              return newMessages
            })
            eventSource.close()
            setIsLoading(false)
            setTypingStatus('')
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
            content: 'Loi ket noi. Vui long thu lai.',
          },
        ])
        setIsLoading(false)
        setTypingStatus('')
      }

      // Add placeholder message immediately
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Da xay ra loi. Vui long thu lai.',
        },
      ])
      setIsLoading(false)
      setTypingStatus('')
    }
  }

  /**
   * Handle human support request
   */
  const handleHumanSupport = () => {
    window.open('/contactus', '_blank')
  }

  /**
   * Handle suggestion button click
   * v9.1.0: Routes action types to appropriate handlers
   * v9.6.0: Enhanced fallback handling for buttons without action.type
   *
   * @param {string} buttonId - Button ID
   * @param {Object} action - Action object {type, ...}
   * @param {Object} structuredData - Additional tracking data (optional)
   */
  const handleSuggestionClick = (buttonId, action, structuredData = {}) => {
    console.log('[Suggestions] Button clicked:', buttonId, action, structuredData)

    // v9.6.0: Enhanced fallback - if no action.type, use button label as message
    if (!action || !action.type) {
      // Get label from structuredData or buttonId
      const buttonLabel = structuredData?.data?.button_label || buttonId || ''
      if (buttonLabel) {
        console.log('[Suggestions] Fallback: sending button label as message:', buttonLabel)
        setInput(buttonLabel)
        setTimeout(() => {
          handleSend(buttonLabel)
        }, 100)
        return
      }
      console.warn('[Suggestions] Invalid action and no fallback available:', action)
      return
    }

    const actionType = action.type

    if (actionType === 'intent') {
      // Send intent message to chat
      const messageText = action.message || action.intent || ''
      if (messageText) {
        setInput(messageText)
        // Auto-send after short delay
        setTimeout(() => {
          handleSend(messageText)
        }, 100)
      }
    } else if (actionType === 'show_form') {
      // Show form for tool - send as structured request
      const toolCode = action.tool_code
      if (toolCode) {
        const formRequest = `Toi muon dien form ${toolCode}`
        setInput(formRequest)
        setTimeout(() => {
          handleSend(formRequest)
        }, 100)
      }
    } else if (actionType === 'open_url') {
      // Open URL in new tab
      const url = action.url
      const target = action.target || '_blank'
      if (url) {
        window.open(url, target)
      }
    } else if (actionType === 'tool_direct') {
      // Direct tool execution - send structured message
      const toolCode = action.tool_code
      const toolParams = action.tool_params || {}
      if (toolCode) {
        const toolRequest = `Thuc hien ${toolCode}: ${JSON.stringify(toolParams)}`
        setInput(toolRequest)
        setTimeout(() => {
          handleSend(toolRequest)
        }, 100)
      }
    } else {
      // v9.6.0: Unknown action type - fallback to sending action type as message
      console.warn('[Suggestions] Unknown action type, using fallback:', actionType)
      const fallbackMessage = structuredData?.data?.button_label || buttonId || actionType
      if (fallbackMessage) {
        setInput(fallbackMessage)
        setTimeout(() => {
          handleSend(fallbackMessage)
        }, 100)
      }
    }
  }

  /**
   * Save current conversation to history
   */
  const saveCurrentConversation = () => {
    if (messages.length === 0 || !sessionId) return

    const firstUserMessage = messages.find(m => m.role === 'user')
    const title = firstUserMessage?.content?.substring(0, 50) || 'Cuộc trò chuyện mới'

    const newConversation = {
      id: sessionId,
      title: title + (title.length >= 50 ? '...' : ''),
      messages: messages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setConversations(prev => {
      const existing = prev.findIndex(c => c.id === sessionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...newConversation, created_at: prev[existing].created_at }
        return updated
      }
      return [newConversation, ...prev]
    })

    // Save to localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('superchat_conversations') || '[]')
      const existingIdx = saved.findIndex(c => c.id === sessionId)
      if (existingIdx >= 0) {
        saved[existingIdx] = newConversation
      } else {
        saved.unshift(newConversation)
      }
      // Keep only last 50 conversations
      localStorage.setItem('superchat_conversations', JSON.stringify(saved.slice(0, 50)))
    } catch (e) {
      console.error('[ExpandPage] Error saving conversation:', e)
    }
  }

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentConversation()
    }
    // Sprint C - Story C1.3: saveCurrentConversation uses sessionId/messages from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // Load conversations from localStorage on mount (v9.6.0 AC7.4: With expiry check)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('superchat_conversations') || '[]')

      // Filter out conversations older than 30 days (AC7.4)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const validConversations = saved.filter(c => {
        if (!c.created_at) return true // Keep if no timestamp (legacy)
        const createdTime = new Date(c.created_at).getTime()
        return createdTime > thirtyDaysAgo
      })

      // Update both state and localStorage if any expired
      if (validConversations.length !== saved.length) {
        const expiredCount = saved.length - validConversations.length
        console.log(`[ExpandPage] Removed ${expiredCount} expired conversations (30+ days old)`)
        localStorage.setItem('superchat_conversations', JSON.stringify(validConversations))
      }

      setConversations(validConversations)
    } catch (e) {
      console.error('[ExpandPage] Error loading conversations:', e)
    }
  }, [])

  /**
   * Handle new chat
   */
  const handleNewChat = () => {
    // Save current conversation before starting new
    saveCurrentConversation()

    // Reset state (Sprint B - Story B3.2: use updateSessionId)
    const newSessionId = `superchat_expand_${Date.now()}`
    updateSessionId(newSessionId)
    setActiveConversationId(null)
    setMessages([])
    setInput('')
    setShowWelcome(true)
    setIsLoading(false)
    setTypingStatus('')
  }

  /**
   * Handle select conversation
   */
  const handleSelectConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    // Save current before switching
    saveCurrentConversation()

    // Load selected conversation (Sprint B - Story B3.2: use updateSessionId)
    updateSessionId(conversation.id)
    setActiveConversationId(conversation.id)
    setMessages(conversation.messages || [])
    setShowWelcome(false)
    setInput('')
    setIsLoading(false)
    setTypingStatus('')
  }

  /**
   * Handle delete conversation
   */
  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))

    // Update localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('superchat_conversations') || '[]')
      const filtered = saved.filter(c => c.id !== conversationId)
      localStorage.setItem('superchat_conversations', JSON.stringify(filtered))
    } catch (e) {
      console.error('[ExpandPage] Error deleting conversation:', e)
    }

    // If deleted active conversation, start new chat
    if (conversationId === activeConversationId) {
      handleNewChat()
    }
  }

  /**
   * Handle clear all conversations (v9.6.0 AC7.4)
   */
  const handleClearAllConversations = () => {
    // Confirm before clearing
    if (!window.confirm('Xóa tất cả lịch sử trò chuyện? Hành động này không thể hoàn tác.')) {
      return
    }

    // Clear state and localStorage
    setConversations([])
    localStorage.removeItem('superchat_conversations')
    console.log('[ExpandPage] All conversations cleared')

    // Start new chat
    handleNewChat()
  }

  return (
    <div className="expand-page fixed inset-0 flex w-screen h-screen bg-gray-100 z-[9999]">
      {/* v8.15.0: Loading overlay during session transfer */}
      {isTransferring && (
        <div className="fixed inset-0 bg-white z-[10000] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-full h-full border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              Super Chat
            </div>
            <div className="text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              {transferStatus}
            </div>
          </div>
        </div>
      )}

      {/* v9.8.0: 3-Column Layout (Task 5.3) */}
      <div className="flex h-full w-full">
        {/* LEFT COLUMN (20%): ProductCarousel + ConversationSidebar */}
        <div className="w-1/5 flex flex-col h-full gap-2 p-2 bg-gray-50">
          {/* Product Carousel (Top 50%) */}
          <div className="h-1/2">
            <ProductCarousel
              products={products}
              onAddToCart={handleAddToCart}
              sessionId={sessionId}
            />
          </div>

          {/* Conversation Sidebar (Bottom 50%) - Default expanded, no collapse */}
          <div className="h-1/2">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
              onClearAll={handleClearAllConversations}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              userInfo={userInfo}
              userLoading={userLoading}
            />
          </div>
        </div>

        {/* MIDDLE COLUMN (60%): Main Chat Area */}
        <div className="w-3/5 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                className="lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <i className="fa fa-bars"></i>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                <i className="fa fa-robot text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Super Chat</h1>
                <p className="text-sm text-gray-500">
                  {isLoading && typingStatus ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {typingStatus}
                    </span>
                  ) : (
                    'Trợ lý AI sẵn sàng hỗ trợ bạn 24/7'
                  )}
                </p>
              </div>
            </div>
            <button
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              onClick={handleNewChat}
              title="Trò chuyện mới"
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {showWelcome && messages.length === 0 ? (
              <WelcomeScreen
                companyName="UniAI"
                customerName={customerName}
                onSuggestionSelect={handleSuggestionSelect}
                isReturningVisitor={isReturningVisitor}
                onContinueConversation={handleContinueConversation}
                onStartNew={handleStartNew}
                initConfig={initConfig}
              />
            ) : (
              <div className="p-6 space-y-4 max-w-5xl mx-auto">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    renderComponent={renderGenUIComponent}
                    isNew={index === messages.length - 1}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}
                {isLoading && (
                  <TypingIndicator status={typingStatus} />
                )}

                {/* v10.9.1: Inline Form for form actions */}
                {activeFormConfig && (
                  <div className="p-4 bg-white rounded-lg shadow-md border border-blue-200 mx-4 mb-4">
                    <FormComponent
                      title={activeFormConfig.title}
                      description={activeFormConfig.description}
                      fields={activeFormConfig.fields || []}
                      submitLabel={activeFormConfig.submit_label || 'Submit'}
                      onSubmit={async (formData) => {
                        if (activeFormConfig.onSubmit) {
                          await activeFormConfig.onSubmit(formData)
                        }
                      }}
                      onCancel={activeFormConfig.onCancel}
                      showCancel={activeFormConfig.show_cancel !== false}
                      cancelLabel={activeFormConfig.cancel_label || 'Cancel'}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200">
            <div className="max-w-5xl mx-auto">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => handleSend()}
                isLoading={isLoading}
                placeholder="Nhập tin nhắn của bạn..."
              />
            </div>
          </div>

          {/* Trust Footer */}
          <TrustFooter
            onHumanSupport={handleHumanSupport}
            rating={4.8}
            reviewCount={500}
          />
        </div>
        </div>

        {/* RIGHT COLUMN (20%): OrderPanel + CalculatorPanel */}
        <div className="w-1/5 flex flex-col h-full bg-white border-l border-gray-200">
          {/* Order Panel (Top 50%) */}
          <div className="h-1/2 border-b border-gray-200">
            <OrderPanel
              items={cartData.items}
              totalPrice={cartData.totalPrice}
              onRemoveItem={handleRemoveCartItem}
              onCheckout={handleCheckout}
            />
          </div>

          {/* Calculator Panel (Bottom 50%) */}
          <div className="h-1/2">
            <CalculatorPanel
              onCalculate={handleCalculate}
              onSubmitToAI={handleSubmitToAI}
            />
          </div>
        </div>
      </div> {/* End 3-column layout */}

      {/* QR Payment Modal (v10.6.0) */}
      {showQRModal && qrPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-[60vw]">
            {/* Close button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 z-10"
              title="Dong"
            >
              <i className="fa fa-times text-xl"></i>
            </button>

            {/* QR Payment Component */}
            <QRPaymentComponent
              data={{
                bank_code: qrPaymentData.qrData?.bank_code || 'VCB',
                account_number: qrPaymentData.qrData?.account_number || '',
                account_holder: qrPaymentData.qrData?.account_holder || 'NGUYEN VAN A',
                amount: Math.round((qrPaymentData.orderTotal || 0) * 1.1),
                description: qrPaymentData.orderName || 'Thanh toan don hang',
                template: qrPaymentData.qrData?.template || 'compact2'
              }}
              onAction={(action) => {
                console.log('[QRModal] Action:', action)
                if (action === 'paid') {
                  setShowQRModal(false)
                  alert('Cam on! Chung toi se xac nhan thanh toan trong vong 5 phut')
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpandPage
