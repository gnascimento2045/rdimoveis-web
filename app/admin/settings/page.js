'use client'

import { useState, useEffect } from 'react'

const sections = [
  {
    key: 'hero-image',
    title: 'Capa principal',
    subtitle: 'Imagem principal',
    help: 'Use imagem 16:9, pelo menos 1920x1080.',
    type: 'image'
  },
  {
    key: 'valuation-image',
    title: 'Saiba quanto vale seu imóvel',
    subtitle: 'Imagem de fundo da seção de avaliação',
    help: 'Use imagem 16:9, boa legibilidade do texto.',
    type: 'image'
  },
  {
    key: 'emprestimos-hero-image',
    title: 'Empréstimo Consignado',
    subtitle: 'Imagem de fundo da aba Empréstimos',
    help: 'Use imagem 16:9, pelo menos 1920x1080.',
    type: 'image'
  },
  {
    key: 'hero-title',
    title: 'Título da Capa',
    subtitle: 'Texto principal da página inicial',
    help: 'Use quebras de linha para destacar cada palavra.',
    type: 'text',
    multiline: true
  },
  {
    key: 'hero-subtitle',
    title: 'Subtítulo da Capa',
    subtitle: 'Texto abaixo do título principal',
    help: 'Descreva o objetivo do site.',
    type: 'text'
  },
  {
    key: 'valuation-title',
    title: 'Título Avaliação',
    subtitle: 'Título da seção de avaliação',
    help: 'Convide o usuário a avaliar seu imóvel.',
    type: 'text'
  }
]

export default function AdminSettings() {
  const [values, setValues] = useState({})
  const [uploading, setUploading] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`)
        const data = await res.json()
        setValues({
          'hero-image': data['hero-image']?.url || '',
          'valuation-image': data['valuation-image']?.url || '',
          'emprestimos-hero-image': data['emprestimos-hero-image']?.url || '',
          'hero-title': data['hero-title']?.text || 'IDEALIZE!\nSONHE!\nREALIZE!',
          'hero-subtitle': data['hero-subtitle']?.text || 'Encontre o imóvel dos seus sonhos em Brasília',
          'valuation-title': data['valuation-title']?.text || 'Saiba quanto vale seu imóvel'
        })
      } catch (err) {
        console.error('Erro ao carregar configurações', err)
      }
    }
    load()
  }, [])

  const saveUrl = async (key, section) => {
    const value = values[key]
    if (!value) {
      alert(section.type === 'text' ? 'Informe o texto' : 'Informe uma URL')
      return
    }
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      const token = localStorage.getItem('admin_token')
      const payload = section.type === 'text' ? { text: value } : { url: value }
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value: payload })
      })
      alert('Salvo com sucesso')
    } catch (err) {
      alert('Erro ao salvar')
      console.error(err)
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  const uploadFile = async (key, file) => {
    if (!file) return
    setUploading(prev => ({ ...prev, [key]: true }))
    try {
      const token = localStorage.getItem('admin_token')
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/upload-hero-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      })
      const uploaded = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploaded?.detail || 'Erro no upload')

      setValues(prev => ({ ...prev, [key]: uploaded.image_url }))
      // Persist setting after upload
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value: { url: uploaded.image_url } })
      })
      alert('Upload salvo com sucesso')
    } catch (err) {
      alert('Erro ao enviar imagem')
      console.error(err)
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  const renderSection = (section) => {
    const currentValue = values[section.key] || ''
    const isSaving = saving[section.key]
    const isUploading = uploading[section.key]

    if (section.type === 'text') {
      return (
        <div key={section.key} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-gray-400">Texto</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Texto</label>
              {section.multiline ? (
                <textarea
                  value={currentValue}
                  onChange={(e) => setValues(prev => ({ ...prev, [section.key]: e.target.value }))}
                  placeholder="Digite o texto..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                />
              ) : (
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => setValues(prev => ({ ...prev, [section.key]: e.target.value }))}
                  placeholder="Digite o texto..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">{section.help}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveUrl(section.key, section)}
                disabled={isSaving}
                className="px-5 py-3 rounded-lg bg-rd-blue text-white font-semibold hover:bg-rd-blue-hover transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => setValues(prev => ({ ...prev, [section.key]: '' }))}
                disabled={isSaving}
                className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={section.key} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
          </div>
          <span className="text-xs uppercase tracking-wide text-gray-400">Imagem</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Colar URL pública</label>
              <input
                type="url"
                value={currentValue}
                onChange={(e) => setValues(prev => ({ ...prev, [section.key]: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
              />
              <p className="text-xs text-gray-500 mt-1">{section.help}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFile(section.key, e.target.files?.[0])}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-rd-blue file:text-white file:cursor-pointer hover:file:bg-rd-blue-hover"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveUrl(section.key, section)}
                disabled={isSaving || isUploading}
                className="px-5 py-3 rounded-lg bg-rd-blue text-white font-semibold hover:bg-rd-blue-hover transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Salvar URL'}
              </button>
              <button
                onClick={() => setValues(prev => ({ ...prev, [section.key]: '' }))}
                disabled={isSaving || isUploading}
                className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            {currentValue ? (
              <img
                src={currentValue}
                alt={`Preview ${section.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Pré-visualização da imagem
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 font-semibold">
                Enviando...
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Imagens do site</h1>
      </div>

      <div className="space-y-6">
        {sections.map(renderSection)}
      </div>
    </div>
  )
}
