import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const API = `${BACKEND_URL}/api`

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

const authHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authService = {
  async login(email, password) {
    const response = await axios.post(`${API}/auth/login`, { email, password })
    if (response.data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token)
    }
    return response.data
  },

  async getMe() {
    const response = await axios.get(`${API}/auth/me`, { headers: authHeader() })
    return response.data
  },

  async changePassword(currentPassword, newPassword) {
    const response = await axios.post(
      `${API}/auth/change-password`,
      { current_password: currentPassword, new_password: newPassword },
      { headers: authHeader() }
    )
    return response.data
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },

  isAuthenticated() {
    return !!getToken()
  }
}

export const propertyService = {
  async getProperties(filters = {}) {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.active !== undefined) params.append('active', filters.active)
    
    const response = await axios.get(`${API}/properties?${params.toString()}`)
    return response.data
  },

  async getProperty(id) {
    const response = await axios.get(`${API}/properties/${id}`)
    return response.data
  },

  async createProperty(data) {
    const response = await axios.post(`${API}/properties`, data, { headers: authHeader() })
    return response.data
  },

  async updateProperty(id, data) {
    const response = await axios.put(`${API}/properties/${id}`, data, { headers: authHeader() })
    return response.data
  },

  async deleteProperty(id) {
    const response = await axios.delete(`${API}/properties/${id}`, { headers: authHeader() })
    return response.data
  },

  async uploadImage(propertyId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(
      `${API}/properties/${propertyId}/media`,
      formData,
      { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  async getPropertyMedia(propertyId) {
    const response = await axios.get(`${API}/properties/${propertyId}/media`)
    return response.data
  },

  async deleteMedia(propertyId, mediaId) {
    const response = await axios.delete(
      `${API}/properties/${propertyId}/media/${mediaId}`,
      { headers: authHeader() }
    )
    return response.data
  },

  async updateMediaOrder(propertyId, mediaId, displayOrder) {
    const response = await axios.put(
      `${API}/properties/${propertyId}/media/${mediaId}/order`,
      { display_order: displayOrder },
      { headers: authHeader() }
    )
    return response.data
  },

  async deleteImage(propertyId, imageUrl) {
    const response = await axios.delete(
      `${API}/properties/${propertyId}/images`,
      { headers: authHeader(), params: { image_url: imageUrl } }
    )
    return response.data
  }
}