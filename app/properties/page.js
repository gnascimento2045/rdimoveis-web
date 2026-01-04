'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import Image from 'next/image'
import PropertyCard from '@/components/PropertyCard'
import { propertyService } from '@/services/api'
import { currencyToNumber, maskCurrencyBRL } from '@/lib/utils'
import { motion } from 'framer-motion'

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [cities, setCities] = useState([])
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: '',
    city: searchParams.get('city') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    rooms: searchParams.get('rooms') || '0',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })

  const normalize = (value = '') =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  useEffect(() => {
    loadProperties()
    loadCitiesAndNeighborhoods()
  }, [filters])

  
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      minPrice: prev.minPrice ? maskCurrencyBRL(prev.minPrice) : '',
      maxPrice: prev.maxPrice ? maskCurrencyBRL(prev.maxPrice) : ''
    }))
    
  }, [])

  const loadCitiesAndNeighborhoods = async () => {
    try {
      const data = await propertyService.getProperties({ active: true })

      const cityMap = new Map()
      const neighborhoodMap = new Map()

      data.forEach(p => {
        if (p.city) {
          const key = normalize(p.city)
          if (!cityMap.has(key)) cityMap.set(key, p.city)
        }
        if (p.neighborhood) {
          const key = normalize(p.neighborhood)
          if (!neighborhoodMap.has(key)) neighborhoodMap.set(key, p.neighborhood)
        }
      })

      const sortedCities = Array.from(cityMap.values()).sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }))
      const sortedNeighborhoods = Array.from(neighborhoodMap.values()).sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }))

      setCities(sortedCities)
      setNeighborhoods(sortedNeighborhoods)
    } catch (error) {
      console.error('Error loading cities and neighborhoods:', error)
    }
  }

  const loadProperties = async () => {
    setLoading(true)
    try {
      const filterParams = { active: true }
      if (filters.type && filters.type !== 'todos') filterParams.type = filters.type
      if (filters.status && filters.status !== 'todas') filterParams.status = filters.status
      
      let data = await propertyService.getProperties(filterParams)
      
      if (filters.city) {
        const filterCity = normalize(filters.city)
        data = data.filter(p => 
          normalize(p.city || '').includes(filterCity)
        )
      }

      if (filters.neighborhood) {
        const filterNeighborhood = normalize(filters.neighborhood)
        data = data.filter(p =>
          p.neighborhood && normalize(p.neighborhood).includes(filterNeighborhood)
        )
      }

      if (filters.minPrice) {
        const minPriceNum = currencyToNumber(filters.minPrice)
        data = data.filter(p => {
          if (p.price_on_request) return false
          const price = p.price || p.rent_price || 0
          return price >= minPriceNum
        })
      }

      if (filters.maxPrice) {
        const maxPriceNum = currencyToNumber(filters.maxPrice)
        data = data.filter(p => {
          if (p.price_on_request) return false
          const price = p.price || p.rent_price || 0
          return price <= maxPriceNum
        })
      }

      if (filters.rooms && filters.rooms !== '0') {
        const roomsNum = Number(filters.rooms)
        data = data.filter(p => {
          const bedrooms = Number(p.bedrooms || 0)
          return roomsNum === 4 ? bedrooms >= 4 : bedrooms === roomsNum
        })
      }

      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ type: '', status: '', city: '', neighborhood: '', rooms: '0', minPrice: '', maxPrice: '' })
  }

  return (
    <>
      <div className="bg-rd-blue text-white py-12 sm:py-14 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center"
          >
            Todos os Imóveis
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          {(filters.city || filters.neighborhood || filters.type || filters.status || (filters.rooms && filters.rooms !== '0')) && (
            <div className="mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-gray-600">Buscando em:</span>
              {filters.type && (
                <>
                  <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{filters.type}</span>
                  <button 
                    onClick={() => handleFilterChange('type', '')}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ✕
                  </button>
                </>
              )}
              {filters.status && (
                <>
                  <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{filters.status}</span>
                  <button 
                    onClick={() => handleFilterChange('status', '')}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ✕
                  </button>
                </>
              )}
              {filters.city && (
                <>
                  <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{filters.city}</span>
                  <button 
                    onClick={() => handleFilterChange('city', '')}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ✕
                  </button>
                </>
              )}
              {filters.neighborhood && (
                <>
                  <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{filters.neighborhood}</span>
                  <button 
                    onClick={() => handleFilterChange('neighborhood', '')}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ✕
                  </button>
                </>
              )}
              {filters.rooms && filters.rooms !== '0' && (
                <>
                  <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{
                    filters.rooms === '4'
                      ? '4+ quartos'
                      : filters.rooms === '1'
                        ? '1 quarto'
                        : `${filters.rooms} quartos`
                  }</span>
                  <button 
                    onClick={() => handleFilterChange('rooms', '0')}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-end">
            {/* Cidade */}
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Cidade</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todas as cidades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Bairro/Região */}
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Bairro / Região</label>
              <select
                value={filters.neighborhood}
                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todos os bairros</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Imóvel */}
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Tipo de Imóvel</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="cobertura">Cobertura</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>

            {/* Situação */}
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Situação</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todas</option>
                <option value="na_planta">Na Planta</option>
                <option value="usado">Pronto/Usado</option>
              </select>
            </div>

            {/* Quartos */}
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Quartos</label>
              <select
                value={filters.rooms}
                onChange={(e) => handleFilterChange('rooms', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="0">Qualquer</option>
                <option value="1">1 quarto</option>
                <option value="2">2 quartos</option>
                <option value="3">3 quartos</option>
                <option value="4">4+ quartos</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base text-white bg-gray-900 hover:bg-gray-800 shadow-sm transition-colors w-full md:w-auto"
            >
              Limpar Filtros
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end mt-3 sm:mt-4">
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Valor Mínimo</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', maskCurrencyBRL(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Valor Máximo</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', maskCurrencyBRL(e.target.value))}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando imóveis...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum imóvel encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">{properties.length} imóve{properties.length !== 1 ? 'is' : 'l'} encontrado{properties.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WhatsAppButton />
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      }>
        <PropertiesContent />
      </Suspense>

      <Footer />
    </div>
  )
}