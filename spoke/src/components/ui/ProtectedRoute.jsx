import { Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user, IS_DEMO } = useAuth()

  if (loading) return null

  if (!IS_DEMO && !isAuthenticated) return <Navigate to="/login" replace />

  if (!IS_DEMO && user && !user.society_id) return <Navigate to="/onboarding" replace />

  if (requiredRole && !IS_DEMO && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
