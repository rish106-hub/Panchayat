import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { DEMO_COMPLAINTS } from '../data/demoComplaints'
import { LoadingScreen }   from '../components/ui/LoadingScreen'
import { IS_DEMO }         from '../lib/supabase'

const STORAGE_KEY = 'spoke_v2'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Demo fallback user — only used when IS_DEMO=true and no auth user is available
const DEMO_USER = { name: 'Alex Rivera', unit: '4B', unit_number: '4B', role: 'resident', avatar: 'AR' }

const defaultState = {
  user:             DEMO_USER,
  complaints:       DEMO_COMPLAINTS,
  currentComplaint: null,
  toast:            { message: '', visible: false },
}

function buildInitialState() {
  // In production mode, start with empty complaints — they load from Supabase
  if (!IS_DEMO) {
    return { ...defaultState, complaints: [] }
  }

  const stored = loadFromStorage()
  if (!stored) return defaultState

  // Re-seed demo complaints that aren't already stored
  const storedIds  = new Set((stored.complaints ?? []).map(c => c.id))
  const freshDemos = DEMO_COMPLAINTS.filter(d => !storedIds.has(d.id))

  return {
    ...defaultState,
    ...stored,
    complaints:       [...freshDemos, ...(stored.complaints ?? [])],
    toast:            { message: '', visible: false },
    currentComplaint: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_COMPLAINTS':
      return { ...state, complaints: action.payload }
    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.payload, ...state.complaints] }
    case 'UPDATE_STATUS':
      return {
        ...state,
        complaints: state.complaints.map(c =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      }
    case 'SET_CURRENT':
      return { ...state, currentComplaint: action.payload }
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.payload, visible: true } }
    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, visible: false } }
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state,    dispatch]  = useReducer(reducer, null, buildInitialState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 160)
    return () => clearTimeout(timer)
  }, [])

  // Persist to localStorage only in demo mode — in prod Supabase is the source of truth
  useEffect(() => {
    if (!IS_DEMO) return
    const { toast: _t, currentComplaint: _cc, ...persistable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {hydrated ? children : <LoadingScreen />}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
