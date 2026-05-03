import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, listContainer, listItem } from '../../utils/motion'
import { useApp } from '../../context/AppContext'
import { useComplaints } from '../../hooks/useComplaints'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { MicButton } from '../../components/ui/MicButton'
import { ComplaintRow } from '../../components/shared/ComplaintRow'
import { GateItem } from '../../components/shared/GateItem'
import { Button } from '../../components/ui/Button'

const GATE_ITEMS = [
  { type: 'package', description: 'Amazon package arrived', unit: '4B', createdAt: new Date(Date.now() - 40 * 60000).toISOString(), status: 'Arrived' },
  { type: 'guest',   description: 'Guest signed in: Sarah M.', unit: '4B', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), status: 'Signed in' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function ResidentHome() {
  const navigate = useNavigate()
  const { state } = useApp()
  const { complaints, showToast } = useComplaints()

  const myComplaints = complaints.filter(c => c.unit === state.user.unit).slice(0, 3)
  const [showPayModal, setShowPayModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const duesPeriod = 'May 2026'
  const dueDate = 'May 5, 2026'

  function openVoiceFlow() {
    navigate('/voice')
  }

  function handlePay() {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setPaid(true)
      setShowPayModal(false)
      showToast('Payment of $320 confirmed!')
    }, 1500)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg pb-20 md:pb-8"
    >
      <TopBar
        title="Panchayat"
        rightContent={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate('/board')}>Board</Button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
              {state.user.avatar}
            </div>
          </div>
        }
      />

      <div className="max-w-[430px] mx-auto px-4 py-5 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-xs text-ts">{getGreeting()}</p>
          <h1 className="font-display font-bold text-xl text-tp mt-0.5">{state.user.name}</h1>
          <p className="text-xs text-tm mt-0.5">Parkview HOA · Unit {state.user.unit}</p>
        </div>

        {/* Voice CTA card */}
        <motion.div
          variants={listItem}
          initial="initial"
          animate="animate"
          onClick={openVoiceFlow}
          className="bg-surface border border-bdr rounded-2xl p-6 flex flex-col items-center gap-4 cursor-pointer hover:border-voice/40 transition-colors duration-150 active:scale-[0.99]"
        >
          <MicButton
            size="md"
            onClick={(event) => {
              event.stopPropagation()
              openVoiceFlow()
            }}
          />
          <div className="text-center">
            <p className="font-display font-semibold text-tp">Report an issue</p>
            <p className="text-xs text-ts mt-1">Tap and speak — AI handles the rest</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-tp">Recent Activity</p>
            <button onClick={() => navigate('/board')} className="text-xs text-primary hover:text-primary-h transition-colors">
              View all
            </button>
          </div>

          {myComplaints.length > 0 ? (
            <motion.div
              variants={listContainer}
              initial="initial"
              animate="animate"
              className="bg-surface border border-bdr rounded-2xl divide-y divide-bdr"
            >
              {myComplaints.map(c => (
                <ComplaintRow key={c.id} complaint={c} />
              ))}
            </motion.div>
          ) : (
            <div className="bg-surface border border-bdr rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-tm" style={{ fontSize: 32 }}>inbox</span>
              <p className="text-sm text-ts mt-2">No complaints filed yet</p>
              <Button size="sm" className="mt-3" onClick={openVoiceFlow}>
                File first complaint
              </Button>
            </div>
          )}
        </div>

        {/* Maintenance Due */}
        <div className="bg-surface border border-bdr rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warn/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-warn" style={{ fontSize: 18 }}>account_balance_wallet</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-tp">May Maintenance</p>
              <p className="text-xs text-ts">{paid ? 'Paid' : `$320 · Due ${dueDate}`}</p>
            </div>
            {!paid ? (
              <Button size="sm" onClick={() => setShowPayModal(true)}>Pay now</Button>
            ) : (
              <span className="text-xs font-medium text-ok px-2 py-1 rounded-lg bg-ok/10 border border-ok/30">Paid</span>
            )}
          </div>
        </div>

        {/* Gate Activity */}
        <div>
          <p className="text-sm font-semibold text-tp mb-3">Gate Activity</p>
          <div className="bg-surface border border-bdr rounded-2xl px-4 divide-y divide-bdr">
            {GATE_ITEMS.map((item, i) => (
              <GateItem key={i} {...item} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Payment modal */}
      <AnimatePresence>
        {showPayModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm bg-surface border border-bdr rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-tp">Confirm Payment</h2>
                  <button onClick={() => setShowPayModal(false)} className="text-tm hover:text-ts">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                  </button>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 mb-4 divide-y divide-bdr">
                  {[
                    { label: 'Description', value: `${duesPeriod} HOA Maintenance` },
                    { label: 'Unit',        value: state.user.unit },
                    { label: 'Amount',      value: '$320.00' },
                    { label: 'Due date',    value: dueDate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 first:pt-0 last:pb-0">
                      <span className="text-xs text-tm">{label}</span>
                      <span className="text-xs font-medium text-tp">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-tm mb-4 text-center">Payment via saved card ending in 4242</p>
                <div className="flex gap-3">
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-h text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {paying ? (
                      <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>autorenew</span>Processing…</>
                    ) : (
                      <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>Pay $320</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2.5 bg-surface-raised border border-bdr text-ts rounded-xl text-sm hover:text-tp transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
