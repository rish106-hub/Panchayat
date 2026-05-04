import { Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'

/**
 * Wraps a route so unauthenticated users are sent to /login.
 * In demo mode (IS_DEMO=true) always renders children.
 *
 * requiredRole: 'board' | 'resident' | undefined (any)
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user, IS_DEMO } = useAuth()

  if (loading) return null // AuthProvider renders LoadingScreen globally

  if (!IS_DEMO && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated but has no society yet → onboarding
  if (!IS_DEMO && user && !user.society_id) {
    return <Navigate to="/onboarding" replace />
  }

  if (requiredRole && !IS_DEMO && user?.role !== requiredRole) {
    return <Navigate to="/home" replace />
  }

  return children
}
