/**
 * QRPaymentComponent - VietQR Payment Display (3-Column Layout)
 *
 * Matches vn_qrpay wizard design with 3 columns:
 * - Left: Transaction Details
 * - Center: QR Code
 * - Right: Bank Account Info
 *
 * @version 2.0.0
 * @since 10.7.5
 *
 * Props:
 *   data: {
 *     bank_code: string,        // VietQR bank code (e.g., "MB", "VCB", "TCB")
 *     account_number: string,   // Bank account number
 *     account_holder: string,   // Account holder name
 *     amount: number,           // Payment amount
 *     description: string,      // Payment description/reference
 *     template: string          // QR template (default: "compact2")
 *   }
 */

import { useState, useEffect } from 'react'

// VietQR Bank IDs mapping
const BANK_INFO = {
  'MB': { name: 'MB Bank', fullName: 'Ngan hang TMCP Quan doi' },
  'VCB': { name: 'Vietcombank', fullName: 'Ngan hang TMCP Ngoai thuong' },
  'TCB': { name: 'Techcombank', fullName: 'Ngan hang TMCP Ky thuong' },
  'BIDV': { name: 'BIDV', fullName: 'Ngan hang TMCP Dau tu va Phat trien' },
  'VPB': { name: 'VPBank', fullName: 'Ngan hang TMCP Viet Nam Thinh Vuong' },
  'ACB': { name: 'ACB', fullName: 'Ngan hang TMCP A Chau' },
  'TPB': { name: 'TPBank', fullName: 'Ngan hang TMCP Tien Phong' },
  'STB': { name: 'Sacombank', fullName: 'Ngan hang TMCP Sai Gon Thuong Tin' },
  'VIB': { name: 'VIB', fullName: 'Ngan hang TMCP Quoc Te Viet Nam' },
  'SHB': { name: 'SHB', fullName: 'Ngan hang TMCP Sai Gon - Ha Noi' },
}

/**
 * Generate VietQR image URL
 */
function generateVietQRUrl(data) {
  const {
    bank_code = 'VCB',
    account_number = '',
    account_holder = '',
    amount = 0,
    description = '',
    template = 'compact2'
  } = data

  // Encode description and account name for URL
  const encodedDesc = encodeURIComponent(description)
  const encodedName = encodeURIComponent(account_holder)

  // VietQR URL format (v10.7.5: match vn_qrpay bank_account_qrpay.generate_qr_url)
  return `https://img.vietqr.io/image/${bank_code}-${account_number}-${template}.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND'
}

/**
 * Copy to clipboard helper
 */
async function copyToClipboard(text, setCopied) {
  try {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function QRPaymentComponent({ data, onAction }) {
  const [copiedField, setCopiedField] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3 * 60) // 3 minutes in seconds

  // Extract payment data (v10.7.5: match vn_qrpay field names)
  const {
    bank_code = 'VCB',
    account_number = '',
    account_holder = '',
    amount = 0,
    description = '',
    template = 'compact2'
  } = data || {}

  // Get bank info
  const bankInfo = BANK_INFO[bank_code] || { name: bank_code, fullName: bank_code }

  // Generate QR URL
  const qrUrl = generateVietQRUrl(data)

  // Expiry state (derived from countdown)
  const isExpired = timeLeft === 0

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Handle copy
  const handleCopy = (field, value) => {
    copyToClipboard(value, () => setCopiedField(field))
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="qr-payment-component bg-white rounded-lg shadow-xl overflow-hidden w-full" data-component="qr-payment">
      {/* Header - Material Design */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-medium text-blue-100 mb-2 uppercase tracking-wide">Mã đơn hàng</p>
            <h2 className="text-2xl font-bold font-mono">{description}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-blue-100 mb-2 uppercase tracking-wide">Thời gian còn lại</p>
            <div className={`text-3xl font-bold font-mono tabular-nums ${timeLeft <= 60 ? 'text-red-300' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout - Material Design */}
      <div className="flex gap-5 p-6">
        {/* Column 1: Transaction Details (Left) */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4 uppercase tracking-wide">
              <i className="fa fa-info-circle mr-2"></i>Chi tiết giao dịch
            </h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Mã đơn hàng:</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-mono text-gray-900">{description}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Ngân hàng:</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-900">{bankInfo.name}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Trạng thái:</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Chờ thanh toán</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: QR Code (Center) - Material Design */}
        <div className="flex-shrink-0 text-center">
          <div className="relative">
            {!imageError ? (
              <img
                src={qrUrl}
                alt="Mã thanh toán VietQR"
                className={`w-[450px] h-[450px] object-contain mx-auto rounded-lg shadow-md transition-opacity ${isExpired ? 'opacity-30' : 'opacity-100'}`}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-[450px] h-[450px] flex items-center justify-center bg-gray-100 rounded-lg mx-auto shadow-md transition-opacity ${isExpired ? 'opacity-30' : 'opacity-100'}`}>
                <div className="text-center">
                  <i className="fa fa-qrcode text-9xl text-gray-400"></i>
                  <p className="text-sm text-gray-500 mt-4 font-medium">Không thể tải mã QR</p>
                </div>
              </div>
            )}
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl px-6 py-4 border-2 border-red-500">
                  <p className="text-lg font-bold text-red-600">
                    <i className="fa fa-clock-o mr-2"></i>
                    Mã QR đã hết hạn
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Vui lòng làm mới để tiếp tục</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-4 font-medium">
            <i className="fa fa-mobile mr-2"></i>
            {isExpired ? 'Mã QR đã hết hạn' : 'Quét mã QR để thanh toán'}
          </p>
        </div>

        {/* Column 3: Bank Account Info (Right) - Material Design */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4 uppercase tracking-wide">
              <i className="fa fa-bank mr-2"></i>Thông tin tài khoản
            </h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Số tài khoản:</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-mono text-gray-900 font-semibold">{account_number}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Chủ tài khoản:</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-900 font-semibold">{account_holder}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Số tiền:</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-base text-red-600 font-bold">{formatCurrency(amount)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-600 font-medium">Nội dung:</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-gray-900 font-semibold">{description}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer - Material Design */}
      <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
        <div className="flex items-start">
          <i className="fa fa-info-circle text-amber-600 text-lg mt-0.5 mr-3"></i>
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vui lòng nhập <strong>chính xác</strong> nội dung chuyển khoản</li>
              <li>Đơn hàng sẽ được xử lý sau khi nhận được thanh toán</li>
              <li>Liên hệ hotline nếu cần hỗ trợ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons - Material Design */}
      <div className="px-6 py-5 flex gap-3 bg-gray-50">
        {isExpired ? (
          <>
            <button
              onClick={() => onAction?.({ type: 'refresh' })}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md"
            >
              <i className="fa fa-refresh mr-2"></i>
              Làm mới QR
            </button>
            <button
              onClick={() => onAction?.({ type: 'close' })}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <i className="fa fa-times mr-2"></i>
              Đóng
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onAction?.({ type: 'close' })}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <i className="fa fa-times mr-2"></i>
              Đóng
            </button>
            <button
              onClick={() => onAction?.({ type: 'intent', message: 'Tôi cần hỗ trợ thanh toán' })}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm"
            >
              <i className="fa fa-question-circle mr-2"></i>
              Hỗ trợ
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default QRPaymentComponent
