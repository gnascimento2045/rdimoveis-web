'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function PropertyModal({ isOpen, onClose, onSave, property }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    finalidade: 'venda',
    condicao: 'novo',
    price: '',
    city: '',
    neighborhood: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    garages: '',
    area: '',
    video_url: '',
    is_featured: false,
  })

  // Opções de Condição baseadas em Finalidade
  const getCondicaoOptions = () => {
    switch (formData.finalidade) {
      case 'venda':
        return ['novo', 'usado']
      case 'aluguel':
        return ['novo', 'usado']
      case 'lancamento':
        return ['na_planta']
      default:
        return ['novo']
    }
  }

  const condicaoOptions = getCondicaoOptions()

  // Auto-ajusta condição se a finalidade muda
  useEffect(() => {
    const validOptions = getCondicaoOptions()
    if (!validOptions.includes(formData.condicao)) {
      setFormData(prev => ({
        ...prev,
        condicao: validOptions[0]
      }))
    }
  }, [formData.finalidade])

  useEffect(() => {
    if (property) {
      setFormData(property)
    } else {
      setFormData({
        title: '',
        description: '',
        finalidade: 'venda',
        condicao: 'novo',
        price: '',
        city: '',
        neighborhood: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        garages: '',
        area: '',
        video_url: '',
        is_featured: false,
      })
    }
  }, [property, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Principais */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Principais</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Imóvel *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="Ex: Apartamento 2 quartos em Águas Claras"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                    placeholder="Ex: Brasília"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro / Região
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                    placeholder="Ex: Águas Claras"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="Ex: EQSW 301/302"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="Descreva o imóvel..."
                />
              </div>
            </div>
          </div>

          {/* Finalidade e Condição */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Operação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finalidade do Imóvel *
                </label>
                <select
                  name="finalidade"
                  value={formData.finalidade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                >
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="lancamento">Lançamento (Na planta)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condição do Imóvel *
                </label>
                <select
                  name="condicao"
                  value={formData.condicao}
                  onChange={handleChange}
                  required
                  disabled={formData.finalidade === 'lancamento'}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue ${
                    formData.finalidade === 'lancamento' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  {condicaoOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'novo' && 'Novo'}
                      {option === 'usado' && 'Usado'}
                      {option === 'na_planta' && 'Na planta'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.finalidade === 'lancamento' && '✓ Imóvel em lançamento (na planta)'}
              {formData.finalidade === 'venda' && '✓ Selecione se o imóvel é novo ou usado'}
              {formData.finalidade === 'aluguel' && '✓ Selecione se o imóvel é novo ou usado'}
            </p>
          </div>

          {/* Detalhes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (m²)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quartos
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banheiros
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garagem
                </label>
                <input
                  type="number"
                  name="garages"
                  value={formData.garages}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Valores */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Valores</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                placeholder="0"
              />
            </div>
          </div>

          {/* Extras */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Extras</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Vídeo
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Destaque na página inicial
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-rd-blue-hover transition-colors"
            >
              {property ? 'Atualizar' : 'Criar'} Imóvel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
