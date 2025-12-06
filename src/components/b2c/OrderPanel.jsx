/**
 * OrderPanel - Cart and checkout panel
 * Task 5.1: Right sidebar top panel for order summary and checkout
 *
 * Features:
 * - Cart items list with remove option
 * - Total price calculation
 * - QR payment button
 * - Empty cart state
 * - Order summary
 *
 * @version 1.0.0
 * @since 2025-11-27
 */

import { useState } from 'react'

/**
 * OrderPanel Component
 *
 * @param {Object} props
 * @param {Array} props.items - Cart items [{id, name, quantity, price}, ...]
 * @param {number} props.totalPrice - Total order price (VND)
 * @param {Function} props.onRemoveItem - Callback when remove item (itemId)
 * @param {Function} props.onCheckout - Callback when checkout button clicked
 */
function OrderPanel({
  items = [],
  totalPrice = 0,
  onRemoveItem,
  onCheckout
}) {
  const [removingItemId, setRemovingItemId] = useState(null)

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND'
  }

  // Handle remove item
  const handleRemove = async (itemId) => {
    if (removingItemId) return

    setRemovingItemId(itemId)
    try {
      if (onRemoveItem) {
        await onRemoveItem(itemId)
      }
    } finally {
      setRemovingItemId(null)
    }
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="order-panel">
        <div className="panel-header">
          <i className="fa fa-shopping-bag"></i>
          <h3>Đơn hàng</h3>
        </div>

        <div className="empty-state">
          <div className="empty-icon">
            <i className="fa fa-shopping-cart"></i>
          </div>
          <p className="empty-title">Giỏ hàng trống</p>
          <p className="empty-subtitle">Thêm sản phẩm để bắt đầu mua sắm!</p>
        </div>

        <style jsx>{`
          .order-panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: white;
            overflow: hidden;
          }

          .panel-header {
            padding: 16px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .panel-header i {
            font-size: 20px;
          }

          .panel-header h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }

          .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            gap: 12px;
          }

          .empty-icon {
            font-size: 64px;
            color: #e5e7eb;
            margin-bottom: 8px;
          }

          .empty-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin: 0;
          }

          .empty-subtitle {
            font-size: 14px;
            color: #9ca3af;
            margin: 0;
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="order-panel">
      {/* Header */}
      <div className="panel-header">
        <i className="fa fa-shopping-bag"></i>
        <h3>Đơn hàng</h3>
        <span className="item-badge">{items.length}</span>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h4 className="item-name">{item.name}</h4>
              <div className="item-details">
                <span className="item-quantity">SL: {item.quantity}</span>
                <span className="item-separator">×</span>
                <span className="item-unit-price">{formatPrice(item.price)}</span>
                <span className="item-separator">=</span>
                <span className="item-subtotal">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
            <button
              className="remove-btn"
              onClick={() => handleRemove(item.id)}
              disabled={removingItemId === item.id}
              aria-label="Remove item"
            >
              {removingItemId === item.id ? (
                <i className="fa fa-spinner fa-spin"></i>
              ) : (
                <i className="fa fa-times"></i>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="order-summary">
        <div className="summary-row subtotal">
          <span>Tạm tính:</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="summary-row tax">
          <span>Thuế (VAT 10%):</span>
          <span>{formatPrice(totalPrice * 0.1)}</span>
        </div>
        <div className="summary-row shipping">
          <span>Phí vận chuyển:</span>
          <span>Miễn phí</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-row total">
          <span>Tổng cộng:</span>
          <span>{formatPrice(totalPrice * 1.1)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button className="checkout-btn" onClick={onCheckout}>
        <i className="fa fa-qrcode"></i>
        Thanh toán QR
      </button>

      <style jsx>{`
        .order-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          overflow: hidden;
        }

        .panel-header {
          padding: 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .panel-header i {
          font-size: 20px;
        }

        .panel-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .item-badge {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          background: #f3f4f6;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-quantity {
          font-size: 13px;
          color: #6b7280;
        }

        .item-price {
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
        }

        .remove-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e5e7eb;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .remove-btn:hover:not(:disabled) {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .order-summary {
          padding: 16px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .summary-row.subtotal,
        .summary-row.shipping {
          color: #6b7280;
        }

        .summary-row.shipping span:last-child {
          color: #10b981;
          font-weight: 600;
        }

        .summary-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }

        .summary-row.total {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }

        .summary-row.total span:last-child {
          color: #667eea;
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .checkout-btn:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6b4298 100%);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .checkout-btn i {
          font-size: 20px;
        }

        /* Scrollbar styling */
        .cart-items::-webkit-scrollbar {
          width: 6px;
        }

        .cart-items::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .cart-items::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .cart-items::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

export default OrderPanel
