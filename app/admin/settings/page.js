'use client'

import { useState, useEffect } from 'react'

const sections = [
  {
    key: 'hero-image',
    title: 'Capa principal',
    subtitle: 'Imagem de fundo do herói na home',
    help: 'Use imagem 16:9, pelo menos 1920x1080.'
  },
  {
    key: 'valuation-image',
    title: 'Saiba quanto vale seu imóvel',
    subtitle: 'Imagem de fundo da seção de avaliação',
    help: 'Use imagem 16:9, boa legibilidade do texto.'
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
          'valuation-image': data['valuation-image']?.url || ''
        })
      } catch (err) {
        console.error('Erro ao carregar configurações', err)
      }
    }
    load()
  }, [])

  const saveUrl = async (key) => {
    const url = values[key]
    if (!url) {
      alert('Informe uma URL')
      return
    }
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value: { url } })
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
    const currentUrl = values[section.key] || ''
    const isSaving = saving[section.key]
    const isUploading = uploading[section.key]

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
                value={currentUrl}
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
              <p className="text-xs text-gray-500">Ou escolha um arquivo local para enviar ao R2.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveUrl(section.key)}
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
            {currentUrl ? (
              <img
                src={currentUrl}
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
        <p className="text-gray-600 mt-2">Envie para o R2 ou cole uma URL pública para as seções principais.</p>
      </div>

      <div className="space-y-6">
        {sections.map(renderSection)}
      </div>
    </div>
  )
}
