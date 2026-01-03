'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import PropertyCreationWizard from '@/components/PropertyCreationWizard'

export default function AdminProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch('http://localhost:8000/api/properties?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este imóvel?')) return

    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`http://localhost:8000/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setProperties(properties.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`http://localhost:8000/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      })
      setProperties(properties.map(p => 
        p.id === id ? { ...p, active: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const handleSaveProperty = async (propertyData) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      if (editingProperty) {
        // Atualizar
        await fetch(`http://localhost:8000/api/properties/${editingProperty.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(propertyData)
        })
      } else {
        // Criar novo
        await fetch('http://localhost:8000/api/properties', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(propertyData)
        })
      }

      setShowModal(false)
      setEditingProperty(null)
      fetchProperties()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os imóveis cadastrados</p>
        </div>
        <button
          onClick={() => {
            setEditingProperty(null)
            setShowModal(true)
          }}
          className="bg-rd-blue text-white px-6 py-3 rounded-lg font-bold flex items-center space-x-2 hover:bg-rd-blue-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Imóvel</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Carregando...</div>
        ) : properties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum imóvel cadastrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Título</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Cidade</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Preço</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{property.title}</td>
                    <td className="px-6 py-4">{property.city}</td>
                    <td className="px-6 py-4">R$ {property.price?.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        property.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {property.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button
                        onClick={() => handleToggleActive(property.id, property.active)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title={property.active ? 'Desativar' : 'Ativar'}
                      >
                        {property.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProperty(property)
                          setShowModal(true)
                        }}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <PropertyCreationWizard
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingProperty(null)
        }}
        onSave={handleSaveProperty}
        property={editingProperty}
      />
    </div>
  )
}
