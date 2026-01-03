import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      router.push('/admin')
      setLoading(false)
      return
    }

    setToken(token)
    setIsAuthenticated(true)
    setLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    router.push('/admin')
  }

  return {
    isAuthenticated,
    loading,
    token,
    logout,
  }
}
