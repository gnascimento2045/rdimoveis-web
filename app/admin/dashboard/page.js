'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Settings, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        
        // Buscar propriedades
        const propertiesRes = await fetch('http://localhost:8000/api/properties?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const properties = await propertiesRes.json()
        
        setStats({
          totalProperties: properties.length,
          activeProperties: properties.filter(p => p.active).length,
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      icon: Home,
      label: 'Total de Imóveis',
      value: stats.totalProperties,
      color: 'bg-blue-500',
      href: '/admin/properties',
    },
    {
      icon: Home,
      label: 'Imóveis Ativos',
      value: stats.activeProperties,
      color: 'bg-green-500',
      href: '/admin/properties',
    },
    {
      icon: Settings,
      label: 'Configurações',
      value: '→',
      color: 'bg-purple-500',
      href: '/admin/settings',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel administrativo RD IMÓVEIS DF</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link key={index} href={card.href}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '-' : card.value}
                    </p>
                  </div>
                  <div className={`${card.color} p-4 rounded-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/properties?action=new" className="bg-gradient-to-br from-rd-blue to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Home className="w-8 h-8 mb-2" />
            <h3 className="font-bold text-lg">Novo Imóvel</h3>
            <p className="text-blue-100 text-sm mt-1">Publicar um novo imóvel</p>
          </Link>
        
          <Link href="/admin/settings" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Settings className="w-8 h-8 mb-2" />
            <h3 className="font-bold text-lg">Configurações</h3>
            <p className="text-purple-100 text-sm mt-1">Ajustes do site</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
