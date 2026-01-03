'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { propertyService } from '@/services/api'

export default function SearchBar() {
  const router = useRouter()
  const [purpose, setPurpose] = useState('comprar')
  const [propertyType, setPropertyType] = useState('0')
  const [location, setLocation] = useState('')
  const [locationType, setLocationType] = useState('') // 'city' or 'neighborhood'
  const [rooms, setRooms] = useState('0')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allLocations, setAllLocations] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const properties = await propertyService.getProperties({ active: true })
      const uniqueCities = [...new Set(properties.map(p => p.city).filter(Boolean))]
      const uniqueNeighborhoods = [...new Set(properties.map(p => p.neighborhood).filter(Boolean))]

      const locations = [
        ...uniqueCities.map(city => ({ name: city, type: 'city' })),
        ...uniqueNeighborhoods.map(neighborhood => ({ name: neighborhood, type: 'neighborhood' }))
      ]

      setAllLocations(locations)
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const handleLocationChange = (value) => {
    setLocation(value)
    setLocationType('') // Reset type when user types
    if (value.length > 0) {
      const filtered = allLocations.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (selectedLocation) => {
    setLocation(selectedLocation.name)
    setLocationType(selectedLocation.type)
    setShowSuggestions(false)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (purpose) params.append('purpose', purpose)
    if (propertyType !== '0') params.append('type', propertyType)
    if (location) {
      if (locationType === 'city') {
        params.append('city', location)
      } else if (locationType === 'neighborhood') {
        params.append('neighborhood', location)
      } else {
        params.append('city', location)
        params.append('neighborhood', location)
      }
    }
    if (rooms !== '0') params.append('rooms', rooms)
    if (minPrice) params.append('minPrice', minPrice)
    if (maxPrice) params.append('maxPrice', maxPrice)
    router.push(`/properties?${params.toString()}`)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl p-8 max-w-6xl mx-auto"
    >
      {/* Opções: Comprar, Alugar, Lançamentos */}
      <div className="flex gap-4 mb-12 justify-center">
        <button
          onClick={() => setPurpose('comprar')}
          className={`px-8 py-2 font-bold text-lg rounded-lg transition-all ${
            purpose === 'comprar' 
              ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
              : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
          }`}
        >
          COMPRAR
        </button>
        <button
          onClick={() => setPurpose('alugar')}
          className={`px-8 py-2 font-bold text-lg rounded-lg transition-all ${
            purpose === 'alugar' 
              ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
              : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
          }`}
        >
          ALUGAR
        </button>
        <button
          onClick={() => setPurpose('lancamentos')}
          className={`px-8 py-2 font-bold text-lg rounded-lg transition-all ${
            purpose === 'lancamentos' 
              ? 'bg-rd-blue text-white hover:bg-rd-blue-hover' 
              : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
          }`}
        >
          LANÇAMENTOS
        </button>
      </div>

      {/* Grid de campos */}
      <div className="space-y-6 mb-8">
        {/* Primeira linha: Tipo, Localização, Quartos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tipo */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-rd-blue tracking-wide">TIPO</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue bg-white text-gray-700 font-medium"
            >
              <option value="0">Todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="cobertura">Cobertura</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          {/* Localização */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-rd-blue tracking-wide">LOCALIZAÇÃO</label>
            <div className="relative" ref={inputRef}>
              <input
                type="text"
                placeholder="Bairro ou Cidade"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue font-medium"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-700">
                        {suggestion.name} ({suggestion.type === 'city' ? 'Cidade' : 'Região'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quartos */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-rd-blue tracking-wide">QUARTOS</label>
            <select
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue bg-white text-gray-700 font-medium"
            >
              <option value="0">Quartos</option>
              <option value="1">1 Quarto</option>
              <option value="2">2 Quartos</option>
              <option value="3">3 Quartos</option>
              <option value="4">4+ Quartos</option>
            </select>
          </div>
        </div>

        {/* Segunda linha: Valor (completo) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-rd-blue tracking-wide">VALOR</label>
          <div className="flex gap-6">
            <input
              type="text"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue font-medium"
            />
            <input
              type="text"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue font-medium"
            />
          </div>
        </div>
      </div>

      {/* Botão Buscar */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSearch}
          className="w-full bg-rd-blue hover:bg-rd-blue-hover text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>BUSCAR IMÓVEIS</span>
        </button>
      </div>
    </motion.div>
  )
}