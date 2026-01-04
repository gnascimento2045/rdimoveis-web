'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import FeaturedModal from '@/components/FeaturedModal'

export default function AdminFeatured() {
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState(null)

  const fetchNeighborhoods = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/neighborhoods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Erro ao buscar destaques:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este destaque?')) return

    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/neighborhoods/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setNeighborhoods(neighborhoods.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`http://localhost:8000/api/neighborhoods/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      })
      setNeighborhoods(neighborhoods.map(n => 
        n.id === id ? { ...n, active: !currentStatus } : n
      ))
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const handleSaveNeighborhood = async (neighborhoodData) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      if (editingNeighborhood) {
        await fetch(`http://localhost:8000/api/neighborhoods/${editingNeighborhood.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(neighborhoodData)
        })
      } else {
        await fetch('http://localhost:8000/api/neighborhoods', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(neighborhoodData)
        })
      }

      setShowModal(false)
      setEditingNeighborhood(null)
      fetchNeighborhoods()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Destaques da Página Inicial</h1>
          <p className="text-gray-600 mt-2">Gerencie os bairros em destaque</p>
        </div>
        <button
          onClick={() => {
            setEditingNeighborhood(null)
            setShowModal(true)
          }}
          className="bg-rd-blue text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2 hover:bg-rd-blue-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Destaque</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">Carregando...</div>
        ) : neighborhoods.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhum destaque cadastrado
          </div>
        ) : (
          neighborhoods.map((neighborhood) => (
            <div key={neighborhood.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {neighborhood.image_url && (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={neighborhood.image_url}
                    alt={neighborhood.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{neighborhood.name}</h3>
                    <p className="text-sm text-gray-600">{neighborhood.city}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    neighborhood.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {neighborhood.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(neighborhood.id, neighborhood.active)}
                    className="flex-1 text-blue-600 hover:text-blue-900 transition-colors py-2 font-medium text-sm flex items-center justify-center space-x-1"
                  >
                    {neighborhood.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{neighborhood.active ? 'Ativo' : 'Inativo'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingNeighborhood(neighborhood)
                      setShowModal(true)
                    }}
                    className="flex-1 text-yellow-600 hover:text-yellow-900 transition-colors py-2 font-medium text-sm flex items-center justify-center space-x-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(neighborhood.id)}
                    className="flex-1 text-red-600 hover:text-red-900 transition-colors py-2 font-medium text-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Deletar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <FeaturedModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingNeighborhood(null)
        }}
        onSave={handleSaveNeighborhood}
        neighborhood={editingNeighborhood}
      />
    </div>
  )
}
