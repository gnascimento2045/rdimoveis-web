'use client'

import { useState, useCallback } from 'react'

export default function useToast() {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}
