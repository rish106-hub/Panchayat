import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, listContainer, listItem } from '../../utils/motion'
import { useComplaints } from '../../hooks/useComplaints'
import { useApp } from '../../context/AppContext'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { StatCard } from '../../components/shared/StatCard'
import { GateItem } from '../../components/shared/GateItem'
import { ComplaintsFeed } from './ComplaintsFeed'
import { RESIDENTS } from '../../data/residentsData'
import { GATE_LOG } from '../../data/gateLogData'
import { formatTimestamp } from '../../utils/timeAgo'

const OVERDUE_RESIDENTS = RESIDENTS.filter(r => r.dues === 'overdue')
const CURRENT_DUES_PERIOD = 'May 2026'

function exportCSV(complaints) {
  const header = ['ID', 'Category', 'Priority', 'Status', 'Unit', 'Resident', 'Filed', 'Transcript']
  const rows = complaints.map(c => [
    c.id, c.category, c.priority, c.status, c.unit, c.resident,
    formatTimestamp(c.createdAt),
    `"${c.transcript.replace(/"/g, '""')}"`
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `spoke-complaints-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const NOTICE_EMPTY = { title: '', body: '', recipients: 'all' }

export default function BoardDashboard() {
  const navigate = useNavigate()
  const { complaints, showToast } = useComplaints()
  const { dispatch } = useApp()

  const [showNotice, setShowNotice] = useState(false)
  const [notice, setNotice]         = useState(NOTICE_EMPTY)
  const [sending, setSending]       = useState(false)

  const total      = complaints.length
  const pending    = complaints.filter(c => c.status === 'Pending').length
  const inProgress = complaints.filter(c => c.status === 'In Progress').length
  const resolved   = complaints.filter(c => c.status === 'Resolved').length

  function handleExport() {
    exportCSV(complaints)
    showToast('Report exported as CSV')
  }

  function handleSendNotice(e) {
    e.preventDefault()
    if (!notice.title.trim() || !notice.body.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setShowNotice(false)
      setNotice(NOTICE_EMPTY)
      const count = notice.recipients === 'all' ? RESIDENTS.length : 1
      dispatch({ type: 'SHOW_TOAST', payload: `Notice sent to ${count} resident${count !== 1 ? 's' : ''}` })
    }, 1200)
  }

  const recentGate = GATE_LOG.slice(0, 3)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:hidden"><TopBar title="Board Dashboard" backTo="/home" /></div>

      <main className="md:ml-60 pb-20 md:pb-8">
        <div className="px-4 md:px-8 py-5 md:py-8">
          <div className="hidden md:block mb-8">
            <h1 className="font-display font-bold text-2xl text-tp">Board Dashboard</h1>
            <p className="text-sm text-ts mt-1">Parkview HOA — Live overview</p>
          </div>

          {/* Stats */}
          <motion.div variants={listContainer} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <motion.div variants={listItem}><StatCard label="Total"       value={total}      icon="report_problem" color="#6366F1" /></motion.div>
            <motion.div variants={listItem}><StatCard label="Pending"     value={pending}    icon="pending"        color="#F59E0B" /></motion.div>
            <motion.div variants={listItem}><StatCard label="In Progress" value={inProgress} icon="autorenew"      color="#6366F1" /></motion.div>
            <motion.div variants={listItem}><StatCard label="Resolved"    value={resolved}   icon="check_circle"   color="#10B981" /></motion.div>
          </motion.div>

          {/* Two-column */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <ComplaintsFeed />
            </div>

            <div className="space-y-5">
              {/* Gate Activity */}
              <div className="bg-surface border border-bdr rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
                  <h3 className="font-display font-semibold text-tp text-sm">Gate Activity</h3>
                  <button onClick={() => navigate('/gate-log')} className="text-xs text-primary hover:text-primary-h transition-colors">
                    View all
                  </button>
                </div>
                <div className="px-4 divide-y divide-bdr">
                  {recentGate.map(item => (
                    <GateItem key={item.id} {...item} />
                  ))}
                </div>
              </div>

              {/* Overdue Payments */}
              <div className="bg-surface border border-bdr rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
                  <h3 className="font-display font-semibold text-tp text-sm">Overdue Payments</h3>
                  <button onClick={() => navigate('/maintenance')} className="text-xs text-primary hover:text-primary-h transition-colors">
                    Manage
                  </button>
                </div>
                <div className="divide-y divide-bdr">
                  {OVERDUE_RESIDENTS.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm text-tp font-medium">Unit {r.unit} · {r.name}</p>
                        <p className="text-xs text-tm">{CURRENT_DUES_PERIOD}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-err font-semibold">$320</span>
                        <button
                          onClick={() => showToast(`Reminder sent to Unit ${r.unit}`)}
                          className="text-xs px-2 py-0.5 rounded-lg bg-surface-raised border border-bdr text-ts hover:text-tp transition-colors"
                        >
                          Remind
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-surface border border-bdr rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-bdr">
                  <h3 className="font-display font-semibold text-tp text-sm">Quick Actions</h3>
                </div>
                <div className="p-3 space-y-1">
                  <button
                    onClick={() => setShowNotice(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ts hover:text-tp hover:bg-surface-raised transition-colors text-left"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>campaign</span>
                    Send notice
                  </button>
                  <button
                    onClick={() => navigate('/rulebook')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ts hover:text-tp hover:bg-surface-raised transition-colors text-left"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu_book</span>
                    View rulebook
                  </button>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ts hover:text-tp hover:bg-surface-raised transition-colors text-left"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                    Export complaints CSV
                  </button>
                  <button
                    onClick={() => navigate('/residents')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ts hover:text-tp hover:bg-surface-raised transition-colors text-left"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>people</span>
                    View residents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden"><BottomNav /></div>

      {/* Send Notice Modal */}
      <AnimatePresence>
        {showNotice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotice(false)}
              className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0,   scale: 0.94, y: 16  }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <form
                onSubmit={handleSendNotice}
                className="pointer-events-auto w-full max-w-md bg-surface border border-bdr rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>campaign</span>
                    </div>
                    <h2 className="font-display font-bold text-tp">Send Notice</h2>
                  </div>
                  <button type="button" onClick={() => setShowNotice(false)} className="text-tm hover:text-ts transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-tm font-medium mb-1.5 block">Recipients</label>
                    <select
                      value={notice.recipients}
                      onChange={e => setNotice(n => ({ ...n, recipients: e.target.value }))}
                      className="w-full bg-bg border border-bdr rounded-xl px-3 py-2.5 text-sm text-tp focus:outline-none focus:border-primary"
                    >
                      <option value="all">All residents ({RESIDENTS.length})</option>
                      {RESIDENTS.map(r => (
                        <option key={r.id} value={r.unit}>Unit {r.unit} — {r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-tm font-medium mb-1.5 block">Subject</label>
                    <input
                      value={notice.title}
                      onChange={e => setNotice(n => ({ ...n, title: e.target.value }))}
                      placeholder="e.g. Water maintenance scheduled for Monday"
                      required
                      className="w-full bg-bg border border-bdr rounded-xl px-3 py-2.5 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-tm font-medium mb-1.5 block">Message</label>
                    <textarea
                      value={notice.body}
                      onChange={e => setNotice(n => ({ ...n, body: e.target.value }))}
                      placeholder="Write your notice to residents…"
                      required
                      rows={4}
                      className="w-full bg-bg border border-bdr rounded-xl px-3 py-2.5 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-h text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>autorenew</span>
                        Sending…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                        Send Notice
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotice(false)}
                    className="px-4 py-2.5 bg-surface-raised border border-bdr text-ts rounded-xl text-sm hover:text-tp transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
