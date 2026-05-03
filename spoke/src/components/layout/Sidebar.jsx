import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useComplaints } from '../../hooks/useComplaints'

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: 'dashboard',      path: '/board'       },
  { label: 'Complaints',  icon: 'report_problem', path: '/board'       },
  { label: 'Residents',   icon: 'people',          path: '/residents'  },
  { label: 'Rulebook',    icon: 'menu_book',       path: '/rulebook'   },
  { label: 'Maintenance', icon: 'build',           path: '/maintenance' },
  { label: 'Gate Log',    icon: 'door_front',      path: '/gate-log'   },
]

export function Sidebar() {
  const { state } = useApp()
  const { showToast } = useComplaints()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-surface border-r border-bdr flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-bdr">
        <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 24 }}>
          spatial_audio
        </span>
        <div>
          <span className="font-display font-bold text-tp text-base">Panchayat</span>
          <p className="text-xs text-tm leading-tight">Parkview HOA · Board</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label + item.path}
            to={item.path}
            end={item.path === '/board'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-ts hover:text-tp hover:bg-surface-raised',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User strip */}
      <div className="px-4 py-4 border-t border-bdr">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
            {state.user.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-tp truncate">{state.user.name}</p>
            <p className="text-xs text-tm">Board Member</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
