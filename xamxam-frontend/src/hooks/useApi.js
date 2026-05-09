import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, deps = [], immediate = true) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute])

  return { data, loading, error, execute, setData }
}

export function useMutation(apiCall) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(...args)
      return response.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  return { mutate, loading, error }
}
