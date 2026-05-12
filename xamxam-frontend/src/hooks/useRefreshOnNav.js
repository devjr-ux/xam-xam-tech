import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Appelle `callback` à chaque navigation vers la page courante.
 * Compatible Firebase (plus de RefreshContext nécessaire).
 */
export function useRefreshOnNav(callback) {
  const { key } = useLocation()
  const cbRef   = useRef(callback)
  cbRef.current = callback
  useEffect(() => { cbRef.current() }, [key])
}
