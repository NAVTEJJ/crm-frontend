import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { initials, avatarColor } from '../../utils/helpers'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/analytics': 'Analytics',
  '/users':     'User Management',
  '/profile':   'My Profile',
}

export default function Header() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = TITLES[pathname] || 'Nexus CRM'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-border sticky top-0 z-20">
      {/* Left: title */}
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button className="hidden md:flex items-center gap-2 h-9 px-3 bg-slate-50 hover:bg-slate-100 border border-border rounded-lg text-sm text-slate-400 transition-colors cursor-pointer min-w-[200px]" aria-label="Search">
          <Search size={15} aria-hidden="true" />
          <span>Quick search…</span>
          <kbd className="ml-auto text-xs bg-white border border-border px-1.5 py-0.5 rounded text-slate-400 font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Notifications">
          <Bell size={18} aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-white shadow-sm"
            style={{ backgroundColor: avatarColor(user?.name || '') }}
            title={user?.name}
            aria-label={`Signed in as ${user?.name}`}
          >
            {initials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  )
}
