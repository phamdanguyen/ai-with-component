import { useState } from 'react'

function SlidesComponent({ slides, title }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  if (!slides || slides.length === 0) {
    return (
      <div className="genui-chart">
        <p className="text-gray-500 text-center py-8">No slides available</p>
      </div>
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const slide = slides[currentSlide]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-12 min-h-[500px] flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              {slide.title}
            </h2>
          )}
          {slide.content && (
            <div className="text-xl text-gray-700 mb-8 leading-relaxed">
              {slide.content}
            </div>
          )}
          {slide.image && (
            <img
              src={slide.image}
              alt={slide.title}
              className="max-w-2xl mx-auto rounded-lg shadow-lg mb-6"
            />
          )}
          {slide.bullets && (
            <ul className="text-left text-lg space-y-3 max-w-2xl mx-auto">
              {slide.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-600 mr-3">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      <div className="px-6 py-2 text-center text-sm text-gray-500">
        Slide {currentSlide + 1} of {slides.length}
      </div>
    </div>
  )
}

export default SlidesComponent
