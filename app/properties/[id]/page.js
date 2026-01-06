'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import PropertyGalleryModal from '@/components/PropertyGalleryModal'
import { MapPin, Bed, Bath, Square, Image as ImageIcon, Film, ChevronRight, Video, Map, ChevronLeft } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { propertyService } from '@/services/api'
import { formatPriceDisplay, getWhatsAppLink, getFinalidadeBadge, getCondicaoBadge } from '@/lib/utils'
import Image from 'next/image'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState([])
  const [activeTab, setActiveTab] = useState('fotos') // 'fotos', 'mapa', 'videos'
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    loadProperty()
  }, [params.id])

  const loadProperty = async () => {
    try {
      const data = await propertyService.getProperty(params.id)
      setProperty(data)
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${params.id}/media`)
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
      } catch (mediaError) {
        console.error('Error loading media:', mediaError)
      }
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

  const images = mediaItems.length > 0
    ? mediaItems
        .filter(m => m.media_type === 'image')
        .map(m => ({ url: m.media_url, type: m.media_type }))
    : [{ url: 'https://images.unsplash.com/photo-1757439402214-2311405d70bd?crop=entropy&cs=srgb&fm=jpg&q=85', type: 'image' }]

  const videos = mediaItems
    .filter(m => m.media_type === 'video')
    .map(m => m.media_url)

  const getPlayableUrl = (url) => {
    if (!url) return ''

    const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]{11})/)
    const ytShort = url.match(/youtu\.be\/([\w-]{11})/)
    const youtubeId = ytWatch?.[1] || ytShort?.[1]
    if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`

    return url
  }

  const isEmbedUrl = (url) => {
    if (!url) return false
    return /youtube\.com|youtu\.be/.test(url)
  }

  const renderInfo = (label, value, icon = null) => {
    if (!value && value !== 0) return null
    return (
      <div className="pb-4 border-b border-gray-100 last:border-0">
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      <PropertyGalleryModal
        images={images}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        propertyTitle={property.title}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Abas */}
            <div className="mb-8 flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('fotos')}
                className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'fotos'
                    ? 'text-rd-blue border-b-2 border-rd-blue -mb-[2px]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                FOTOS
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'videos'
                    ? 'text-rd-blue border-b-2 border-rd-blue -mb-[2px]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Video className="w-5 h-5" />
                VÍDEOS
              </button>
             
            </div>

            {/* Conteúdo - FOTOS */}
            {activeTab === 'fotos' && (
              <>
                <div className="mb-8 grid grid-cols-4 gap-3 h-96">
                  {/* Imagem Principal - Grande */}
                  <div 
                    className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group relative"
                    onClick={() => setGalleryOpen(true)}
                  >
                    <img
                      src={images[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Grid de Imagens Menores */}
                  {images.slice(1, 5).map((media, index) => (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden shadow-lg cursor-pointer group relative"
                      onClick={() => {
                        setGalleryOpen(true);
                      }}
                    >
                      <img
                        src={media.url}
                        alt={`${property.title} - ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Overlay Ver mais fotos na última imagem */}
                      {index === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-white font-bold text-center">
                            <p className="text-sm">Ver mais fotos</p>
                            <p className="text-xs mt-1">+{images.length - 5}</p>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Conteúdo - VÍDEOS */}
            {activeTab === 'videos' && (
              <div className="mb-8">
                {videos && videos.length > 0 ? (
                  <div className="space-y-4">
                    {/* Player de Vídeo Grande */}
                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                      {isEmbedUrl(videos[currentVideoIndex]) ? (
                        <iframe
                          key={videos[currentVideoIndex]}
                          src={getPlayableUrl(videos[currentVideoIndex])}
                          title={`Vídeo ${currentVideoIndex + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <video
                          key={videos[currentVideoIndex]}
                          src={getPlayableUrl(videos[currentVideoIndex])}
                          controls
                          autoPlay
                          className="w-full h-full"
                        />
                      )}
                    </div>

                    {/* Navegação e Contador */}
                    {videos.length > 1 && (
                      <div className="flex items-center justify-between px-4">
                        <button
                          onClick={() => setCurrentVideoIndex(prev => prev > 0 ? prev - 1 : videos.length - 1)}
                          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-rd-blue hover:text-rd-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Anterior
                        </button>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Vídeo</p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentVideoIndex + 1} / {videos.length}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setCurrentVideoIndex(prev => prev < videos.length - 1 ? prev + 1 : 0)}
                          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-rd-blue hover:text-rd-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próximo
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-gray-50 rounded-2xl">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg">Nenhum vídeo adicionado para este imóvel</p>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo - MAPA */}
            {activeTab === 'mapa' && (
              <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                <p className="text-gray-500">Mapa será exibido aqui</p>
              </div>
            )}

            {/* Badges */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <span className="bg-rd-blue text-white font-semibold px-4 py-2 rounded-lg">
                {getFinalidadeBadge(property.finalidade || property.type)}
              </span>
              {getCondicaoBadge(property.condicao || property.status) && (
                <span className="bg-white border-2 border-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg">
                  {getCondicaoBadge(property.condicao || property.status)}
                </span>
              )}
            </div>

            {/* Título e Localização */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>

            <div className="flex items-center text-gray-600 mb-8">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">
                {[property.neighborhood, property.city, property.address].filter(Boolean).join(', ')}
              </span>
            </div>

            {/* Detalhes Rápidos */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-rd-blue" />
                    <p className="text-sm text-gray-600">Quartos</p>
                    <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-rd-blue" />
                    <p className="text-sm text-gray-600">Banheiros</p>
                    <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.garages > 0 && (
                  <div className="text-center">
                    <div className="h-6 w-6 mx-auto mb-2 text-rd-blue">🚗</div>
                    <p className="text-sm text-gray-600">Garagem</p>
                    <p className="text-xl font-bold text-gray-900">{property.garages}</p>
                  </div>
                )}
                {property.area > 0 && (
                  <div className="text-center">
                    <Square className="h-6 w-6 mx-auto mb-2 text-rd-blue" />
                    <p className="text-sm text-gray-600">Área</p>
                    <p className="text-xl font-bold text-gray-900">{property.area}m²</p>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            {property.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
              </div>
            )}

            {/* Características */}
            {property.characteristics && (
              <>
                {(property.characteristics.internas?.length > 0 ||
                  property.characteristics.externas?.length > 0 ||
                  property.characteristics.lazer?.length > 0) && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Características do Imóvel</h2>

                    {property.characteristics.internas?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Características Internas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {property.characteristics.internas.map((char, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-rd-blue" />
                              <span className="text-gray-700">{char}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {property.characteristics.externas?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Características Externas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {property.characteristics.externas.map((char, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-rd-blue" />
                              <span className="text-gray-700">{char}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {property.characteristics.lazer?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Lazer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {property.characteristics.lazer.map((char, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-rd-blue" />
                              <span className="text-gray-700">{char}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar com Preço e Contato */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white shadow-2xl rounded-xl p-8 space-y-6">
              {/* Preço */}
              <div>
                <p className="text-gray-600 text-sm mb-2">PREÇO</p>
                <p className="text-4xl font-bold text-rd-blue">{formatPriceDisplay(property.price, property.price_on_request)}</p>
                {(property.finalidade === 'aluguel' || property.finalidade === 'alugar' || property.type === 'aluguel' || property.type === 'alugar') && (
                  <p className="text-gray-600 text-sm mt-1">por mês</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <a
                  href={getWhatsAppLink(property)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg py-4 text-lg font-bold shadow-lg flex items-center justify-center space-x-3 transition-colors"
                >
                  <Image src="/assets/whatsapp.png" alt="WhatsApp" width={28} height={28} className="h-7 w-7" />
                  <span>Agendar uma visita</span>
                </a>

                  {/* ...existing code... */}
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Informações</h3>
                <div className="space-y-3">
                  {renderInfo('Cidade', property.city, <MapPin className="w-4 h-4 text-gray-400" />)}
                  {renderInfo('Bairro', property.neighborhood)}
                  {renderInfo('Endereço', property.address)}
                  {property.latitude && property.longitude && (
                    <div className="pb-4 border-b border-gray-100 last:border-0">
                      <p className="text-sm text-gray-600 mb-2">Localização</p>
                      <a
                        href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rd-blue hover:underline font-semibold"
                      >
                        Ver no Mapa
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Contato</h3>
                <p className="text-gray-600 font-semibold mb-1">RD IMÓVEIS DF</p>
                <p className="text-rd-blue font-bold text-lg mb-4">(61) 99333-6757</p>
                <p className="text-sm text-gray-500 italic">Idealize! Sonhe! Realize!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
