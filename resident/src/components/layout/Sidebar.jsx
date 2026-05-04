'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',            icon: 'home',             label: 'Home'        },
  { href: '/dashboard/complaints', icon: 'report_problem',   label: 'My Complaints' },
  { href: '/dashboard/dues',       icon: 'account_balance_wallet', label: 'Dues'   },
  { href: '/dashboard/rulebook',   icon: 'menu_book',        label: 'Rulebook'    },
]

function NavLink({ href, icon, label, exact = false, onClick }) {
  const pathname = usePathname()
  const active   = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href} onClick={onClick}
      className={['flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', active ? 'bg-brand-600 text-white' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'].join(' ')}>
      <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </Link>
  )
}

export function Sidebar({ user }) {
  const supabase = createClient()
  const router   = useRouter()
  const boardUrl = process.env.NEXT_PUBLIC_BOARD_APP_URL

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface h-screen overflow-y-auto">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>apartment</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-tight">Spoke</p>
            <p className="text-[10px] text-text-muted truncate max-w-[120px]">{user?.societies?.name ?? 'Resident'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(n => <NavLink key={n.href} {...n} exact={n.href === '/dashboard'} />)}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
        {boardUrl && (
          <a href={boardUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-all">
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>admin_panel_settings</span>
            Board Portal
            <span className="material-symbols-rounded ml-auto opacity-50" style={{ fontSize: 14 }}>open_in_new</span>
          </a>
        )}
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-brand-600">{user?.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-[10px] text-text-muted">Unit {user?.unit_number ?? '—'}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-danger transition-all">
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>logout</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileHeader({ user }) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router   = useRouter()
  const boardUrl = process.env.NEXT_PUBLIC_BOARD_APP_URL

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>apartment</span>
          </div>
          <span className="text-sm font-bold text-text-primary">Spoke</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-surface-2 text-text-secondary">
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>menu</span>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border flex flex-col overflow-y-auto">
            <div className="px-5 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>apartment</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Spoke</p>
                  <p className="text-[10px] text-text-muted">{user?.societies?.name}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted">
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {NAV.map(n => <NavLink key={n.href} {...n} exact={n.href === '/dashboard'} onClick={() => setOpen(false)} />)}
            </nav>

            <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
              {boardUrl && (
                <a href={boardUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-2">
                  <span className="material-symbols-rounded" style={{ fontSize: 20 }}>admin_panel_settings</span>
                  Board Portal
                  <span className="material-symbols-rounded ml-auto opacity-50" style={{ fontSize: 14 }}>open_in_new</span>
                </a>
              )}
              <div className="px-3 py-2 text-xs text-text-muted">Unit {user?.unit_number ?? '—'} · {user?.name}</div>
              <button onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-danger">
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>logout</span>
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
