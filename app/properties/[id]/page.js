'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { MapPin, Bed, Bath, Square, MessageCircle } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { propertyService } from '@/services/api'
import { formatPrice, getWhatsAppLink, getFinalidadeBadge, getCondicaoBadge } from '@/lib/utils'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperty()
  }, [params.id])

  const loadProperty = async () => {
    try {
      const data = await propertyService.getProperty(params.id)
      setProperty(data)
    } catch (error) {
      console.error('Error loading property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Carregando imóvel...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Imóvel não encontrado</h2>
        </div>
      </div>
    )
  }

  const images = property.images?.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1757439402214-2311405d70bd?crop=entropy&cs=srgb&fm=jpg&q=85']

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="rounded-2xl overflow-hidden shadow-xl h-96"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-96">
                      <Image
                        src={image}
                        alt={`${property.title} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mb-4 flex gap-2">
              <span className="bg-rd-blue text-white font-semibold px-4 py-2 rounded-lg">
                {getFinalidadeBadge(property.finalidade || property.type)}
              </span>
              <span className="bg-white border-2 border-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg">
                {getCondicaoBadge(property.condicao || property.status)}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>

            <div className="flex items-center text-gray-600 mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{property.address}, {property.city}</span>
            </div>

            <div className="flex items-center gap-6 mb-8 text-gray-700">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">{property.bedrooms} quarto{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">{property.bathrooms} banheiro{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center">
                  <Square className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">{property.area}m²</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white shadow-2xl rounded-xl p-8">
              <div className="mb-6">
                <p className="text-4xl font-bold text-rd-blue mb-2">{formatPrice(property.price)}</p>
                {(property.finalidade === 'aluguel' || property.type === 'alugar') && <p className="text-gray-600">por mês</p>}
              </div>

              <a
                href={getWhatsAppLink(property)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full py-4 text-lg font-bold shadow-lg mb-4 flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chamar no WhatsApp</span>
              </a>

              <a
                href={getWhatsAppLink(property)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border-2 border-rd-blue text-rd-blue hover:bg-blue-50 rounded-full py-4 text-lg font-bold flex items-center justify-center transition-colors"
              >
                Agendar Visita
              </a>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Contato</h3>
                <p className="text-gray-600 mb-2">RD IMÓVEIS DF</p>
                <p className="text-gray-600 mb-2">(61) 99333-6757</p>
                <p className="text-sm text-gray-500 italic mt-4">Idealize! Sonhe! Realize!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}