'use client';

import React from 'react';
import { SlidesProps } from '../../../types/generative';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const Slides: React.FC<SlidesProps> = ({
    slides,
    title,
    autoPlay = false,
    autoPlayInterval = 5000,
    showNavigationArrows = true,
    showNavigationDots = true,
    height = 400,
}) => {
    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100 z-10 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
            )}

            <div style={{ height }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation={showNavigationArrows}
                    pagination={showNavigationDots ? { clickable: true } : false}
                    autoplay={autoPlay ? { delay: autoPlayInterval, disableOnInteraction: false } : false}
                    loop={slides.length > 1}
                    className="h-full w-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div
                                className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative"
                                style={{
                                    backgroundColor: slide.backgroundColor || '#f9fafb',
                                    color: slide.textColor || '#1f2937'
                                }}
                            >
                                {/* Background Image Overlay if present */}
                                {slide.image && (
                                    <div className="absolute inset-0 z-0">
                                        <img src={slide.image} alt="" className="w-full h-full object-cover opacity-20" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                    </div>
                                )}

                                <div className="z-10 relative max-w-2xl mx-auto">
                                    <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                                    <p className="text-lg opacity-90 leading-relaxed font-light">
                                        {slide.content}
                                    </p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};
