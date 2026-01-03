'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrice, getFinalidadeBadge, getCondicaoBadge } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function PropertyCard({ property, index = 0 }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = property.images?.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1757439402214-2311405d70bd?crop=entropy&cs=srgb&fm=jpg&q=85']
  
  const nextImage = (e) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = (e) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/properties/${property.id}`}>
        <div className="group overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border-0 bg-white">
          <div className="relative h-64 overflow-hidden">
            <Image
              src={images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-rd-blue text-white font-semibold px-3 py-1 rounded-md text-sm">
                {getFinalidadeBadge(property.finalidade || property.type)}
              </span>
              <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-md text-sm">
                {getCondicaoBadge(property.condicao || property.status)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
            
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.city}</span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

            <div className="flex items-center gap-4 mb-4 text-gray-600">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.area}m²</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-rd-blue">{formatPrice(property.price)}</p>
                {(property.finalidade === 'aluguel' || property.type === 'alugar') && <p className="text-xs text-gray-500">por mês</p>}
              </div>
              <span className="bg-rd-blue hover:bg-rd-blue-hover text-white rounded-full px-6 py-2 font-semibold transition-colors">
                Ver Detalhes
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}