import { useCallback, useEffect } from 'react'
import { useApp }  from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { classify } from '../utils/classify'
import { generateId } from '../utils/formatters'
import { IS_DEMO } from '../lib/supabase'
import {
  fetchComplaints,
  createComplaint,
  updateComplaintStatus,
  subscribeToComplaints,
} from '../api/complaints'

export function useComplaints() {
  const { state, dispatch } = useApp()
  const { user } = useAuth()

  const societyId = user?.society_id ?? 'demo'

  // ── Load complaints on mount (production only) ───────────────────────────
  useEffect(() => {
    if (IS_DEMO) return

    fetchComplaints(societyId).then(({ data }) => {
      if (data) dispatch({ type: 'SET_COMPLAINTS', payload: data })
    })
  }, [societyId, dispatch])

  // ── Realtime subscription (production only) ──────────────────────────────
  useEffect(() => {
    if (IS_DEMO) return

    const unsubscribe = subscribeToComplaints(
      societyId,
      (newComplaint) => dispatch({ type: 'ADD_COMPLAINT', payload: newComplaint }),
      (updated)      => dispatch({ type: 'UPDATE_STATUS', payload: { id: updated.id, status: updated.status } })
    )

    return unsubscribe
  }, [societyId, dispatch])

  // ── Add complaint ────────────────────────────────────────────────────────

  const addComplaint = useCallback(async (transcript) => {
    const meta = classify(transcript)

    if (IS_DEMO) {
      const complaint = {
        id:         generateId(),
        unit:       state.user.unit_number ?? state.user.unit ?? '—',
        unit_number: state.user.unit_number ?? state.user.unit ?? '—',
        resident:   state.user.name,
        avatar:     state.user.avatar,
        transcript: transcript.trim(),
        ...meta,
        status:     'Pending',
        created_at: new Date().toISOString(),
        createdAt:  new Date().toISOString(),
      }
      dispatch({ type: 'SET_CURRENT',   payload: complaint })
      dispatch({ type: 'ADD_COMPLAINT', payload: complaint })
      dispatch({ type: 'SHOW_TOAST',    payload: 'Complaint submitted successfully!' })
      return complaint
    }

    const payload = {
      society_id:  societyId,
      created_by:  user.id,
      unit_number: user.unit_number,
      resident:    user.name,
      avatar:      user.avatar ?? user.name?.slice(0, 2).toUpperCase(),
      transcript:  transcript.trim(),
      title:       transcript.trim().slice(0, 80),
      ...meta,
      status:      'Pending',
    }

    const { data, error } = await createComplaint(payload)

    if (error) {
      dispatch({ type: 'SHOW_TOAST', payload: 'Failed to submit complaint. Please try again.' })
      return null
    }

    // Realtime will insert it, but set current immediately for the confirmation screen
    dispatch({ type: 'SET_CURRENT', payload: data })
    dispatch({ type: 'SHOW_TOAST', payload: 'Complaint submitted successfully!' })
    return data
  }, [state.user, user, societyId, dispatch])

  // ── Update status ────────────────────────────────────────────────────────

  const updateStatus = useCallback(async (id, status) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } })
    dispatch({ type: 'SHOW_TOAST',    payload: `Status updated to "${status}"` })

    if (!IS_DEMO) {
      const { error } = await updateComplaintStatus(id, status, user?.id)
      if (error) {
        // Rollback on failure — refetch
        fetchComplaints(societyId).then(({ data }) => {
          if (data) dispatch({ type: 'SET_COMPLAINTS', payload: data })
        })
        dispatch({ type: 'SHOW_TOAST', payload: 'Update failed. Please try again.' })
      }
    }
  }, [user, societyId, dispatch])

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
