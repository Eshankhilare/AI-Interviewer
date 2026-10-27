import { useEffect, useState } from 'react'

const KEY = 'ui-version'
const listeners = new Set()
let current = null

const read = () => {
  const forced = new URLSearchParams(window.location.search).get('ui')
  if (forced === 'classic' || forced === 'studio') {
    localStorage.setItem(KEY, forced)
    return forced
  }
  return localStorage.getItem(KEY) || 'studio'
}

export const getUIVersion = () => {
  if (current === null) current = read()
  return current
}

export const setUIVersion = (version) => {
  current = version
  localStorage.setItem(KEY, version)
  listeners.forEach((listener) => listener())
}

export const useUIVersion = () => {
  const [, bump] = useState(0)
  useEffect(() => {
    const listener = () => bump((n) => n + 1)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])
  return { version: getUIVersion(), setVersion: setUIVersion }
}
