import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toast }           from './components/ui/Toast'
import { DemoGuide }       from './components/ui/DemoGuide'
import { ProtectedRoute }  from './components/ui/ProtectedRoute'
import { LoadingScreen }   from './components/ui/LoadingScreen'

// Eagerly load public + auth screens
import Landing     from './screens/Landing/index'
import AuthScreen  from './screens/Auth/index'
import Onboarding  from './screens/Auth/Onboarding'

// Lazy-load all app screens (code splitting)
const ResidentHome   = lazy(() => import('./screens/ResidentHome/index'))
const VoiceRecording = lazy(() => import('./screens/VoiceRecording/index'))
const Confirmation   = lazy(() => import('./screens/Confirmation/index'))
const BoardDashboard = lazy(() => import('./screens/BoardDashboard/index'))
const Rulebook       = lazy(() => import('./screens/Rulebook/index'))
const Residents      = lazy(() => import('./screens/Residents/index'))
const Maintenance    = lazy(() => import('./screens/Maintenance/index'))
const GateLog        = lazy(() => import('./screens/GateLog/index'))

function Protected({ children, role }) {
  return (
    <ProtectedRoute requiredRole={role}>
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/"           element={<Landing />} />
          <Route path="/login"      element={<AuthScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected — any authenticated role */}
          <Route path="/home"         element={<Protected><ResidentHome /></Protected>} />
          <Route path="/voice"        element={<Protected><VoiceRecording /></Protected>} />
          <Route path="/confirmation" element={<Protected><Confirmation /></Protected>} />
          <Route path="/rulebook"     element={<Protected><Rulebook /></Protected>} />

          {/* Protected — board only */}
          <Route path="/board"       element={<Protected role="board"><BoardDashboard /></Protected>} />
          <Route path="/residents"   element={<Protected role="board"><Residents /></Protected>} />
          <Route path="/maintenance" element={<Protected role="board"><Maintenance /></Protected>} />
          <Route path="/gate-log"    element={<Protected role="board"><GateLog /></Protected>} />

          {/* Catch-all */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AnimatePresence>
      <Toast />
      <DemoGuide />
    </>
  )
}
