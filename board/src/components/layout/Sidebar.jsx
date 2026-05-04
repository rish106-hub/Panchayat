'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',            icon: 'dashboard',              label: 'Overview',    exact: true },
  { href: '/dashboard/complaints', icon: 'inbox',                  label: 'Complaints'               },
  { href: '/dashboard/residents',  icon: 'group',                  label: 'Residents'                },
  { href: '/dashboard/maintenance',icon: 'build',                  label: 'Maintenance'              },
  { href: '/dashboard/gate',       icon: 'door_front',             label: 'Gate Log'                 },
  { href: '/dashboard/rulebook',   icon: 'menu_book',              label: 'Rulebook'                 },
]

const RESIDENT_APP_URL = process.env.NEXT_PUBLIC_RESIDENT_APP_URL ?? 'http://localhost:3002'

export function Sidebar({ user }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href, exact) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border h-full shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="material-symbols-rounded text-white" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">Spoke Admin</p>
          <p className="text-[10px] text-text-muted leading-tight">Board Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 no-scrollbar">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-3 px-3 h-9 rounded-lg mx-2 text-sm font-medium transition-all duration-150',
              isActive(item.href, item.exact)
                ? 'bg-brand-50 text-brand-600 border border-brand-100'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
            ].join(' ')}
          >
            <span className="material-symbols-rounded shrink-0" style={{ fontSize: 18 }}>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Resident portal link */}
      <div className="mx-2 mb-2">
        <a
          href={RESIDENT_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 h-9 rounded-lg text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 hover:bg-brand-100 transition-colors"
        >
          <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>open_in_new</span>
          Resident Portal
        </a>
      </div>

      {/* User + sign out */}
      <div className="border-t border-border p-3 shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-brand-700">
                {user.name?.slice(0, 2).toUpperCase() ?? 'BA'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name ?? 'Board Admin'}</p>
              <p className="text-[10px] text-text-muted">Board member</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-danger hover:bg-danger/8 transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>logout</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function MobileHeader({ user }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const current = NAV.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 15 }}>spatial_audio</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">{current?.label ?? 'Dashboard'}</span>
        </div>
        <button onClick={() => setOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-2">
          <span className="material-symbols-rounded text-text-secondary" style={{ fontSize: 22 }}>menu</span>
        </button>
      </header>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-surface h-full flex flex-col shadow-modal animate-slide-up">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="text-sm font-semibold text-text-primary">Spoke Admin</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2">
                <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 px-2">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-2">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border p-3">
              <button onClick={signOut} className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/8">
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
