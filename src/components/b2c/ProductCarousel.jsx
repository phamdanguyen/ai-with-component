/**
 * ProductCarousel - Quick product selection carousel
 * Task 5.0: Left sidebar top panel for quick add to cart
 *
 * Features:
 * - Carousel navigation (arrow left/right)
 * - Product cards with image, name, price
 * - Quick add button → instant cart add
 * - Auto-scroll option
 * - Purple gradient theme
 * - v10.7.0: AI Personalization - Show personalized top 3 products
 * - v11.0.0: Behavioral Psychology Triggers (Phase 1 - P0)
 *   * Scarcity badges (stock count, trending)
 *   * Social proof counts (purchased_today, recently_viewed)
 *
 * @version 1.2.0
 * @since 2025-11-27
 * @updated 2025-12-03 - Phase 1 P0: Psychology Triggers
 */

import { useState, useEffect } from 'react'

/**
 * ProductCarousel Component
 *
 * @param {Object} props
 * @param {Array} props.products - Fallback generic products (if personalization fails)
 * @param {Function} props.onAddToCart - Callback when quick add clicked (productId)
 * @param {String} props.partnerId - Partner ID for personalization (optional)
 * @param {String} props.sessionId - Session ID for personalization (optional)
 */
function ProductCarousel({ products: fallbackProducts = [], onAddToCart, partnerId, sessionId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)
  const [personalizationInfo, setPersonalizationInfo] = useState(null)

  // Fetch personalized products on mount (v10.7.0)
  useEffect(() => {
    fetchPersonalizedProducts()
  }, [partnerId, sessionId])

  const fetchPersonalizedProducts = async () => {
    setIsLoadingPersonalized(true)

    try {
      // Call personalization API
      const response = await fetch('/superchat/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            partner_id: partnerId,
            session_id: sessionId,
          },
          id: Date.now(),
        }),
      })

      const data = await response.json()

      if (data.result && data.result.success) {
        const personalizedProducts = data.result.products || []

        if (personalizedProducts.length > 0) {
          // Use personalized products (top 3)
          const top3 = personalizedProducts.slice(0, 3).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            description: null, // Not provided by API
            // Phase 1 P0: Psychology triggers
            stock: p.stock || null, // Stock count for scarcity badge
            trending: p.trending || false, // Trending flag for hot badge
            purchased_today: p.purchased_today || 0, // Social proof count
            recently_viewed: p.recently_viewed || 0, // Real-time activity
          }))

          setProducts(top3)
          setPersonalizationInfo({
            confidence: data.result.confidence || 0,
            lastUpdated: data.result.last_updated,
            partnerName: data.result.partner_name,
          })

          console.log('[ProductCarousel] Loaded personalized products:', top3.length)
          return
        }
      }

      // Fallback: Use generic products if personalization failed or empty
      console.log('[ProductCarousel] Using fallback generic products')
      setProducts(fallbackProducts.slice(0, 3))
      setPersonalizationInfo(null)
    } catch (error) {
      console.error('[ProductCarousel] Failed to fetch personalized products:', error)
      // Fallback: Use generic products
      setProducts(fallbackProducts.slice(0, 3))
      setPersonalizationInfo(null)
    } finally {
      setIsLoadingPersonalized(false)
    }
  }

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (products.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  // Quick add to cart
  const handleQuickAdd = async () => {
    if (isAdding || !products[currentIndex]) return

    setIsAdding(true)
    try {
      if (onAddToCart) {
        await onAddToCart(products[currentIndex].id)
      }
    } finally {
      setTimeout(() => setIsAdding(false), 1000)
    }
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND'
  }

  if (products.length === 0) {
    return (
      <div className="product-carousel-empty">
        <i className="fa fa-box-open"></i>
        <p>Chua co san pham</p>

        <style jsx>{`
          .product-carousel-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #9ca3af;
            gap: 12px;
          }

          .product-carousel-empty i {
            font-size: 48px;
            opacity: 0.5;
          }

          .product-carousel-empty p {
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  const currentProduct = products[currentIndex]

  return (
    <div className="product-carousel">
      {/* Carousel Header */}
      <div className="carousel-header">
        <div className="header-title">
          <h3>{personalizationInfo ? 'Danh cho ban' : 'San pham noi bat'}</h3>
          {personalizationInfo && personalizationInfo.confidence > 0.3 && (
            <span className="personalized-badge" title={`AI Personalization (confidence: ${(personalizationInfo.confidence * 100).toFixed(0)}%)`}>
              <i className="fa fa-sparkles"></i> AI
            </span>
          )}
        </div>
        <div className="carousel-indicators">
          {products.map((_, idx) => (
            <span
              key={idx}
              className={`indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Product Card */}
      <div className="product-card">
        {/* Product Image with Navigation */}
        <div className="product-image">
          {currentProduct.image ? (
            <img src={currentProduct.image} alt={currentProduct.name} />
          ) : (
            <div className="image-placeholder">
              <i className="fa fa-image"></i>
            </div>
          )}

          {/* Navigation Arrows - Inside Image */}
          <div className="carousel-nav">
            <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous">
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="nav-btn next" onClick={handleNext} aria-label="Next">
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Phase 1 P0: Scarcity Badges */}
        {(currentProduct.stock || currentProduct.trending) && (
          <div className="scarcity-badges">
            {currentProduct.stock !== null && currentProduct.stock < 10 && (
              <span className="badge-scarcity">
                <i className="fa fa-fire"></i>
                Chi con {currentProduct.stock} suat
              </span>
            )}
            {currentProduct.trending && (
              <span className="badge-trending">
                <i className="fa fa-trending-up"></i>
                Dang hot
              </span>
            )}
          </div>
        )}

        {/* Product Info */}
        <div className="product-info">
          <h4 className="product-name">{currentProduct.name}</h4>
          {currentProduct.description && (
            <p className="product-description">{currentProduct.description}</p>
          )}
          <div className="product-price">{formatPrice(currentProduct.price)}</div>
        </div>

        {/* Phase 1 P0: Social Proof Widget */}
        {(currentProduct.purchased_today > 0 || currentProduct.recently_viewed > 0) && (
          <div className="social-proof-widget">
            {currentProduct.purchased_today > 0 && (
              <div className="proof-item">
                <i className="fa fa-users"></i>
                <span>{currentProduct.purchased_today} nguoi da mua hom nay</span>
              </div>
            )}
            {currentProduct.recently_viewed > 0 && (
              <div className="proof-item live">
                <i className="fa fa-eye"></i>
                <span>{currentProduct.recently_viewed} nguoi dang xem</span>
                <span className="live-indicator">●</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Add Button */}
        <button
          className={`quick-add-btn ${isAdding ? 'adding' : ''}`}
          onClick={handleQuickAdd}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <i className="fa fa-spinner fa-spin"></i>
              Dang them...
            </>
          ) : (
            <>
              <i className="fa fa-cart-plus"></i>
              Them vao gio
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .product-carousel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
          border-radius: 12px;
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        .carousel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .carousel-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .personalized-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
          cursor: help;
        }

        .personalized-badge i {
          font-size: 10px;
        }

        .carousel-indicators {
          display: flex;
          gap: 6px;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #667eea;
          width: 24px;
          border-radius: 4px;
        }

        .product-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .image-placeholder {
          font-size: 48px;
          color: #d1d5db;
        }

        .product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        .product-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
          margin-top: auto;
        }

        .quick-add-btn {
          width: 100%;
          padding: 12px;
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .quick-add-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .quick-add-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .quick-add-btn.adding {
          background: #f9fafb;
          border-color: #10b981;
          color: #10b981;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .nav-btn {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
        }

        .nav-btn.prev {
          left: 8px;
        }

        .nav-btn.next {
          right: 8px;
        }

        .nav-btn:hover {
          background: white;
          border-color: #667eea;
          color: #667eea;
          transform: scale(1.1);
        }

        /* Phase 1 P0: Scarcity Badges */
        .scarcity-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .badge-scarcity,
        .badge-trending {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .badge-scarcity {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          animation: pulse-scarcity 2s ease-in-out infinite;
        }

        .badge-scarcity i {
          font-size: 14px;
          animation: fire-flicker 1.5s ease-in-out infinite;
        }

        .badge-trending {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .badge-trending i {
          font-size: 13px;
        }

        @keyframes pulse-scarcity {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
          }
        }

        @keyframes fire-flicker {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Phase 1 P0: Social Proof Widget */
        .social-proof-widget {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .proof-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .proof-item i {
          font-size: 14px;
          color: #667eea;
        }

        .proof-item.live {
          color: #059669;
          font-weight: 500;
        }

        .proof-item.live i {
          color: #10b981;
        }

        .live-indicator {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-live 2s ease-in-out infinite;
          margin-left: 4px;
        }

        @keyframes pulse-live {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  )
}

export default ProductCarousel
