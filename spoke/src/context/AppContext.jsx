import { createContext, useContext, useReducer, useEffect } from 'react'
import { DEMO_COMPLAINTS } from '../data/demoComplaints'

const STORAGE_KEY = 'panchayat_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const DEFAULT_USER = { name: 'Alex Rivera', unit: '4B', role: 'resident', avatar: 'AR' }

const defaultState = {
  user: DEFAULT_USER,
  complaints: DEMO_COMPLAINTS,
  currentComplaint: null,
  toast: { message: '', visible: false },
}

function buildInitialState() {
  const stored = loadFromStorage()
  if (!stored) return defaultState

  // Re-seed demo complaints that aren't already in stored list
  const storedIds = new Set((stored.complaints ?? []).map(c => c.id))
  const freshDemos = DEMO_COMPLAINTS.filter(d => !storedIds.has(d.id))

  return {
    ...defaultState,
    ...stored,
    complaints: [...freshDemos, ...(stored.complaints ?? [])],
    // Never rehydrate transient state
    toast: { message: '', visible: false },
    currentComplaint: null,
  }
}

function reducer(state, action) {
  switch (action.type) {
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
  const [state, dispatch] = useReducer(reducer, null, buildInitialState)

  useEffect(() => {
    // Strip transient fields before persisting
    const { toast: _t, currentComplaint: _cc, ...persistable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
