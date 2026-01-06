'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { formatPriceDisplay, getFinalidadeBadge, getCondicaoBadge } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function PropertyCard({ property, index = 0 }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mediaItems, setMediaItems] = useState([])
  const [isHovering, setIsHovering] = useState(false)
  const autoScrollInterval = useRef(null)

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${property.id}/media`)
        if (response.ok) {
          const media = await response.json()
          const sortedMedia = media.sort((a, b) => {
            const aIsVideo = a.media_type === 'video'
            const bIsVideo = b.media_type === 'video'
            if (aIsVideo && !bIsVideo) return -1
            if (!aIsVideo && bIsVideo) return 1
            return a.display_order - b.display_order
          })
          setMediaItems(sortedMedia)
        }
      } catch (error) {
        console.error('Error loading media:', error)
      }
    }
    loadMedia()
  }, [property.id])

  const mediaUrls = mediaItems.length > 0 
    ? mediaItems.map(m => ({ url: m.media_url, type: m.media_type }))
    : [{ url: 'https://images.unsplash.com/photo-1757439402214-2311405d70bd?crop=entropy&cs=srgb&fm=jpg&q=85', type: 'image' }]

  useEffect(() => {
    if (isHovering && mediaUrls.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length)
      }, 1500) 
    } else {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current)
      }
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current)
      }
    }
  }, [isHovering, mediaUrls.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/properties/${property.id}`}>
        <div 
          className="group overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border-0 bg-white h-full flex flex-col"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Imagem/Vídeo */}
          <div className="relative h-64 overflow-hidden bg-gray-100 flex-shrink-0">
            {mediaUrls.length > 0 && (
              mediaUrls[currentImageIndex].type === 'video' ? (
                <video
                  src={mediaUrls[currentImageIndex].url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  muted
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <img
                  src={mediaUrls[currentImageIndex].url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )
            )}

            {/* Indicadores de Imagem/Vídeo */}
            {mediaUrls.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-rd-blue text-white font-semibold px-2 py-1 rounded text-xs">
                {getFinalidadeBadge(property.finalidade || property.type)}
              </span>
              {getCondicaoBadge(property.condicao || property.status) && (
                <span className="bg-white text-gray-800 font-semibold px-2 py-1 rounded text-xs">
                  {getCondicaoBadge(property.condicao || property.status)}
                </span>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="p-5 flex flex-col flex-grow">
            {/* Título */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">
              {property.title}
            </h3>

            {/* Localização - Cidade e Bairro */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm">
                {[property.city, property.neighborhood].filter(Boolean).join(' - ')}
              </span>
            </div>

            {/* Descrição Curta */}
            <div className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
              {property.description || ''}
            </div>

            {/* Preço e Botão */}
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="text-xl font-bold text-rd-blue">{formatPriceDisplay(property.price, property.price_on_request)}</p>
                {(property.finalidade === 'aluguel' || property.finalidade === 'alugar' || property.type === 'aluguel' || property.type === 'alugar') && (
                  <p className="text-xs text-gray-500">por mês</p>
                )}
              </div>
              <span className="bg-rd-blue hover:bg-rd-blue-hover text-white rounded-lg px-4 py-2 font-semibold transition-colors text-sm">
                Ver mais
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
