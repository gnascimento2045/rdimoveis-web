'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PropertyGalleryModal({ images, isOpen, onClose, propertyTitle }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const touchStartX = useRef(null)
  const thumbnailRefs = useRef([])

  const safeImages = Array.isArray(images) ? images : []
  const normalizedImages = useMemo(() => safeImages.map(img =>
    typeof img === 'string'
      ? { url: img, type: 'image' }
      : img
  ), [safeImages])
  const total = normalizedImages.length
  const currentMedia = normalizedImages[currentIndex] || null

  const handlePrevious = () => {
    if (total === 0) return
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const handleNext = () => {
    if (total === 0) return
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      return
    }
    setCurrentIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isPlaying || total <= 1) return
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total)
    }, 3500)
    return () => clearInterval(id)
  }, [isPlaying, total])

  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0)
    }
  }, [currentIndex, total])

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[currentIndex]
    if (activeThumb && typeof activeThumb.scrollIntoView === 'function') {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [currentIndex])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const threshold = 40
    if (deltaX > threshold) handlePrevious()
    if (deltaX < -threshold) handleNext()
    touchStartX.current = null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div
            className="w-full h-full flex items-center justify-center p-4 pointer-events-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Controles principais */}
            <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-auto">
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="bg-white/20 hover:bg-white/35 text-white rounded-full p-3 transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/35 text-white rounded-full p-3 transition-colors"
                aria-label="Sair"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mídia principal (imagem ou vídeo) */}
            <div className="relative w-full max-w-5xl max-h-[80vh] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div
                className="relative w-full h-[55vh] sm:h-[65vh] md:h-[70vh] bg-black/70 flex items-center justify-center rounded-xl overflow-hidden"
                onClick={handleNext}
              >
                {!currentMedia ? (
                  <span className="text-white/80 text-sm">Nenhuma mídia disponível</span>
                ) : currentMedia.type === 'video' ? (
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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 text-white rounded-full p-3 sm:p-4 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/40 text-white rounded-full p-3 sm:p-4 transition-colors"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Contador */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/25 backdrop-blur text-white px-5 py-2.5 rounded-full font-semibold text-sm sm:text-base">
              {currentIndex + 1} / {normalizedImages.length}
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] sm:max-w-2xl px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {normalizedImages.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    ref={(el) => { thumbnailRefs.current[index] = el }}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all bg-gray-800 flex items-center justify-center ${
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
