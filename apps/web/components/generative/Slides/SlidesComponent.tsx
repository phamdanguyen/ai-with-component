/**
 * SlidesComponent
 *
 * Carousel/Slides component with auto-play, keyboard navigation, and touch support
 * Type-safe props from core types
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SlidesProps } from '@/lib/types';

export function SlidesComponent({
  slides,
  title,
  autoPlay = false,
  autoPlayInterval = 3000,
  showNavigationDots = true,
  showNavigationArrows = true,
  height = 300,
}: SlidesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No slides to display</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, autoPlayInterval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoPlaying, slides.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 50) {
      // Swiped left
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      // Swiped right
      goToPrevious();
    }
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

      <div
        className="space-y-4"
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Slide presentation"
        tabIndex={0}
      >
        {/* Main Slide */}
        <div
          className={`relative w-full rounded-lg overflow-hidden border border-gray-200 transition-transform duration-300 ${
            currentSlide.backgroundColor || 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}
          style={{
            height: `${height}px`,
            backgroundImage: currentSlide.image ? `url(${currentSlide.image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center p-6">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-3">{currentSlide.title}</h2>
              <p className="text-lg max-w-2xl">{currentSlide.content}</p>
            </div>
          </div>

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {slides.length}
          </div>

          {/* Navigation Arrows */}
          {showNavigationArrows && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all z-10"
                aria-label="Previous slide"
              >
                ❮
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-all z-10"
                aria-label="Next slide"
              >
                ❯
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {showNavigationDots && slides.length > 1 && (
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentIndex ? 'bg-blue-600 w-8 h-3' : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'page' : undefined}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-4 items-center flex-wrap">
            <button
              onClick={goToPrevious}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-600 font-medium">
              Slide {currentIndex + 1} of {slides.length}
            </div>

            <button
              onClick={goToNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Next →
            </button>

            {autoPlay && (
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAutoPlaying
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
