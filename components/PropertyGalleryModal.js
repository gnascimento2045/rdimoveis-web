'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PropertyGalleryModal({ images, isOpen, onClose, propertyTitle }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  if (!isOpen) return null

  // Normalizar imagens para sempre ter url e type
  const normalizedImages = images.map(img => 
    typeof img === 'string' 
      ? { url: img, type: 'image' }
      : img
  )
  const currentMedia = normalizedImages[currentIndex]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Mídia principal (imagem ou vídeo) */}
            <div className="relative w-full max-w-5xl max-h-[80vh]">
              <div className="relative w-full h-96 md:h-[70vh] bg-black flex items-center justify-center">
                {currentMedia.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    className="max-w-full max-h-full"
                    controls
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={`${propertyTitle} - ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Navegação lateral */}
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Contador */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-semibold">
              {currentIndex + 1} / {normalizedImages.length}
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-2xl">
                {normalizedImages.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-gray-800 flex items-center justify-center ${
                      index === currentIndex ? 'border-white' : 'border-white/30'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
