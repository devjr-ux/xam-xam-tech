import { useState, useEffect, useCallback } from 'react'
import { instructorService } from '../services/instructorService'

function useFirebaseData(fetcher) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetcher()
      .then(setData)
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

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

  const load = useCallback((overrides) => {
    setLoading(true)
    setError(null)
    instructorService.getMyCourses({ ...params, ...overrides })
      .then(data => setCourses(Array.isArray(data) ? data : (data?.data || [])))
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { courses, loading, error, reload: load }
}

export function useStudents(params = {}) {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback((overrides) => {
    setLoading(true)
    setError(null)
    instructorService.getStudents({ ...params, ...overrides })
      .then(data => setStudents(Array.isArray(data) ? data : (data?.data || [])))
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { students, loading, error, reload: load }
}
