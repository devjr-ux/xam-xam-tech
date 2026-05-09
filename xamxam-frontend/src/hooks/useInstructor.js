import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { instructorService } from '../services/instructorService'
import { useRefresh } from '../context/RefreshContext'

/* Combine location.key (changement de page) + tick (action manuelle)
   pour forcer le rechargement des données dans tous les cas */

export function useDashboard() {
  const { key }           = useLocation()
  const { tick }          = useRefresh()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    instructorService.getDashboard()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [key, tick])

  return { data, loading, error }
}

export function useInstructorStats() {
  const { key }           = useLocation()
  const { tick }          = useRefresh()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    instructorService.getStats()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [key, tick])

  return { data, loading, error }
}

export function useMyCourses(initialParams = {}) {
  const { key }             = useLocation()
  const { tick }            = useRefresh()
  const [courses, setCourses] = useState([])
  const [meta, setMeta]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [params, setParams] = useState(initialParams)

  const load = useCallback((overrides) => {
    const p = overrides ? { ...params, ...overrides } : params
    setLoading(true)
    setError(null)
    instructorService.getMyCourses(p)
      .then(r => {
        setCourses(r.data.data ?? r.data)
        setMeta(r.data.meta ?? null)
      })
      .catch(e => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => { load() }, [key, tick, load])

  return { courses, meta, loading, error, reload: load }
}

export function useStudents(initialParams = {}) {
  const { key }               = useLocation()
  const { tick }              = useRefresh()
  const [students, setStudents] = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [params, setParams]   = useState(initialParams)

  const load = useCallback((overrides) => {
    const p = overrides ? { ...params, ...overrides } : params
    setLoading(true)
    setError(null)
    instructorService.getStudents(p)
      .then(r => {
        setStudents(r.data.data ?? r.data)
        setMeta(r.data.meta ?? null)
      })
      .catch(e => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => { load() }, [key, tick, load])

  return { students, meta, loading, error, reload: load }
}
