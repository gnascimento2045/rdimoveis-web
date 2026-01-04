'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import MediaUploader from './MediaUploader'
import MediaManager from './MediaManager'

export default function PropertyCreationWizard({ isOpen, onClose, onSave, property = null }) {
  const [step, setStep] = useState(1) // Step 1: Media Upload, Step 2: Property Details
  const [uploadedMedia, setUploadedMedia] = useState([])
  const [propertyId, setPropertyId] = useState(null)

  // Características do imóvel
  const characteristicsData = {
    internas: [
      'Ar condicionado',
      'Armário banheiro',
      'Box banheiro',
      'Despensa',
      'Área de serviço',
      'Lavabo',
      'Área privativa',
      'Armário cozinha',
      'Closet',
      'Armário quarto',
      'Rouparia',
      'Varanda gourmet',
      'DCE'
    ],
    externas: [
      'Segurança 24 horas',
      'Interfone',
      'Portaria 24 horas'
    ],
    lazer: [
      'Salão de festas',
      'Churrasqueira',
      'Piscina',
      'Espaço Gourmet',
      'Hidromassagem',
      'Playground'
    ]
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    finalidade: 'venda',
    condicao: 'novo',
    tipo: 'apartamento',
    price: '',
    city: '',
    neighborhood: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    garages: '',
    area: '',
    is_featured: false,
    videos: [],
    videoUrlInput: '', // Campo temporário para input de URL
    characteristics: {
      internas: [],
      externas: [],
      lazer: []
    }
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

  const loadExistingMedia = async (propId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propId}/media`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        console.error('Erro ao carregar mídias:', response.status)
        return
      }

      const data = await response.json()
      console.log('Mídias carregadas:', data)
      
      // Separar imagens e vídeos
      const images = data.filter(m => m.media_type === 'image')
      const videos = data.filter(m => m.media_type === 'video').map(m => ({ url: m.media_url, id: m.id }))
      
      setUploadedMedia(images)
      
      // Carregar URLs de vídeo no formData
      if (videos.length > 0) {
        setFormData(prev => ({
          ...prev,
          videos: videos
        }))
      }
    } catch (err) {
      console.error('Erro ao carregar mídias:', err)
    }
  }

  const createEmptyProperty = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Novo Imóvel',
          description: 'Descrição pendente',
          finalidade: 'venda',
          condicao: 'novo',
          tipo: 'apartamento',
          price: 0,
          city: 'Brasília',
          neighborhood: '',
          address: '',
          bedrooms: 0,
          bathrooms: 0,
          garages: 0,
          area: 0,
          is_featured: false,
          videos: [],
        })
      })

      if (!response.ok) {
        console.error('Erro ao criar propriedade vazia')
        return
      }

      const newProperty = await response.json()
      setPropertyId(newProperty.id)
    } catch (err) {
      console.error('Erro ao criar propriedade:', err)
    }
  }

  useEffect(() => {
    if (property) {
      setFormData(property)
      setPropertyId(property.id)
      // Carregar mídias existentes
      loadExistingMedia(property.id)
      setStep(1) // Para edição, começa no Step 1 para gerenciar mídias
    } else if (isOpen && !propertyId) {
      // Criar propriedade vazia ao abrir modal para novo imóvel
      createEmptyProperty()
    }
  }, [property, isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      finalidade: 'venda',
      condicao: 'novo',
      tipo: 'apartamento',
      price: '',
      city: '',
      neighborhood: '',
      address: '',
      bedrooms: '',
      bathrooms: '',
      garages: '',
      area: '',
      is_featured: false,
      videos: [],
      characteristics: {
        internas: [],
        externas: [],
        lazer: []
      }
    })
    setStep(1)
    setUploadedMedia([])
    if (!property) {
      setPropertyId(null)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
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
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const finalData = {
      ...formData,
      ...(propertyId && { id: propertyId }),
      images: uploadedMedia.map(m => m.media_url)
    }

    // Salvar a propriedade
    await onSave(finalData)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header com indicador de progresso */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {property ? 'Editar Imóvel' : 'Novo Imóvel'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicator */}
          {!property && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 1 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 1: Imagens/Vídeos
                  </span>
                  <span className="text-xs text-gray-500">{step === 1 ? 'Em progresso' : 'Concluída'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-rd-blue h-2 rounded-full transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`}
                  />
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${step === 2 ? 'text-rd-blue' : 'text-gray-300'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 2 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 2: Informações
                  </span>
                  <span className="text-xs text-gray-500">{step === 2 ? 'Em progresso' : 'Pendente'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-rd-blue h-2 rounded-full transition-all ${step === 2 ? 'w-full' : 'w-0'}`}
                  />
                </div>
              </div>
            </div>
          )}
          {property && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 1 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 1: Gerenciar Mídias
                  </span>
                  <span className="text-xs text-gray-500">{step === 1 ? 'Em progresso' : 'Concluída'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-rd-blue h-2 rounded-full transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`}
                  />
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${step === 2 ? 'text-rd-blue' : 'text-gray-300'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${step === 2 ? 'text-rd-blue' : 'text-gray-600'}`}>
                    Etapa 2: Informações
                  </span>
                  <span className="text-xs text-gray-500">{step === 2 ? 'Em progresso' : 'Pendente'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-rd-blue h-2 rounded-full transition-all ${step === 2 ? 'w-full' : 'w-0'}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 && !property ? (
            <div className="p-6 space-y-6">
              <MediaUploader
                onMediaUploadComplete={handleMediaUploadComplete}
                propertyId={propertyId}
                existingMedia={uploadedMedia}
              />
              
              {/* Vídeos - URLs */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vídeos (URLs)</h3>
                <div className="space-y-4">
                  {/* Lista de vídeos adicionados */}
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
                            onClick={async () => {
                              // Se tem ID, deletar do backend
                              if (typeof video === 'object' && video.id && propertyId) {
                                try {
                                  const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
                                  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${video.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  })
                                } catch (error) {
                                  console.error('Erro ao deletar vídeo:', error)
                                }
                              }
                              
                              const newVideos = formData.videos.filter((_, i) => i !== idx)
                              setFormData(prev => ({ ...prev, videos: newVideos }))
                            }}
                            className="px-3 py-1 text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Input para adicionar nova URL */}
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
                      onClick={async () => {
                        const url = formData.videoUrlInput?.trim()
                        if (url && propertyId) {
                          try {
                            const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
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
                      }}
                      className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-rd-blue-hover transition-colors whitespace-nowrap"
                    >
                      + Adicionar
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Cole a URL completa do vídeo (ex: https://youtube.com/watch?v=...)
                  </p>
                </div>
              </div>
            </div>
          ) : step === 1 && property ? (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Gerenciar Mídias</h3>
                <MediaManager
                  onMediaChange={setUploadedMedia}
                  propertyId={propertyId}
                  existingMedia={uploadedMedia}
                  isEditing={true}
                />
              </div>
              
              {/* Vídeos - URLs */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vídeos (URLs)</h3>
                <div className="space-y-4">
                  {/* Lista de vídeos adicionados */}
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
                            onClick={async () => {
                              // Se tem ID, deletar do backend
                              if (typeof video === 'object' && video.id && propertyId) {
                                try {
                                  const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
                                  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${propertyId}/media/${video.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  })
                                } catch (error) {
                                  console.error('Erro ao deletar vídeo:', error)
                                }
                              }
                              
                              const newVideos = formData.videos.filter((_, i) => i !== idx)
                              setFormData(prev => ({ ...prev, videos: newVideos }))
                            }}
                            className="px-3 py-1 text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Input para adicionar nova URL */}
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
                      onClick={async () => {
                        const url = formData.videoUrlInput?.trim()
                        if (url && propertyId) {
                          try {
                            const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
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
                      }}
                      className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-rd-blue-hover transition-colors whitespace-nowrap"
                    >
                      + Adicionar
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Cole a URL completa do vídeo (ex: https://youtube.com/watch?v=...)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  Continuar para Informações
                </button>
              </div>
            </div>
          ) : (
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

              {/* Tipo de Imóvel */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tipo de Imóvel</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                  >
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="condominio">Condomínio</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Selecione o tipo de imóvel que está cadastrando
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

              {/* Destaque */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Opções</h3>
                <div className="space-y-4">
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
                          type="checkbox"
                          id={`intern-${characteristic}`}
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
                          type="checkbox"
                          id={`extern-${characteristic}`}
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
                          type="checkbox"
                          id={`lazer-${characteristic}`}
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

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-rd-blue text-rd-blue rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  ← Voltar para Mídias
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rd-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  {property ? 'Atualizar' : 'Criar'} Imóvel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
