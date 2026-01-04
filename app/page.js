'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import PropertyCard from '@/components/PropertyCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { propertyService } from '@/services/api'

export default function Home() {
  const [allProperties, setAllProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [selectedType, setSelectedType] = useState('comprar')
  const [loading, setLoading] = useState(true)
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1625426242633-3be4b3379dfb?crop=entropy&cs=srgb&fm=jpg&q=85')
  const [valuationImageUrl, setValuationImageUrl] = useState('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&q=85')

  useEffect(() => {
    loadProperties()
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`)
      if (!response.ok) return
      const data = await response.json()
      if (data['hero-image']?.url) setHeroImageUrl(data['hero-image'].url)
      if (data['valuation-image']?.url) setValuationImageUrl(data['valuation-image'].url)
    } catch (error) {
      console.error('Error loading hero image:', error)
    }
  }

  useEffect(() => {
    filterProperties(selectedType)
  }, [selectedType, allProperties])

  const loadProperties = async () => {
    setLoading(true)
    try {
      let data = await propertyService.getProperties({ active: true })
      data = data.filter(p => p.is_featured)
      data = data.slice(0, 12)
      setAllProperties(data)
      filterProperties('comprar', data)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProperties = (type, properties = allProperties) => {
    let filtered = properties
    if (type === 'comprar') {
      filtered = properties.filter(p => 
        p.finalidade === 'comprar' || 
        p.finalidade === 'venda' ||
        p.type === 'comprar' ||
        p.type === 'venda'
      )
    } else if (type === 'alugar') {
      filtered = properties.filter(p => 
        p.finalidade === 'alugar' || 
        p.finalidade === 'aluguel' ||
        p.type === 'alugar' ||
        p.type === 'aluguel'
      )
    } else if (type === 'lancamentos') {
      filtered = properties.filter(p => p.condicao === 'na_planta' || p.status === 'na_planta')
    }
    setFilteredProperties(filtered)
    setSelectedType(type)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      <section className="relative min-h-[600px] sm:min-h-[700px] md:min-h-screen flex items-center justify-center bg-cover bg-center pt-20 sm:pt-24 pb-12 md:pt-8 md:pb-14" style={{backgroundImage: `url(${heroImageUrl})`}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight">
            IDEALIZE!<br />SONHE!<br />REALIZE!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-8 md:mb-10 drop-shadow-lg px-4">
            Encontre o imóvel dos seus sonhos em Brasília
          </p>
          <div className="max-w-4xl mx-auto px-2">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="pt-8 pb-12 md:pt-10 md:pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-7">
              Imóveis em Destaque
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-10 justify-center max-w-2xl mx-auto">
              <button 
                onClick={() => filterProperties('comprar')}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-bold rounded-lg transition-all text-sm sm:text-base ${
                  selectedType === 'comprar' 
                    ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                }`}
              >
                COMPRAR
              </button>
              <button 
                onClick={() => filterProperties('alugar')}
                className={`w-full sm:w-auto w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-bold rounded-lg transition-all text-sm sm:text-base ${
                  selectedType === 'alugar' 
                    ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ALUGUEL
              </button>
              <button 
                onClick={() => filterProperties('lancamentos')}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-bold rounded-lg transition-all text-sm sm:text-base ${
                  selectedType === 'lancamentos' 
                    ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                }`}
              >
                LANÇAMENTOS
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando imóveis...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum imóvel disponível para esta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/properties"
              className="inline-block bg-rd-blue hover:bg-rd-blue-hover text-white rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* Saiba Quanto Vale Seu Imóvel */}
      <section className="relative py-16 sm:py-20 md:py-24 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: `url(${valuationImageUrl})`}}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 drop-shadow-2xl px-4">
            Saiba quanto vale seu imóvel
          </h2>
          <a
            href="https://wa.me/5561993336757?text=Oi,%20quero%20simular%20o%20valor%20do%20meu%20imovel!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-rd-blue hover:bg-rd-blue-hover text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg transition-colors rounded-lg"
          >
            CALCULE AGORA!
          </a>
        </div>
      </section>



      <section className="py-16 sm:py-20 md:py-24 bg-rd-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
            VAMOS AGENDAR UMA VISITA
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Entre em contato conosco e realize o sonho da casa própria
          </p>
          <a
            href="https://wa.me/5561993336757"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-rd-blue hover:bg-gray-100 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-xl transition-colors"
          >
            Falar com um Corretor
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}