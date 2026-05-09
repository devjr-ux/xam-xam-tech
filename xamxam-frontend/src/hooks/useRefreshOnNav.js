import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useRefresh } from '../context/RefreshContext'

/**
 * Appelle `callback` à chaque navigation ET après chaque refresh() manuel.
 * - location.key  : change à chaque navigation React Router
 * - tick          : change quand refresh() est appelé manuellement
 */
export function useRefreshOnNav(callback) {
  const { key }   = useLocation()
  const { tick }  = useRefresh()
  const cbRef     = useRef(callback)
  cbRef.current   = callback

  useEffect(() => {
    cbRef.current()
  }, [key, tick])
}
