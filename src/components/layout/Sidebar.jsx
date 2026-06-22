import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Megaphone, Users, BarChart3,
  User, LogOut, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { initials, avatarColor } from '../../utils/helpers'

const ALL_NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, perm: null },
  { to: '/campaigns', label: 'Campaigns',  icon: Megaphone,       perm: 'campaigns' },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3,       perm: 'analytics' },
  { to: '/users',     label: 'Users',      icon: Users,           perm: 'users' },
  { to: '/profile',   label: 'Profile',    icon: User,            perm: null },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()

  const navItems = ALL_NAV.filter((n) => !n.perm || can(n.perm))

  const w = collapsed ? 64 : 256

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 h-screen bg-sidebar flex flex-col z-30 overflow-hidden"
      style={{ minWidth: w }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" aria-hidden="true" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-white text-base tracking-tight whitespace-nowrap"
              >
                Nexus <span className="text-primary">CRM</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors cursor-pointer flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-150 relative overflow-hidden',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r"
                  />
                )}
                <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: avatarColor(user?.name || '') }}
            aria-hidden="true"
          >
            {initials(user?.name)}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                <p className="text-sidebar-text text-xs truncate capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-sidebar-text hover:text-red-400 hover:bg-sidebar-hover transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
