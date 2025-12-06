/**
 * CalculatorPanel - Insurance premium calculator (Cars only)
 * Task 5.2: Right sidebar bottom panel for quick premium calculation
 *
 * Features:
 * - Radio button selection: TNDS vs Thân vỏ
 * - TNDS calculation based on seat count (Nghị định 67/2023/NĐ-CP)
 * - Body insurance calculation based on car value + depreciation
 * - Real-time premium calculation with accurate formulas
 * - Submit to AI for detailed quote
 * - Clean modern theme
 * - Responsive layout
 *
 * @version 2.0.0
 * @since 2025-11-27
 * @updated 2025-11-28 - Car-only accurate formulas
 */

import { useState } from 'react'

/**
 * CalculatorPanel Component
 *
 * @param {Object} props
 * @param {Function} props.onCalculate - Callback when calculate clicked (params object)
 * @param {Function} props.onSubmitToAI - Callback when submit to AI clicked (params + result)
 */
function CalculatorPanel({ onCalculate, onSubmitToAI }) {
  const [licensePlate, setLicensePlate] = useState('') // Biển số xe
  const [isLookingUp, setIsLookingUp] = useState(false) // Loading state for lookup
  const [lookupMessage, setLookupMessage] = useState('') // Message from lookup
  const [coverageType, setCoverageType] = useState('tnds') // 'tnds' or 'than-vo'
  const [seatCount, setSeatCount] = useState('5') // For TNDS: number of seats
  const [carValue, setCarValue] = useState('500000000') // For Thân vỏ: car value in VND
  const [carValueDisplay, setCarValueDisplay] = useState('500,000,000') // Formatted display value
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear().toString())
  const [result, setResult] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Format number with thousand separators
  const formatNumber = (value) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Handle car value input change
  const handleCarValueChange = (e) => {
    const input = e.target.value
    // Remove all non-digit characters
    const numericValue = input.replace(/[^0-9]/g, '')

    if (numericValue === '') {
      setCarValue('0')
      setCarValueDisplay('')
      return
    }

    // Update both actual value and display value
    setCarValue(numericValue)
    setCarValueDisplay(formatNumber(numericValue))
  }

  // Handle license plate lookup
  const handleLookup = async () => {
    if (!licensePlate.trim()) {
      setLookupMessage('Vui lòng nhập biển số xe')
      return
    }

    setIsLookingUp(true)
    setLookupMessage('')

    try {
      const response = await fetch('/superchat/lookup_vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_plate: licensePlate.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (data.success && data.vehicle) {
        // Auto-fill vehicle information
        const vehicle = data.vehicle

        if (vehicle.seat_count) {
          setSeatCount(vehicle.seat_count.toString())
        }

        if (vehicle.car_value) {
          setCarValue(vehicle.car_value.toString())
          setCarValueDisplay(formatNumber(vehicle.car_value))
        }

        if (vehicle.year) {
          setVehicleYear(vehicle.year.toString())
        }

        setLookupMessage(`✓ Đã tìm thấy: ${vehicle.model || 'Xe ô tô'}`)
      } else {
        setLookupMessage('Không tìm thấy thông tin xe trong hệ thống')
      }
    } catch (error) {
      console.error('Lookup error:', error)
      setLookupMessage('Lỗi khi tra cứu thông tin')
    } finally {
      setIsLookingUp(false)
    }
  }

  // Premium calculation logic (accurate formulas for cars)
  const calculatePremium = () => {
    setIsCalculating(true)

    // Simulate calculation
    setTimeout(() => {
      let basePremium = 0
      let coverageTypeName = ''
      let details = {}

      const currentYear = new Date().getFullYear()
      const age = currentYear - parseInt(vehicleYear)

      if (coverageType === 'tnds') {
        // TNDS (Civil Liability) - Based on seat count
        // Source: Nghị định 67/2023/NĐ-CP
        const seats = parseInt(seatCount)
        if (seats < 6) {
          basePremium = 437000 // Under 6 seats
        } else {
          basePremium = 794000 // 6-11 seats
        }

        coverageTypeName = 'TNDS (Bắt buộc)'
        details = {
          seatCount: `${seats} ghế`,
          basePremium: basePremium,
          vat: Math.round(basePremium * 0.1),
          total: Math.round(basePremium * 1.1),
        }
      } else {
        // Thân vỏ (Body Insurance) - Based on car value
        const value = parseInt(carValue)

        // Depreciation factor by age
        let depreciationFactor = 1.0
        if (age < 1) depreciationFactor = 1.0 // 100%
        else if (age <= 3) depreciationFactor = 0.85 // 85%
        else if (age <= 6) depreciationFactor = 0.7 // 70%
        else if (age <= 10) depreciationFactor = 0.7 // 70%
        else depreciationFactor = 0.4 // 40%

        // Premium rate (average 1.7%)
        const rate = 0.017
        basePremium = value * rate * depreciationFactor

        coverageTypeName = 'Thân vỏ (Tự nguyện)'
        details = {
          carValue: value,
          rate: `${(rate * 100).toFixed(1)}%`,
          depreciation: `${(depreciationFactor * 100).toFixed(0)}%`,
          basePremium: Math.round(basePremium),
          vat: Math.round(basePremium * 0.1),
          total: Math.round(basePremium * 1.1),
        }
      }

      const premium = {
        coverageType: coverageTypeName,
        vehicleYear: parseInt(vehicleYear),
        vehicleAge: age,
        ...details,
      }

      setResult(premium)
      setIsCalculating(false)

      if (onCalculate) {
        onCalculate({
          coverageType,
          seatCount,
          carValue,
          vehicleYear,
          result: premium,
        })
      }
    }, 800)
  }

  // Handle submit to AI
  const handleSubmitToAI = () => {
    if (!result) return

    if (onSubmitToAI) {
      onSubmitToAI({
        coverageType,
        seatCount,
        carValue,
        vehicleYear,
        result,
      })
    }
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND'
  }

  return (
    <div className="calculator-panel">
      {/* Header */}
      <div className="panel-header">
        <i className="fa fa-calculator"></i>
        <h3>Tính phí bảo hiểm</h3>
      </div>

      {/* Calculator Form */}
      <div className="calculator-form">
        {/* License Plate Lookup */}
        <div className="form-group">
          <label>Biển số xe (tùy chọn)</label>
          <div className="license-plate-group">
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="VD: 30A-12345"
              onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
            />
            <button
              className="lookup-btn"
              onClick={handleLookup}
              disabled={isLookingUp}
            >
              {isLookingUp ? (
                <i className="fa fa-spinner fa-spin"></i>
              ) : (
                <i className="fa fa-search"></i>
              )}
            </button>
          </div>
          {lookupMessage && (
            <div className={`lookup-message ${lookupMessage.startsWith('✓') ? 'success' : 'error'}`}>
              {lookupMessage}
            </div>
          )}
        </div>

        {/* Coverage Type - Radio Buttons */}
        <div className="form-group">
          <label>Loại bảo hiểm</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="coverageType"
                value="tnds"
                checked={coverageType === 'tnds'}
                onChange={(e) => setCoverageType(e.target.value)}
              />
              <span>TNDS (Bắt buộc)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="coverageType"
                value="than-vo"
                checked={coverageType === 'than-vo'}
                onChange={(e) => setCoverageType(e.target.value)}
              />
              <span>Thân vỏ</span>
            </label>
          </div>
        </div>

        {/* Seat Count - Only for TNDS */}
        {coverageType === 'tnds' && (
          <div className="form-group">
            <label>Số ghế</label>
            <select value={seatCount} onChange={(e) => setSeatCount(e.target.value)}>
              <option value="4">4 ghế</option>
              <option value="5">5 ghế</option>
              <option value="7">7 ghế</option>
              <option value="9">9 ghế</option>
            </select>
          </div>
        )}

        {/* Car Value - Only for Thân vỏ */}
        {coverageType === 'than-vo' && (
          <div className="form-group">
            <label>Giá trị xe (VND)</label>
            <input
              type="text"
              value={carValueDisplay}
              onChange={handleCarValueChange}
              placeholder="Ví dụ: 500,000,000"
            />
          </div>
        )}

        {/* Vehicle Year */}
        <div className="form-group">
          <label>Năm sản xuất</label>
          <select value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)}>
            {[...Array(30)].map((_, i) => {
              const year = new Date().getFullYear() - i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>

        {/* Calculate Button */}
        <button
          className="calculate-btn"
          onClick={calculatePremium}
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <i className="fa fa-spinner fa-spin"></i>
              Đang tính...
            </>
          ) : (
            <>
              <i className="fa fa-calculator"></i>
              Tính phí ngay
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="result-panel">
          <div className="result-header">
            <i className="fa fa-check-circle"></i>
            <span>Kết quả tính phí</span>
          </div>
          <div className="result-details">
            <div className="result-row">
              <span>Loại bảo hiểm:</span>
              <span>{result.coverageType}</span>
            </div>
            {result.seatCount && (
              <div className="result-row">
                <span>Số ghế:</span>
                <span>{result.seatCount}</span>
              </div>
            )}
            {result.carValue && (
              <>
                <div className="result-row">
                  <span>Giá trị xe:</span>
                  <span>{formatPrice(result.carValue)}</span>
                </div>
                <div className="result-row">
                  <span>Tỷ lệ:</span>
                  <span>{result.rate}</span>
                </div>
                <div className="result-row">
                  <span>Khấu hao:</span>
                  <span>{result.depreciation}</span>
                </div>
              </>
            )}
            <div className="result-row">
              <span>Phí cơ bản:</span>
              <span>{formatPrice(result.basePremium)}</span>
            </div>
            <div className="result-row">
              <span>VAT (10%):</span>
              <span>{formatPrice(result.vat)}</span>
            </div>
            <div className="result-divider"></div>
            <div className="result-row total">
              <span>Tổng phí:</span>
              <span>{formatPrice(result.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button className="back-btn" onClick={() => setResult(null)}>
              <i className="fa fa-arrow-left"></i>
              Quay lại
            </button>
            <button className="submit-ai-btn" onClick={handleSubmitToAI}>
              <i className="fa fa-comments"></i>
              Nhận tư vấn chi tiết
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .calculator-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

        .calculator-form {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-group select,
        .form-group input[type="number"],
        .form-group input[type="text"] {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          color: #1f2937;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .form-group select:hover,
        .form-group input[type="number"]:hover,
        .form-group input[type="text"]:hover {
          border-color: #667eea;
        }

        .form-group select:focus,
        .form-group input[type="number"]:focus,
        .form-group input[type="text"]:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .radio-group {
          display: flex;
          flex-direction: row;
          gap: 8px;
        }

        .radio-label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .radio-label:hover {
          background: #f9fafb;
          border-color: #667eea;
        }

        .radio-label input[type="radio"] {
          cursor: pointer;
        }

        .radio-label span {
          font-size: 14px;
          color: #1f2937;
          font-weight: 500;
        }

        .radio-label input[type="radio"]:checked + span {
          color: #667eea;
        }

        .license-plate-group {
          display: flex;
          gap: 8px;
        }

        .license-plate-group input {
          flex: 1;
        }

        .lookup-btn {
          width: 44px;
          height: 44px;
          background: white;
          color: #667eea;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lookup-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #667eea;
        }

        .lookup-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lookup-message {
          margin-top: 6px;
          font-size: 13px;
          padding: 6px 10px;
          border-radius: 4px;
        }

        .lookup-message.success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .lookup-message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .calculate-btn {
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
          margin-top: 8px;
        }

        .calculate-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .calculate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .result-panel {
          padding: 16px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-weight: 600;
          font-size: 14px;
        }

        .result-header i {
          font-size: 16px;
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: white;
          padding: 12px;
          border-radius: 8px;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #6b7280;
        }

        .result-row span:last-child {
          font-weight: 600;
          color: #1f2937;
        }

        .result-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }

        .result-row.total {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
        }

        .result-row.total span:last-child {
          color: #667eea;
          font-size: 16px;
        }

        .result-actions {
          display: flex;
          gap: 8px;
        }

        .back-btn {
          flex: 1;
          padding: 12px;
          background: white;
          color: #6b7280;
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

        .back-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .submit-ai-btn {
          flex: 1;
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

        .submit-ai-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        /* Scrollbar styling */
        .calculator-form::-webkit-scrollbar {
          width: 6px;
        }

        .calculator-form::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .calculator-form::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .calculator-form::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

export default CalculatorPanel
