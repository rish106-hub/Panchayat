import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth }         from './context/AuthContext'
import { AppShell }        from './components/layout/AppShell'
import { ProtectedRoute }  from './components/ui/ProtectedRoute'
import { LoadingScreen }   from './components/ui/LoadingScreen'
import { Toast }           from './components/ui/Toast'

// Public screens — eagerly loaded
import Landing    from './screens/Landing/index'
import AuthScreen from './screens/Auth/index'
import Onboarding from './screens/Auth/Onboarding'

// Resident screens
const ResidentHome    = lazy(() => import('./screens/dashboard/resident/Home'))
const VoiceComplaint  = lazy(() => import('./screens/dashboard/resident/VoiceComplaint'))
const Confirmation    = lazy(() => import('./screens/dashboard/resident/Confirmation'))
const MyComplaints    = lazy(() => import('./screens/dashboard/resident/MyComplaints'))
const Dues            = lazy(() => import('./screens/dashboard/resident/Dues'))
const Rulebook        = lazy(() => import('./screens/dashboard/resident/Rulebook'))

// Board screens
const BoardOverview   = lazy(() => import('./screens/dashboard/board/Overview'))
const BoardComplaints = lazy(() => import('./screens/dashboard/board/Complaints'))
const BoardResidents  = lazy(() => import('./screens/dashboard/board/Residents'))
const Maintenance     = lazy(() => import('./screens/dashboard/board/Maintenance'))
const GateLog         = lazy(() => import('./screens/dashboard/board/GateLog'))

function DashboardIndex() {
  const { isBoard } = useAuth()
  return isBoard ? <BoardOverview /> : <ResidentHome />
}

function DashboardComplaints() {
  const { isBoard } = useAuth()
  return isBoard ? <BoardComplaints /> : <MyComplaints />
}

function DashboardLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route index                  element={<DashboardIndex />} />
            <Route path="voice"           element={<VoiceComplaint />} />
            <Route path="confirmation"    element={<Confirmation />} />
            <Route path="complaints"      element={<DashboardComplaints />} />
            <Route path="dues"            element={<Dues />} />
            <Route path="rulebook"        element={<Rulebook />} />
            <Route path="residents"       element={<BoardResidents />} />
            <Route path="maintenance"     element={<Maintenance />} />
            <Route path="gate"            element={<GateLog />} />
            <Route path="*"               element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<AuthScreen />} />
        <Route path="/onboarding"  element={<Onboarding />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
