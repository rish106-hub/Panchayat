import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toast } from './components/ui/Toast'
import Landing        from './screens/Landing/index'
import ResidentHome   from './screens/ResidentHome/index'
import VoiceRecording from './screens/VoiceRecording/index'
import Confirmation   from './screens/Confirmation/index'
import BoardDashboard from './screens/BoardDashboard/index'
import Rulebook       from './screens/Rulebook/index'
import Residents      from './screens/Residents/index'
import Maintenance    from './screens/Maintenance/index'
import GateLog        from './screens/GateLog/index'

export default function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"             element={<Landing />} />
          <Route path="/home"         element={<ResidentHome />} />
          <Route path="/voice"        element={<VoiceRecording />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/board"        element={<BoardDashboard />} />
          <Route path="/rulebook"     element={<Rulebook />} />
          <Route path="/residents"    element={<Residents />} />
          <Route path="/maintenance"  element={<Maintenance />} />
          <Route path="/gate-log"     element={<GateLog />} />
          <Route path="*"             element={<Landing />} />
        </Routes>
      </AnimatePresence>
      <Toast />
    </>
  )
}
