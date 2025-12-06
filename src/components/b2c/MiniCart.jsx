/**
 * MiniCart - Persistent mini shopping cart widget
 * Task 4.4: Visual reminder to encourage purchases
 *
 * Features:
 * - Fixed position on right side of chat
 * - Badge showing item count
 * - Dropdown with cart items on hover/click
 * - Total price display
 * - "View Cart" button
 *
 * @version 1.0.0
 * @since 2025-11-27
 */

import { useState, useEffect } from 'react'

/**
 * MiniCart Component
 *
 * @param {Object} props
 * @param {number} props.itemCount - Number of items in cart
 * @param {number} props.totalPrice - Total cart price (VND)
 * @param {Array} props.items - Cart items [{name, quantity, price}, ...]
 * @param {Function} props.onRefresh - Callback to refresh cart data
 */
function MiniCart({
  itemCount = 0,
  totalPrice = 0,
  items = [],
  onRefresh = null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Format price with thousand separators
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND'
  }

  // Handle cart click
  const handleCartClick = () => {
    if (itemCount > 0) {
      // Navigate to full cart page
      window.location.href = '/shop/cart'
    }
  }

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div
      className="mini-cart-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsOpen(false)
      }}
    >
      {/* Cart Icon with Badge */}
      <button
        className={`mini-cart-button ${isHovered ? 'hovered' : ''} ${itemCount > 0 ? 'has-items' : ''}`}
        onClick={toggleDropdown}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        {/* Shopping Cart Icon (FontAwesome) */}
        <i className="fa fa-shopping-cart"></i>

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span className="mini-cart-badge">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown Cart Items */}
      {(isOpen || isHovered) && itemCount > 0 && (
        <div className="mini-cart-dropdown">
          <div className="mini-cart-header">
            <h3>Giỏ hàng của bạn</h3>
            <span className="item-count">{itemCount} sản phẩm</span>
          </div>

          {/* Cart Items List */}
          <div className="mini-cart-items">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="mini-cart-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))
            ) : (
              <div className="mini-cart-loading">
                <i className="fa fa-spinner fa-spin"></i>
                <span>Đang tải...</span>
              </div>
            )}
          </div>

          {/* Cart Total */}
          <div className="mini-cart-total">
            <span className="total-label">Tổng cộng:</span>
            <span className="total-price">{formatPrice(totalPrice)}</span>
          </div>

          {/* View Cart Button */}
          <button
            className="mini-cart-view-btn"
            onClick={handleCartClick}
          >
            <i className="fa fa-shopping-bag"></i>
            Xem giỏ hàng
          </button>
        </div>
      )}

      {/* Empty Cart Message (optional tooltip) */}
      {isHovered && itemCount === 0 && (
        <div className="mini-cart-empty-tooltip">
          Giỏ hàng trống
        </div>
      )}

      <style jsx>{`
        .mini-cart-container {
          position: fixed;
          top: 120px;
          right: 24px;
          z-index: 1000;
        }

        .mini-cart-button {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mini-cart-button:hover,
        .mini-cart-button.hovered {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .mini-cart-button.has-items {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.8);
          }
        }

        .mini-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 12px;
          font-weight: bold;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .mini-cart-dropdown {
          position: absolute;
          top: 70px;
          right: 0;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mini-cart-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mini-cart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .item-count {
          font-size: 12px;
          color: #6b7280;
        }

        .mini-cart-items {
          max-height: 240px;
          overflow-y: auto;
          padding: 8px 16px;
        }

        .mini-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .mini-cart-item:last-child {
          border-bottom: none;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }

        .item-quantity {
          font-size: 12px;
          color: #9ca3af;
        }

        .item-price {
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
          white-space: nowrap;
        }

        .mini-cart-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          color: #9ca3af;
        }

        .mini-cart-total {
          padding: 16px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
        }

        .total-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .total-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .mini-cart-view-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mini-cart-view-btn:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6b4298 100%);
          transform: translateY(-2px);
        }

        .mini-cart-empty-tooltip {
          position: absolute;
          top: 70px;
          right: 0;
          padding: 8px 12px;
          background: #374151;
          color: white;
          font-size: 12px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .mini-cart-empty-tooltip::before {
          content: '';
          position: absolute;
          top: -6px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #374151;
        }

        /* Scrollbar styling */
        .mini-cart-items::-webkit-scrollbar {
          width: 6px;
        }

        .mini-cart-items::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .mini-cart-items::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .mini-cart-items::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

export default MiniCart
