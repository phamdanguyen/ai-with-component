/**
 * RichCardComponent v9.0.0
 *
 * Default GenUI component for displaying product/entity information.
 * Used when intent is uncertain or for detailed product views.
 *
 * Props:
 * - image: Product image URL (16:9 ratio recommended)
 * - title: Product/entity name
 * - subtitle: Category or tagline
 * - specs: Array of {label, value, icon}
 * - rating: {value, count}
 * - price: {current, original, currency}
 * - ctas: Array of {label, action, variant}
 * - onCtaClick: Callback for CTA button clicks
 */

// Star rating component
function StarRating({ value = 0, maxStars = 5 }) {
  const stars = []
  const fullStars = Math.floor(value)
  const hasHalfStar = value - fullStars >= 0.5

  for (let i = 0; i < maxStars; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="text-yellow-400">
          <i className="fas fa-star"></i>
        </span>
      )
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="text-yellow-400">
          <i className="fas fa-star-half-alt"></i>
        </span>
      )
    } else {
      stars.push(
        <span key={i} className="text-gray-300">
          <i className="far fa-star"></i>
        </span>
      )
    }
  }

  return <span className="flex items-center gap-0.5">{stars}</span>
}

// Price display component
function PriceDisplay({ current, original, currency = 'VND' }) {
  const formatPrice = (price) => {
    if (!price) return ''
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const hasDiscount = original && original > current

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-sky-600">
        {formatPrice(current)} {currency}
      </span>
      {hasDiscount && (
        <span className="text-sm text-gray-400 line-through">
          {formatPrice(original)} {currency}
        </span>
      )}
    </div>
  )
}

// Spec item component
function SpecItem({ label, value, icon = 'check' }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-green-500 mt-0.5">
        <i className={`fas fa-${icon}`}></i>
      </span>
      <span className="text-gray-700">
        {label}
        {value && <span className="font-medium ml-1">{value}</span>}
      </span>
    </div>
  )
}

// CTA Button component
function CtaButton({ label, action, variant = 'primary', onClick }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2'

  const variantClasses = {
    primary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm',
    outline: 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  }

  const handleClick = () => {
    if (onClick) {
      onClick({ action, label })
    }
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary}`}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}

// Main Rich Card Component
function RichCardComponent({
  image,
  title,
  subtitle,
  specs = [],
  rating = {},
  price = {},
  ctas = [],
  onCtaClick
}) {
  // Default placeholder image if none provided
  const displayImage = image || '/web/static/img/placeholder.png'

  return (
    <div className="genui-rich-card bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto border border-gray-100">
      {/* Image Section */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/web/static/img/placeholder.png'
          }}
        />
        {price.original && price.original > price.current && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{Math.round((1 - price.current / price.original) * 100)}%
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title & Subtitle */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        {/* Rating */}
        {rating.value && (
          <div className="flex items-center gap-2 mb-4">
            <StarRating value={rating.value} />
            <span className="text-sm text-gray-600">
              {rating.value.toFixed(1)}
            </span>
            {rating.count > 0 && (
              <span className="text-sm text-gray-400">
                ({rating.count} danh gia)
              </span>
            )}
          </div>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="grid gap-2">
              {specs.slice(0, 5).map((spec, index) => (
                <SpecItem
                  key={index}
                  label={spec.label}
                  value={spec.value}
                  icon={spec.icon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {price.current && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <PriceDisplay
              current={price.current}
              original={price.original}
              currency={price.currency}
            />
          </div>
        )}

        {/* CTAs */}
        {ctas.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {ctas.map((cta, index) => (
              <CtaButton
                key={index}
                label={cta.label}
                action={cta.action}
                variant={cta.variant}
                onClick={onCtaClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RichCardComponent
