'use client'

import AdminSidebar from '@/components/AdminSidebar'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin'
    const { isAuthenticated, loading, logout } = useAdminAuth()

    // Página de login não precisa de autenticação
    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rd-blue"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar onLogout={logout} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8">
                {children}
            </main>
        </div>
    )
}
