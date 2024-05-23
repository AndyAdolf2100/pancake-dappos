import { useState } from 'react'

export function useLoading(defaultValue?: boolean) {
  const [loading, setLoading] = useState(defaultValue ?? false)
  const startLoading = () => {
    setLoading(true)
  }
  const endLoading = () => {
    setLoading(false)
  }
  return {
    loading,
    startLoading,
    endLoading,
  }
}
