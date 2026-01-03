'use client'

import { useState } from 'react'
import { Settings, Save } from 'lucide-react'

export default function AdminSettings() {
  const [heroImage, setHeroImage] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSaveHeroImage = async () => {
    if (!heroImage) {
      alert('Por favor, insira uma URL de imagem')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      await fetch('http://localhost:8000/api/settings/hero-image', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'hero-image',
          value: { url: heroImage }
        })
      })

      alert('Imagem salva com sucesso!')
      setHeroImage('')
    } catch (error) {
      alert('Erro ao salvar imagem')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3">
          <Settings className="w-8 h-8" />
          <span>Configurações do Site</span>
        </h1>
        <p className="text-gray-600 mt-2">Ajustes globais do site</p>
      </div>

      {/* Hero Image */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Imagem Principal da Home</h2>
          <p className="text-gray-600">Altere a imagem de fundo da seção principal do site</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem (usar URLs públicas)
            </label>
            <input
              type="url"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue"
            />
            <p className="text-xs text-gray-500 mt-2">
              Exemplo: https://images.unsplash.com/photo-1625426242633-3be4b3379dfb
            </p>
          </div>

          {heroImage && (
            <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden border-2 border-rd-blue">
              <img
                src={heroImage}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => alert('Erro ao carregar imagem. Verifique a URL.')}
              />
            </div>
          )}

          <button
            onClick={handleSaveHeroImage}
            disabled={saving}
            className="w-full bg-rd-blue hover:bg-rd-blue-hover text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Dica</h3>
        <p className="text-sm text-blue-800">
          Use URLs públicas de imagens. Recomendamos usar o Unsplash, Pexels ou similar. 
          A imagem ideal tem proporção 16:9 e pelo menos 1920x1080 pixels de resolução.
        </p>
      </div>
    </div>
  )
}
