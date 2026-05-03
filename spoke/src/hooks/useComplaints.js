import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { classify } from '../utils/classify'
import { generateId } from '../utils/formatters'

export function useComplaints() {
  const { state, dispatch } = useApp()

  const addComplaint = useCallback((transcript) => {
    const meta = classify(transcript)
    const complaint = {
      id:        generateId(),
      unit:      state.user.unit,
      resident:  state.user.name,
      avatar:    state.user.avatar,
      transcript: transcript.trim(),
      ...meta,
      status:    'Pending',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'SET_CURRENT',   payload: complaint })
    dispatch({ type: 'ADD_COMPLAINT', payload: complaint })
    dispatch({ type: 'SHOW_TOAST',    payload: 'Complaint submitted successfully!' })
    return complaint
  }, [state.user, dispatch])

  const updateStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } })
    dispatch({ type: 'SHOW_TOAST',    payload: `Status updated to "${status}"` })
  }, [dispatch])

  const showToast = useCallback((message) => {
    dispatch({ type: 'SHOW_TOAST', payload: message })
  }, [dispatch])

  return {
    complaints: state.complaints,
    addComplaint,
    updateStatus,
    showToast,
  }
}
