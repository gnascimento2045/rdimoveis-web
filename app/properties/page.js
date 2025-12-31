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
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    status: '',
    city: searchParams.get('city') || ''
  })

  useEffect(() => {
    loadProperties()
  }, [filters])

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
    setFilters({ type: '', status: '', city: '' })
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
          {filters.city && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Buscando em:</span>
              <span className="bg-rd-blue text-white px-3 py-1 rounded-full text-sm font-medium">{filters.city}</span>
              <button 
                onClick={() => handleFilterChange('city', '')}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Limpar
              </button>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-end">
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