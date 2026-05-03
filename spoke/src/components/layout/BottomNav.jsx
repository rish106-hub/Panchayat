import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home',   icon: 'home',      path: '/home' },
  { label: 'Report', icon: 'mic',       path: '/voice' },
  { label: 'Rules',  icon: 'menu_book', path: '/rulebook' },
  { label: 'Board',  icon: 'dashboard', path: '/board' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden h-16 bg-surface/90 backdrop-blur border-t border-bdr">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          replace={location.pathname === '/voice' && item.path !== '/voice'}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150',
              isActive ? 'text-primary' : 'text-tm hover:text-ts',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={['material-symbols-outlined', isActive ? 'icon-filled' : ''].join(' ')}
                style={{ fontSize: 22 }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
