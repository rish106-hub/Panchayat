import { useState } from 'react'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Nav config per role ────────────────────────────────────────────────────

const RESIDENT_NAV = [
  { to: '/dashboard',            icon: 'home',          label: 'Home',        end: true },
  { to: '/dashboard/voice',      icon: 'keyboard_voice', label: 'File Complaint' },
  { to: '/dashboard/complaints', icon: 'inbox',          label: 'My Complaints' },
  { to: '/dashboard/dues',       icon: 'account_balance_wallet', label: 'Dues & Payments' },
  { to: '/dashboard/rulebook',   icon: 'menu_book',      label: 'Rulebook'     },
]

const BOARD_NAV = [
  { to: '/dashboard',              icon: 'dashboard',     label: 'Overview',    end: true },
  { to: '/dashboard/complaints',   icon: 'inbox',         label: 'Complaints'   },
  { to: '/dashboard/residents',    icon: 'group',         label: 'Residents'    },
  { to: '/dashboard/maintenance',  icon: 'build',         label: 'Maintenance' },
  { to: '/dashboard/gate',         icon: 'door_front',    label: 'Gate Log'     },
]

// ── Logo ───────────────────────────────────────────────────────────────────

function Logo({ collapsed }) {
  const navigate = useNavigate()
  const { isBoard } = useAuth()
  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="flex items-center gap-2.5 px-4 h-14 border-b border-border w-full hover:bg-surface-2 transition-colors shrink-0"
    >
      <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
        <span className="material-symbols-rounded text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
      </div>
      {!collapsed && (
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-tight">Spoke</p>
          <p className="text-2xs text-text-muted leading-tight capitalize">{isBoard ? 'Board Portal' : 'Resident Portal'}</p>
        </div>
      )}
    </button>
  )
}

// ── Nav item ───────────────────────────────────────────────────────────────

function NavItem({ to, icon, label, collapsed, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => [
        'flex items-center gap-3 px-3 h-9 rounded-lg mx-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-brand-50 text-brand-600 border border-brand-100'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        collapsed ? 'justify-center px-2' : '',
      ].join(' ')}
      title={collapsed ? label : undefined}
    >
      <span className="material-symbols-rounded shrink-0" style={{ fontSize: 18 }}>{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────

function Sidebar({ nav, collapsed }) {
  const navigate = useNavigate()
  const { user, signOut, IS_DEMO, switchDemoRole, isBoard } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside className={[
      'hidden md:flex flex-col bg-surface border-r border-border h-full shrink-0 transition-all duration-200',
      collapsed ? 'w-14' : 'w-56',
    ].join(' ')}>
      <Logo collapsed={collapsed} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 no-scrollbar">
        {nav.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Demo switcher */}
      {IS_DEMO && !collapsed && (
        <div className="mx-2 mb-2 p-2.5 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-2xs font-semibold text-brand-600 uppercase tracking-wide mb-1.5">Demo Mode</p>
          <div className="flex gap-1">
            {['resident','board'].map(role => (
              <button
                key={role}
                onClick={() => { switchDemoRole(role); navigate('/dashboard') }}
                className={[
                  'flex-1 py-1 rounded-md text-2xs font-medium transition-colors capitalize',
                  (isBoard ? 'board' : 'resident') === role
                    ? 'bg-brand-600 text-white'
                    : 'text-brand-700 hover:bg-brand-100',
                ].join(' ')}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User + sign out */}
      <div className="border-t border-border p-3 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-brand-700">
                {user.avatar ?? user.name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              {user.unit_number && (
                <p className="text-2xs text-text-muted">Unit {user.unit_number}</p>
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={[
            'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-danger hover:bg-danger/8 transition-colors',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>logout</span>
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}

// ── Mobile top bar ─────────────────────────────────────────────────────────

function MobileHeader({ title, nav }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, signOut, IS_DEMO, switchDemoRole, isBoard } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setOpen(false)
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-border shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </button>
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-2 text-text-secondary"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>menu</span>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-surface h-full flex flex-col shadow-modal animate-slide-up">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>spatial_audio</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">Spoke</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2">
                <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 px-1">
              {nav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => [
                    'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                  ].join(' ')}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {IS_DEMO && (
              <div className="mx-3 mb-3 p-3 bg-brand-50 border border-brand-100 rounded-xl">
                <p className="text-2xs font-semibold text-brand-600 uppercase tracking-wide mb-1.5">Demo Mode</p>
                <div className="flex gap-1">
                  {['resident','board'].map(role => (
                    <button
                      key={role}
                      onClick={() => { switchDemoRole(role); navigate('/dashboard'); setOpen(false) }}
                      className={[
                        'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                        (isBoard ? 'board' : 'resident') === role
                          ? 'bg-brand-600 text-white'
                          : 'text-brand-700 hover:bg-brand-100',
                      ].join(' ')}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border p-3">
              {user && (
                <div className="flex items-center gap-2.5 mb-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-brand-700">
                      {user.avatar ?? user.name?.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                    {user.unit_number && <p className="text-xs text-text-muted">Unit {user.unit_number}</p>}
                  </div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/8 transition-colors"
              >
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>logout</span>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Mobile bottom nav ──────────────────────────────────────────────────────

function BottomNav({ nav }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 flex">
      {nav.slice(0, 5).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => [
            'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-2xs font-medium transition-colors',
            isActive ? 'text-brand-600' : 'text-text-muted hover:text-text-secondary',
          ].join(' ')}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>{item.icon}</span>
          <span>{item.label.split(' ')[0]}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// ── AppShell ───────────────────────────────────────────────────────────────

export function AppShell({ children }) {
  const { isBoard } = useAuth()
  const location    = useLocation()
  const [sidebarCollapsed] = useState(false)

  const nav = isBoard ? BOARD_NAV : RESIDENT_NAV

  // Derive page title from current route
  const current = nav.find(n => n.end
    ? location.pathname === n.to
    : location.pathname.startsWith(n.to)
  )
  const title = current?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar nav={nav} collapsed={sidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader title={title} nav={nav} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <BottomNav nav={nav} />
    </div>
  )
}
