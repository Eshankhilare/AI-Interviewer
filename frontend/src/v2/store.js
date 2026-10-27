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

const BG_KEY = 'studio-background'
const bgListeners = new Set()
let bgCurrent = null

const readBackground = () => {
  const forced = new URLSearchParams(window.location.search).get('bg')
  if (forced === 'flux' || forced === 'video') {
    localStorage.setItem(BG_KEY, forced)
    return forced
  }
  return localStorage.getItem(BG_KEY) || 'video'
}

export const getBackground = () => {
  if (bgCurrent === null) bgCurrent = readBackground()
  return bgCurrent
}

export const setBackground = (value) => {
  bgCurrent = value
  localStorage.setItem(BG_KEY, value)
  bgListeners.forEach((listener) => listener())
}

export const useBackground = () => {
  const [, bump] = useState(0)
  useEffect(() => {
    const listener = () => bump((n) => n + 1)
    bgListeners.add(listener)
    return () => bgListeners.delete(listener)
  }, [])
  return { background: getBackground(), setBackground }
}
