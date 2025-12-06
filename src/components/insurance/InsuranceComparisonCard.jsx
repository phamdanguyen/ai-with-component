/**
 * InsuranceComparisonCard - Display insurance provider comparison
 *
 * Renders comparison results from compare_insurance_providers tool
 * Shows all 5 providers with price, rating, pros/cons
 *
 * @version 1.0.0
 * @since 9.7.0
 */

import { useState } from 'react'

// Rating stars component
function RatingStars({ rating }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <i
          key={i}
          className={`fa ${
            i < fullStars
              ? 'fa-star text-yellow-400'
              : i === fullStars && hasHalf
              ? 'fa-star-half-o text-yellow-400'
              : 'fa-star-o text-gray-300'
          } text-sm`}
        ></i>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  )
}

// Badge component
function Badge({ type, children }) {
  const colors = {
    cheapest: 'bg-green-100 text-green-800',
    best_rated: 'bg-blue-100 text-blue-800',
    fastest: 'bg-purple-100 text-purple-800',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {children}
    </span>
  )
}

// Single provider card
function ProviderCard({ provider, highlights, onSelect, isSelected }) {
  const isCheapest = highlights?.cheapest?.code === provider.code
  const isBestRated = highlights?.best_rated?.code === provider.code
  const isFastest = highlights?.fastest_claim?.code === provider.code

  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-4 cursor-pointer transition-all
                ${isSelected
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
      onClick={() => onSelect(provider)}
    >
      {/* Badges */}
      <div className="absolute -top-2 left-2 flex gap-1">
        {isCheapest && <Badge type="cheapest">Gia tot nhat</Badge>}
        {isBestRated && <Badge type="best_rated">Danh gia cao</Badge>}
        {isFastest && <Badge type="fastest">Boi thuong nhanh</Badge>}
      </div>

      {/* Provider name */}
      <div className="mt-2 mb-3">
        <h4 className="font-semibold text-gray-900">{provider.name}</h4>
        <RatingStars rating={provider.rating} />
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-blue-600">
          {provider.price_formatted}
        </span>
      </div>

      {/* Claim speed */}
      <div className="text-sm text-gray-600 mb-3">
        <i className="fa fa-clock-o mr-1"></i>
        Xu ly boi thuong: {provider.claim_speed}
      </div>

      {/* Pros */}
      {provider.pros && provider.pros.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Uu diem:</p>
          <ul className="text-xs text-green-700">
            {provider.pros.slice(0, 2).map((pro, idx) => (
              <li key={idx} className="flex items-start">
                <i className="fa fa-check mr-1 mt-0.5"></i>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {provider.cons && provider.cons.length > 0 && provider.cons[0] !== 'Khong co nhuoc diem dang ke' && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Luu y:</p>
          <ul className="text-xs text-orange-700">
            {provider.cons.slice(0, 1).map((con, idx) => (
              <li key={idx} className="flex items-start">
                <i className="fa fa-info-circle mr-1 mt-0.5"></i>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Select button */}
      <button
        className={`w-full py-2 rounded-lg font-medium transition-colors
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
      >
        {isSelected ? (
          <><i className="fa fa-check mr-1"></i> Da chon</>
        ) : (
          'Chon goi nay'
        )}
      </button>
    </div>
  )
}

function InsuranceComparisonCard({ data, onAction }) {
  const [selectedProvider, setSelectedProvider] = useState(null)

  // Extract data from tool response
  const {
    vehicle_type,
    vehicle_type_vn,
    vehicle_subtype,
    insurance_type,
    providers = [],
    highlights = {},
    message
  } = data || {}

  // Handle provider selection
  const handleSelect = (provider) => {
    setSelectedProvider(provider)
  }

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedProvider && onAction) {
      onAction({
        type: 'intent',
        message: `Toi chon ${selectedProvider.name} cho bao hiem ${vehicle_type_vn}. Lam thu tuc mua bao hiem.`
      })
    }
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        Khong tim thay thong tin bao hiem
      </div>
    )
  }

  return (
    <div className="insurance-comparison bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">So sanh {providers.length} hang bao hiem</h3>
            <p className="text-sm opacity-90">
              {insurance_type} - {vehicle_type_vn} ({vehicle_subtype})
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Gia tot nhat</div>
            <div className="text-xl font-bold">{highlights?.cheapest?.price_formatted}</div>
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="px-6 py-3 bg-blue-50 flex flex-wrap gap-2">
        {highlights?.cheapest && (
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Re nhat: </span>
            <span className="font-medium ml-1">{highlights.cheapest.name}</span>
          </div>
        )}
        {highlights?.best_rated && (
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Danh gia cao: </span>
            <span className="font-medium ml-1">{highlights.best_rated.name} ({highlights.best_rated.rating}/5)</span>
          </div>
        )}
        {highlights?.fastest_claim && (
          <div className="flex items-center text-sm">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Nhanh nhat: </span>
            <span className="font-medium ml-1">{highlights.fastest_claim.name} ({highlights.fastest_claim.claim_speed})</span>
          </div>
        )}
      </div>

      {/* Provider cards grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.code}
              provider={provider}
              highlights={highlights}
              onSelect={handleSelect}
              isSelected={selectedProvider?.code === provider.code}
            />
          ))}
        </div>
      </div>

      {/* Selected summary & action */}
      {selectedProvider && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ban da chon:</p>
              <p className="font-semibold text-gray-900">
                {selectedProvider.name} - {selectedProvider.price_formatted}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fa fa-arrow-right mr-2"></i>
              Tiep tuc mua
            </button>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="px-6 py-3 bg-gray-100 text-center">
        <p className="text-xs text-gray-500">
          <i className="fa fa-info-circle mr-1"></i>
          Gia tham khao. Gia chinh xac se duoc tinh khi ban cung cap thong tin xe.
        </p>
      </div>

    </div>
  )
}

export default InsuranceComparisonCard
