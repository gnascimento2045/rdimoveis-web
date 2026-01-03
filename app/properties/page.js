'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import PropertyCard from '@/components/PropertyCard'
import { propertyService } from '@/services/api'
import { motion } from 'framer-motion'

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [neighborhoods, setNeighborhoods] = useState([])
  const [cities, setCities] = useState([])
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: '',
    city: searchParams.get('city') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })

  useEffect(() => {
    loadProperties()
    loadCitiesAndNeighborhoods()
  }, [filters])

  const loadCitiesAndNeighborhoods = async () => {
    try {
      const data = await propertyService.getProperties({ active: true })
      const uniqueCities = [...new Set(data.map(p => p.city).filter(Boolean))]
      const uniqueNeighborhoods = [...new Set(data.map(p => p.neighborhood).filter(Boolean))]
      setCities(uniqueCities.sort())
      setNeighborhoods(uniqueNeighborhoods.sort())
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
        data = data.filter(p => 
          p.city.toLowerCase().includes(filters.city.toLowerCase())
        )
      }

      if (filters.neighborhood) {
        data = data.filter(p =>
          p.neighborhood && p.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())
        )
      }

      if (filters.minPrice) {
        const minPriceNum = parseFloat(filters.minPrice.replace(/[^\d]/g, ''))
        data = data.filter(p => {
          const price = p.price || p.rent_price || 0
          return price >= minPriceNum
        })
      }

      if (filters.maxPrice) {
        const maxPriceNum = parseFloat(filters.maxPrice.replace(/[^\d]/g, ''))
        data = data.filter(p => {
          const price = p.price || p.rent_price || 0
          return price <= maxPriceNum
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
    setFilters({ type: '', status: '', city: '', neighborhood: '', minPrice: '', maxPrice: '' })
  }

  return (
    <>
      <div className="bg-rd-blue text-white py-16">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-center"
          >
            Todos os Imóveis
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {(filters.city || filters.neighborhood) && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Buscando em:</span>
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
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Cidade */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cidade</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todas as cidades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Bairro/Região */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Bairro / Região</label>
              <select
                value={filters.neighborhood}
                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todos os bairros</option>
                {neighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Negociação */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Negociação</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todos</option>
                <option value="comprar">Comprar</option>
                <option value="alugar">Alugar</option>
              </select>
            </div>

            {/* Situação */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Situação</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              >
                <option value="">Todas</option>
                <option value="na_planta">Na Planta</option>
                <option value="usado">Pronto/Usado</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end mt-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Valor Mínimo</label>
              <input
                type="text"
                placeholder="Ex: 100000"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Valor Máximo</label>
              <input
                type="text"
                placeholder="Ex: 500000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
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