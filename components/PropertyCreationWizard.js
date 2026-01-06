'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, Info, Image as ImageIcon } from 'lucide-react'
import MediaUploader from './MediaUploader'
import AutocompleteInput from './AutocompleteInput'
import { maskCurrencyBRL, currencyToNumber } from '@/lib/utils'
import { citiesSuggestions, neighborhoodsSuggestions } from '@/lib/locationData'

export default function PropertyCreationWizard({ isOpen, onClose, onSave, property = null, showToast }) {
  const [step, setStep] = useState(1)
  const [activeTab, setActiveTab] = useState('info')
  const [uploadedMedia, setUploadedMedia] = useState([])
  const [propertyId, setPropertyId] = useState(null)
  const [loading, setLoading] = useState(false)

  const normalizeCharacteristics = (data) => ({
    ...data,
    price_on_request: data?.price_on_request || false,
    price: data?.price ? maskCurrencyBRL(String(Math.round(data.price * 100))) : '',
    characteristics: {
      internas: data?.characteristics?.internas || [],
      externas: data?.characteristics?.externas || [],
      lazer: data?.characteristics?.lazer || []
    }
  })

  const characteristicsData = {
    internas: [
      'Ar condicionado', 'Armário banheiro', 'Banheiro social', 'Box banheiro',
      'Cozinha integrada', 'Despensa', 'Piso cerâmico', 'Pintura clara e acabamento moderno',
      'Sala bem distribuída', 'Área de serviço', 'Lavabo', 'Área privativa',
      'Armário cozinha', 'Closet', 'Armário quarto', 'Rouparia', 'Varanda gourmet', 'DCE'
    ],
    externas: [
      'Condomínio fechado', 'Guarita com controle de acesso', 'Segurança 24 horas',
      'Interfone', 'Portaria 24 horas'
    ],
    lazer: [
      'Bicicletário', 'Salão de festas', 'Churrasqueira', 'Churrasqueiras',
      'Piscina', 'Espaço fitness', 'Espaço Gourmet', 'Espaço de convivência',
      'Hidromassagem', 'Playground', 'Praça interna'
    ]
  }

  const [formData, setFormData] = useState({
    title: '', description: '', finalidade: 'venda', condicao: 'novo', tipo: 'apartamento',
    price: '', price_on_request: false, city: '', neighborhood: '', address: '',
    bedrooms: '', bedroom_options: [], unit_types: [], property_types: [], bathrooms: '', garages: '', area: '', is_featured: false,
    videos: [], videoUrlInput: '',
    characteristics: { internas: [], externas: [], lazer: [] }
  })

  const getCondicaoOptions = () => {
    switch (formData.finalidade) {
      case 'venda': return ['novo', 'usado']
      case 'aluguel': return ['mobiliado', 'nao_mobiliado']
      case 'lancamento': return ['na_planta']
      default: return ['novo']
    }
  }

  const condicaoOptions = getCondicaoOptions()

  useEffect(() => {
    const validOptions = getCondicaoOptions()
    if (!validOptions.includes(formData.condicao)) {
      setFormData(prev => ({ ...prev, condicao: validOptions[0] }))
    }
  }, [formData.finalidade])

  const loadExistingMedia = async (propId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propId}/media`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      })
      if (!response.ok) return

      const data = await response.json()
      const images = data.filter(m => m.media_type === 'image')
      const videos = data.filter(m => m.media_type === 'video').map(m => ({ url: m.media_url, id: m.id }))

      setUploadedMedia(images)
      if (videos.length > 0) {
        setFormData(prev => ({ ...prev, videos: videos }))
      }
    } catch (err) {
      console.error('Erro ao carregar mídias:', err)
    }
  }

  useEffect(() => {
    if (property) {
      setFormData(normalizeCharacteristics(property))
      setPropertyId(property.id)
      loadExistingMedia(property.id)
      setActiveTab('info')
    } else {
      setStep(1)
    }
  }, [property, isOpen])

  const resetForm = () => {
    setFormData({
      title: '', description: '', finalidade: 'venda', condicao: 'novo', tipo: 'apartamento',
      price: '', price_on_request: false, city: '', neighborhood: '', address: '',
      bedrooms: '', bathrooms: '', garages: '', area: '', is_featured: false,
      videos: [], videoUrlInput: '',
      characteristics: { internas: [], externas: [], lazer: [] }
    })
    setStep(1)
    setUploadedMedia([])
    setPropertyId(null)
    setActiveTab('info')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleCharacteristicChange = (category, characteristic) => {
    setFormData(prev => {
      const currentCharacteristics = prev.characteristics[category]
      const isSelected = currentCharacteristics.includes(characteristic)
      return {
        ...prev,
        characteristics: {
          ...prev.characteristics,
          [category]: isSelected
            ? currentCharacteristics.filter(c => c !== characteristic)
            : [...currentCharacteristics, characteristic]
        }
      }
    })
  }

  const handleMediaUploadComplete = async (media) => {
    setUploadedMedia(media)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const priceValue = (formData.price_on_request || formData.price === '')
        ? null
        : currencyToNumber(formData.price)

      const finalData = {
        ...normalizeCharacteristics(formData),
        price: Number.isNaN(priceValue) ? null : priceValue,
        // Converter strings vazias em null para campos numéricos
        bedrooms: formData.bedrooms === '' || formData.bedrooms === null ? null : parseInt(formData.bedrooms),
        bathrooms: formData.bathrooms === '' || formData.bathrooms === null ? null : parseInt(formData.bathrooms),
        garages: formData.garages === '' || formData.garages === null ? null : parseInt(formData.garages),
        area: formData.area === '' || formData.area === null ? null : parseFloat(formData.area),
      }

      if (property) {

        await onSave(finalData)
        showToast?.('Imóvel atualizado com sucesso!', 'success')
        handleClose()
      } else {

        if (step === 1) {

          finalData.active = false
          const saved = await onSave(finalData)
          const newPropertyId = saved?.id

          if (!newPropertyId) {
            showToast?.('Erro ao criar imóvel. Tente novamente.', 'error')
            return
          }

          setPropertyId(newPropertyId)
          setStep(2)
        } else {

          if (uploadedMedia.length > 0) {
            await activateProperty(propertyId)
            showToast?.('Imóvel criado e ativado com sucesso!', 'success')
          } else {
            showToast?.('Imóvel criado mas ficará inativo até adicionar imagens.', 'warning')
          }
          handleClose()
        }
      }
    } catch (err) {
      console.error('Erro:', err)
      showToast?.('Erro ao salvar: ' + (err.message || 'Erro desconhecido'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const activateProperty = async (id) => {
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: true })
      })
    } catch (err) {
      console.error('Erro ao ativar imóvel:', err)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addVideoUrl = async () => {
    const url = formData.videoUrlInput?.trim()
    if (!url || !propertyId) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/video-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ video_url: url })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          videos: [...(prev.videos || []), { url: data.media_url, id: data.id }],
          videoUrlInput: ''
        }))
      }
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error)
    }
  }

  const removeVideo = async (video, idx) => {
    if (typeof video === 'object' && video.id && propertyId) {
      try {
        const token = localStorage.getItem('admin_token')
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${video.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      } catch (error) {
        console.error('Erro ao deletar vídeo:', error)
      }
    }
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }))
  }

  if (!isOpen) return null


  const renderInfoForm = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Informações Principais */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Principais</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título do Imóvel *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              placeholder="Ex: Apartamento 2 quartos em Águas Claras"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
              <AutocompleteInput
                name="city"
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                suggestions={citiesSuggestions}
                placeholder="Ex: Brasília"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bairro / Região</label>
              <AutocompleteInput
                name="neighborhood"
                value={formData.neighborhood}
                onChange={(value) => setFormData({ ...formData, neighborhood: value })}
                suggestions={neighborhoodsSuggestions}
                placeholder="Ex: Águas Claras"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço *</label>
            <input
              type="text" name="address" value={formData.address} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              placeholder="Ex: EQSW 301/302"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} required rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              placeholder="Descreva o imóvel..."
            />
          </div>
        </div>
      </div>

      {/* Tipo de Operação */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Operação</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade do Imóvel *</label>
            <select
              name="finalidade" value={formData.finalidade} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="lancamento">Lançamento (Na planta)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condição do Imóvel *</label>
            <select
              name="condicao" value={formData.condicao} onChange={handleChange} required
              disabled={formData.finalidade === 'lancamento'}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue ${formData.finalidade === 'lancamento' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
            >
              {condicaoOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'novo' && 'Novo'}
                  {option === 'usado' && 'Usado'}
                  {option === 'na_planta' && 'Na planta'}
                  {option === 'mobiliado' && 'Mobiliado'}
                  {option === 'nao_mobiliado' && 'Não Mobiliado'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tipo de Imóvel */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Imóvel</h3>
        
        {formData.finalidade === 'lancamento' ? (
          /* Múltiplos tipos para lançamentos */
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              Selecione os tipos de imóveis disponíveis neste lançamento:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'apartamento', label: 'Apartamento' },
                { value: 'casa', label: 'Casa' },
                { value: 'cobertura', label: 'Cobertura' },
                { value: 'terreno', label: 'Terreno' },
                { value: 'comercial', label: 'Comercial' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.property_types?.includes(option.value)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData(prev => ({
                        ...prev,
                        property_types: checked
                          ? [...(prev.property_types || []), option.value]
                          : (prev.property_types || []).filter(t => t !== option.value)
                      }))
                    }}
                    className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {formData.property_types?.length > 0 && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Selecionados: {formData.property_types.map(t => 
                  t === 'apartamento' ? 'Apartamento' : 
                  t === 'casa' ? 'Casa' : 
                  t === 'cobertura' ? 'Cobertura' : 
                  t === 'terreno' ? 'Terreno' : 'Comercial'
                ).join(', ')}
              </p>
            )}
          </div>
        ) : (
          /* Select único para venda/aluguel */
          <select
            name="tipo" value={formData.tipo} onChange={handleChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
          >
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="cobertura">Cobertura</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>
        )}
      </div>

      {/* Características Numéricas */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Características</h3>
        
        {/* Interface para Lançamentos - Tipos de Unidades */}
        {formData.finalidade === 'lancamento' ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Tipos de Unidades (Plantas)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Adicione as diferentes opções de plantas disponíveis neste lançamento.
              </p>
              
              {/* Lista de tipos de unidades */}
              {formData.unit_types?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {formData.unit_types.map((unit, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {unit.bedrooms} {unit.bedrooms === 1 ? 'quarto' : 'quartos'}
                          {unit.suites > 0 && ` (${unit.suites} ${unit.suites === 1 ? 'suíte' : 'suítes'})`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {unit.bathrooms} {unit.bathrooms === 1 ? 'banheiro' : 'banheiros'} • 
                          {unit.garages} {unit.garages === 1 ? 'vaga' : 'vagas'} • 
                          {unit.area}m²
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            unit_types: prev.unit_types.filter((_, i) => i !== index)
                          }))
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Formulário para adicionar novo tipo */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Adicionar Tipo de Unidade</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quartos *</label>
                    <input
                      type="number"
                      id="temp_bedrooms"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Banheiros *</label>
                    <input
                      type="number"
                      id="temp_bathrooms"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Suítes</label>
                    <input
                      type="number"
                      id="temp_suites"
                      min="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vagas *</label>
                    <input
                      type="number"
                      id="temp_garages"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Área (m²) *</label>
                    <input
                      type="number"
                      id="temp_area"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                      placeholder="48"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const bedrooms = parseInt(document.getElementById('temp_bedrooms').value) || 0
                    const bathrooms = parseInt(document.getElementById('temp_bathrooms').value) || 0
                    const suites = parseInt(document.getElementById('temp_suites').value) || 0
                    const garages = parseInt(document.getElementById('temp_garages').value) || 0
                    const area = parseFloat(document.getElementById('temp_area').value) || 0
                    
                    if (bedrooms && bathrooms && garages && area) {
                      setFormData(prev => ({
                        ...prev,
                        unit_types: [...(prev.unit_types || []), { bedrooms, bathrooms, suites, garages, area }]
                      }))
                      // Limpar campos
                      document.getElementById('temp_bedrooms').value = ''
                      document.getElementById('temp_bathrooms').value = ''
                      document.getElementById('temp_suites').value = '0'
                      document.getElementById('temp_garages').value = ''
                      document.getElementById('temp_area').value = ''
                    } else {
                      alert('Preencha todos os campos obrigatórios (*)')
                    }
                  }}
                  className="w-full bg-rd-blue hover:bg-rd-blue-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  + Adicionar Tipo de Unidade
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Campos tradicionais para venda/aluguel */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
              <input
                type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banheiros</label>
              <input
                type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vagas</label>
              <input
                type="number" name="garages" value={formData.garages} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área (m²)</label>
              <input
                type="number" name="area" value={formData.area} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preço */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Valor</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox" name="price_on_request" checked={formData.price_on_request}
              onChange={(e) => setFormData(prev => ({ ...prev, price_on_request: e.target.checked, price: e.target.checked ? '' : prev.price }))}
              className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">Sob consulta</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$) {formData.price_on_request ? '' : '*'}</label>
            <input
              type="text" inputMode="numeric" name="price" value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: maskCurrencyBRL(e.target.value) }))}
              required={!formData.price_on_request} disabled={formData.price_on_request}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue disabled:bg-gray-100"
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>

      {/* Opções */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Opções</h3>
        <div className="flex items-center">
          <input
            type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange}
            className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
          />
          <label className="ml-3 text-sm font-medium text-gray-700">Destaque na página inicial</label>
        </div>
      </div>

      {/* Características */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6">Características do Imóvel</h3>

        {/* Características Internas */}
        <div className="mb-8">
          <h4 className="text-base font-bold text-gray-800 mb-3">Características Internas</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {characteristicsData.internas.map(characteristic => (
              <div key={characteristic} className="flex items-center">
                <input
                  type="checkbox" id={`intern-${characteristic}`}
                  checked={formData.characteristics.internas.includes(characteristic)}
                  onChange={() => handleCharacteristicChange('internas', characteristic)}
                  className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
                />
                <label htmlFor={`intern-${characteristic}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                  {characteristic}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Características Externas */}
        <div className="mb-8">
          <h4 className="text-base font-bold text-gray-800 mb-3">Características Externas</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {characteristicsData.externas.map(characteristic => (
              <div key={characteristic} className="flex items-center">
                <input
                  type="checkbox" id={`extern-${characteristic}`}
                  checked={formData.characteristics.externas.includes(characteristic)}
                  onChange={() => handleCharacteristicChange('externas', characteristic)}
                  className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
                />
                <label htmlFor={`extern-${characteristic}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                  {characteristic}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Lazer */}
        <div className="mb-8">
          <h4 className="text-base font-bold text-gray-800 mb-3">Lazer</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {characteristicsData.lazer.map(characteristic => (
              <div key={characteristic} className="flex items-center">
                <input
                  type="checkbox" id={`lazer-${characteristic}`}
                  checked={formData.characteristics.lazer.includes(characteristic)}
                  onChange={() => handleCharacteristicChange('lazer', characteristic)}
                  className="w-4 h-4 text-rd-blue rounded focus:ring-2 focus:ring-rd-blue"
                />
                <label htmlFor={`lazer-${characteristic}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                  {characteristic}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button" onClick={handleClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={loading}
          className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : (property ? 'Atualizar Informações' : 'Criar Imóvel e Continuar →')}
        </button>
      </div>
    </form>
  )


  const renderMediaSection = () => (
    <div className="p-6 space-y-6">
      <MediaUploader
        onMediaUploadComplete={handleMediaUploadComplete}
        propertyId={propertyId}
        existingMedia={uploadedMedia}
      />

      {/* Vídeos */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vídeos (URLs)</h3>
        <div className="space-y-4">
          {formData.videos && formData.videos.length > 0 && (
            <div className="space-y-3">
              {formData.videos.map((video, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {typeof video === 'string' ? video : video.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(video, idx)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="url"
              value={formData.videoUrlInput || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrlInput: e.target.value }))}
              placeholder="Cole a URL do vídeo aqui (YouTube, Vimeo, etc.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rd-blue focus:border-transparent"
            />
            <button
              type="button"
              onClick={addVideoUrl}
              className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-rd-blue-hover transition-colors whitespace-nowrap"
            >
              + Adicionar
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Cole a URL completa do vídeo (ex: https:
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        {!property && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-rd-blue text-rd-blue rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            ← Voltar para Informações
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : (property ? 'Salvar Alterações' : 'Finalizar')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {property ? 'Editar Imóvel' : 'Novo Imóvel'}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress / Tabs */}
          {!property ? (

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 1 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 1: Informações
                  </span>
                  <span className="text-xs text-gray-500">{step === 1 ? 'Em progresso' : 'Concluída'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`bg-rd-blue h-2 rounded-full transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${step === 2 ? 'text-rd-blue' : 'text-gray-300'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 2 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 2: Imagens/Vídeos
                  </span>
                  <span className="text-xs text-gray-500">{step === 2 ? 'Em progresso' : 'Pendente'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`bg-rd-blue h-2 rounded-full transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
                </div>
              </div>
            </div>
          ) : (

            <div className="flex border-b border-gray-200 -mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'info'
                    ? 'border-rd-blue text-rd-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Info className="w-5 h-5" />
                Informações
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'media'
                    ? 'border-rd-blue text-rd-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <ImageIcon className="w-5 h-5" />
                Mídias
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {property ? (

            activeTab === 'info' ? renderInfoForm() : renderMediaSection()
          ) : (

            step === 1 ? renderInfoForm() : renderMediaSection()
          )}
        </div>
      </div>
    </div>
  )
}
