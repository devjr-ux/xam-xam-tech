import { useState, useCallback, useRef } from 'react'
import { instructorService } from '../services/instructorService'
import { useRefreshOnNav } from './useRefreshOnNav'

function useFirebaseData(fetcher) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const fetcherRef            = useRef(fetcher)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetcherRef.current()
      .then(setData)
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  // Recharge automatiquement à chaque navigation vers la page
  useRefreshOnNav(load)

  return { data, loading, error, reload: load }
}

export function useDashboard() {
  return useFirebaseData(() => instructorService.getDashboard())
}

export function useInstructorStats() {
  return useFirebaseData(() => instructorService.getStats())
}

export function useMyCourses(params = {}) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const paramsRef             = useRef(params)

  const load = useCallback((overrides) => {
    setLoading(true)
    setError(null)
    instructorService.getMyCourses({ ...paramsRef.current, ...overrides })
      .then(data => setCourses(Array.isArray(data) ? data : (data?.data || [])))
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  useRefreshOnNav(load)

  return { courses, loading, error, reload: load }
}

export function useStudents(params = {}) {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const paramsRef               = useRef(params)

  const load = useCallback((overrides) => {
    setLoading(true)
    setError(null)
    instructorService.getStudents({ ...paramsRef.current, ...overrides })
      .then(data => setStudents(Array.isArray(data) ? data : (data?.data || [])))
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  useRefreshOnNav(load)

  return { students, loading, error, reload: load }
}
