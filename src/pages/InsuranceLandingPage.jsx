/**
 * InsuranceLandingPage - Insurance E-commerce Marketplace Landing
 *
 * Google-style search-first UX for vehicle insurance comparison
 * Features:
 * - Prominent search bar (Google-style)
 * - Partner logos (BIC, MIC, Bao Viet, PVI, Bao Minh)
 * - Value propositions
 * - Trust signals
 * - Quick category buttons
 *
 * @version 1.0.0
 * @since 9.7.0
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Partner data
const PARTNERS = [
  { code: 'BIC', name: 'BIC', fullName: 'BIDV Insurance', rating: 4.5 },
  { code: 'MIC', name: 'MIC', fullName: 'Military Insurance', rating: 4.3 },
  { code: 'BaoViet', name: 'Bao Viet', fullName: 'Bao Viet Insurance', rating: 4.6 },
  { code: 'PVI', name: 'PVI', fullName: 'PVI Holdings', rating: 4.4 },
  { code: 'BaoMinh', name: 'Bao Minh', fullName: 'Bao Minh Insurance', rating: 4.2 },
]

// Quick categories
const CATEGORIES = [
  { id: 'car', label: 'Xe o to', icon: 'fa-car', query: 'bao hiem xe o to' },
  { id: 'motorbike', label: 'Xe may', icon: 'fa-motorcycle', query: 'bao hiem xe may' },
  { id: 'tnds', label: 'TNDS bat buoc', icon: 'fa-shield', query: 'bao hiem TNDS bat buoc' },
  { id: 'kasko', label: 'Bao hiem toan dien', icon: 'fa-umbrella', query: 'bao hiem toan dien kasko' },
]

// Value propositions
const VALUE_PROPS = [
  {
    icon: 'fa-robot',
    title: 'AI Tu van 24/7',
    desc: 'Chuyen gia AI san sang ho tro bat cu luc nao'
  },
  {
    icon: 'fa-balance-scale',
    title: 'So sanh 5 hang',
    desc: 'BIC, MIC, Bao Viet, PVI, Bao Minh'
  },
  {
    icon: 'fa-bolt',
    title: 'Mua trong 3 phut',
    desc: 'Chi can 4 thong tin, thanh toan QR'
  },
  {
    icon: 'fa-check-circle',
    title: 'Uy tin dam bao',
    desc: 'Doi tac chinh thuc, boi thuong nhanh'
  },
]

function InsuranceLandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to chat with search query as initial message
      navigate(`/superchat/expand?message=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Handle category click
  const handleCategoryClick = (category) => {
    navigate(`/superchat/expand?message=${encodeURIComponent(category.query)}`)
  }

  // Handle CTA click
  const handleStartChat = () => {
    navigate('/superchat/expand?message=' + encodeURIComponent('Toi can tu van bao hiem xe'))
  }

  return (
    <div className="insurance-landing min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fa fa-shield text-2xl text-blue-600"></i>
            <span className="text-xl font-bold text-gray-800">Bot247 Insurance</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#partners" className="text-gray-600 hover:text-blue-600">Doi tac</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600">Ve chung toi</a>
            <a href="tel:19001234" className="text-blue-600 font-medium">
              <i className="fa fa-phone mr-1"></i> 1900-1234
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Bao hiem thong minh
            <span className="text-blue-600"> Mua trong 3 phut</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8">
            So sanh gia tu 5 hang bao hiem uy tin - Chon goi phu hop nhat
          </p>

          {/* Search Bar - Google Style */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa fa-search text-gray-400 text-xl"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Toi can bao hiem xe..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         shadow-lg hover:shadow-xl transition-shadow"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-6 bg-blue-600 text-white rounded-r-full
                         hover:bg-blue-700 transition-colors font-medium"
              >
                Tim kiem
              </button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200
                         rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <i className={`fa ${cat.icon} text-blue-600`}></i>
                <span className="text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStartChat}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white
                     rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors
                     shadow-lg hover:shadow-xl"
          >
            <i className="fa fa-comments"></i>
            <span>Chat voi AI ngay</span>
          </button>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Tai sao chon Bot247 Insurance?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUE_PROPS.map((prop, idx) => (
              <div key={idx} className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className={`fa ${prop.icon} text-2xl text-blue-600`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{prop.title}</h3>
                <p className="text-sm text-gray-600">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Doi tac bao hiem
          </h2>
          <p className="text-center text-gray-600 mb-8">
            5 hang bao hiem uy tin hang dau Viet Nam
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {PARTNERS.map((partner) => (
              <div
                key={partner.code}
                className="bg-white px-8 py-4 rounded-lg shadow-sm hover:shadow-md transition-shadow
                         flex flex-col items-center"
              >
                <span className="text-xl font-bold text-gray-800">{partner.name}</span>
                <span className="text-sm text-gray-500">{partner.fullName}</span>
                <div className="flex items-center mt-2">
                  <i className="fa fa-star text-yellow-400 mr-1"></i>
                  <span className="text-sm text-gray-600">{partner.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Mua bao hiem chi trong 3 buoc
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-full
                           flex items-center justify-center text-xl font-bold">1</div>
              <h3 className="font-semibold mb-2">Chat voi AI</h3>
              <p className="text-sm text-gray-600">
                Cho AI biet ban can bao hiem gi, xe loai nao
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-full
                           flex items-center justify-center text-xl font-bold">2</div>
              <h3 className="font-semibold mb-2">So sanh va chon</h3>
              <p className="text-sm text-gray-600">
                Xem bang gia tu 5 hang, chon goi phu hop
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-full
                           flex items-center justify-center text-xl font-bold">3</div>
              <h3 className="font-semibold mb-2">Thanh toan QR</h3>
              <p className="text-sm text-gray-600">
                Nhap 4 thong tin, quet QR, nhan e-certificate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center">
              <i className="fa fa-lock text-green-600 mr-2"></i>
              Thanh toan an toan
            </span>
            <span className="flex items-center">
              <i className="fa fa-check-circle text-green-600 mr-2"></i>
              Doi tac chinh thuc
            </span>
            <span className="flex items-center">
              <i className="fa fa-headphones text-blue-600 mr-2"></i>
              Ho tro 24/7
            </span>
            <span className="flex items-center">
              <i className="fa fa-users text-blue-600 mr-2"></i>
              10,000+ khach hang
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            2025 Bot247 Insurance Marketplace. Doi tac phan phoi bao hiem chinh thuc.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hotline: 1900-1234 | Email: support@bot247.io.vn
          </p>
        </div>
      </footer>

    </div>
  )
}

export default InsuranceLandingPage
