/**
 * TrustFooter - Trust and credibility signals for B2C customers
 * Part of Story 2: Trust & Credibility Signals
 *
 * Shows security badge, human support option, rating, and privacy link
 *
 * @version 1.0.0
 * @since 8.13.0
 */

/**
 * TrustFooter component
 * @param {Object} props
 * @param {Function} props.onHumanSupport - Callback when "Talk to human" clicked
 * @param {string} props.privacyUrl - URL to privacy policy
 * @param {number} props.rating - Average rating (e.g., 4.8)
 * @param {number} props.reviewCount - Number of reviews (e.g., 500)
 */
function TrustFooter({
  onHumanSupport,
  privacyUrl = '/privacy',
  rating = 4.8,
  reviewCount = 500,
}) {
  const handleHumanSupportClick = () => {
    if (onHumanSupport) {
      onHumanSupport()
    } else {
      // Default: open contact page
      window.open('/contactus', '_blank')
    }
  }

  return (
    <div className="trust-footer border-t border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        {/* Security Badge */}
        <div className="flex items-center gap-1.5" title="Dữ liệu của bạn được bảo mật">
          <i className="fa fa-lock text-green-600"></i>
          <span>Bảo mật</span>
        </div>

        {/* Divider */}
        <span className="hidden sm:inline text-gray-300">|</span>

        {/* Human Support */}
        <button
          onClick={handleHumanSupportClick}
          className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
          title="Nói chuyện với nhân viên hỗ trợ"
        >
          <i className="fa fa-user-circle-o"></i>
          <span>Nói với nhân viên</span>
        </button>

        {/* Divider */}
        <span className="hidden sm:inline text-gray-300">|</span>

        {/* Rating */}
        <div className="flex items-center gap-1.5" title={`${reviewCount}+ khách hàng hài lòng`}>
          <i className="fa fa-star text-yellow-500"></i>
          <span>{rating}/5</span>
          <span className="text-gray-400">({reviewCount}+)</span>
        </div>

        {/* Divider */}
        <span className="hidden sm:inline text-gray-300">|</span>

        {/* Privacy Link */}
        <a
          href={privacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
          title="Chính sách bảo mật"
        >
          <i className="fa fa-shield"></i>
          <span>Quyền riêng tư</span>
        </a>
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Chúng tôi bảo vệ thông tin của bạn theo chính sách bảo mật.
      </p>
    </div>
  )
}

export default TrustFooter
