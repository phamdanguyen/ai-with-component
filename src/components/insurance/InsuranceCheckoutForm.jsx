/**
 * InsuranceCheckoutForm - Smart 4-Field Checkout
 *
 * Minimal friction checkout form for insurance purchase
 * Only 4 required fields: Name, CCCD, Phone, Plate Number
 *
 * Features:
 * - Auto-validation
 * - Vietnamese phone format
 * - CCCD 12-digit validation
 * - Plate number format helper
 *
 * @version 1.0.0
 * @since 9.7.0
 */

import { useState } from 'react'

/**
 * Validate Vietnamese phone number
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  return /^(0[3-9])[0-9]{8}$/.test(cleaned)
}

/**
 * Validate CCCD (12 digits)
 */
function isValidCCCD(cccd) {
  const cleaned = cccd.replace(/\D/g, '')
  return /^[0-9]{12}$/.test(cleaned)
}

/**
 * Validate plate number (basic format)
 */
function isValidPlate(plate) {
  // Accepts formats: 30A-12345, 30A12345, 30-A1-12345
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase()
  return cleaned.length >= 6 && cleaned.length <= 10
}

/**
 * Format phone for display
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 4) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`
}

function InsuranceCheckoutForm({
  selectedProvider,
  vehicleType,
  totalAmount,
  onSubmit,
  onCancel,
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_cccd: '',
    customer_phone: '',
    plate_number: ''
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Handle blur (field touched)
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field)
  }

  // Validate single field
  const validateField = (field) => {
    const value = formData[field]
    let error = null

    switch (field) {
      case 'customer_name':
        if (!value.trim()) error = 'Vui long nhap ho ten'
        else if (value.trim().length < 2) error = 'Ho ten qua ngan'
        break

      case 'customer_cccd':
        if (!value.trim()) error = 'Vui long nhap so CCCD'
        else if (!isValidCCCD(value)) error = 'CCCD phai co 12 chu so'
        break

      case 'customer_phone':
        if (!value.trim()) error = 'Vui long nhap so dien thoai'
        else if (!isValidPhone(value)) error = 'So dien thoai khong hop le'
        break

      case 'plate_number':
        if (!value.trim()) error = 'Vui long nhap bien so xe'
        else if (!isValidPlate(value)) error = 'Bien so khong hop le'
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  // Validate all fields
  const validateAll = () => {
    const fields = ['customer_name', 'customer_cccd', 'customer_phone', 'plate_number']
    let isValid = true

    fields.forEach(field => {
      if (!validateField(field)) isValid = false
      setTouched(prev => ({ ...prev, [field]: true }))
    })

    return isValid
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateAll()) return

    onSubmit({
      ...formData,
      provider: selectedProvider,
      vehicle_type: vehicleType,
      total_amount: totalAmount
    })
  }

  // Format amount for display
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className="insurance-checkout-form bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <h3 className="text-lg font-semibold">Hoan tat mua bao hiem</h3>
        <p className="text-sm opacity-90">
          {selectedProvider} - {vehicleType === 'car' ? 'O to' : 'Xe may'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ho va ten <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customer_name}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            onBlur={() => handleBlur('customer_name')}
            placeholder="Nguyen Van A"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200
                      ${errors.customer_name && touched.customer_name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.customer_name && touched.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
          )}
        </div>

        {/* CCCD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            So CCCD <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customer_cccd}
            onChange={(e) => handleChange('customer_cccd', e.target.value.replace(/\D/g, '').slice(0, 12))}
            onBlur={() => handleBlur('customer_cccd')}
            placeholder="001234567890"
            maxLength={12}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200 font-mono
                      ${errors.customer_cccd && touched.customer_cccd
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.customer_cccd && touched.customer_cccd && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_cccd}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            So dien thoai <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleChange('customer_phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            onBlur={() => handleBlur('customer_phone')}
            placeholder="0901234567"
            maxLength={10}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200 font-mono
                      ${errors.customer_phone && touched.customer_phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.customer_phone && touched.customer_phone && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
          )}
        </div>

        {/* Plate Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bien so xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.plate_number}
            onChange={(e) => handleChange('plate_number', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('plate_number')}
            placeholder="30A-12345"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200 font-mono uppercase
                      ${errors.plate_number && touched.plate_number
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.plate_number && touched.plate_number && (
            <p className="text-red-500 text-sm mt-1">{errors.plate_number}</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tong tien:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatAmount(totalAmount)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Bao gom thue, hieu luc 1 nam
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700
                     hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Huy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <i className="fa fa-spinner fa-spin mr-2"></i>
                Dang xu ly...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fa fa-credit-card mr-2"></i>
                Thanh toan
              </span>
            )}
          </button>
        </div>

      </form>

      {/* Footer Note */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-500 text-center">
          <i className="fa fa-lock text-green-600 mr-1"></i>
          Thong tin cua ban duoc bao mat an toan
        </p>
      </div>

    </div>
  )
}

export default InsuranceCheckoutForm
