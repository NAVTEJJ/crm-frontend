import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const ROLE_PERMISSIONS = {
  admin:    { campaigns: true, analytics: true, users: true, createCampaign: true, editCampaign: true, deleteCampaign: true },
  manager:  { campaigns: true, analytics: true, users: false, createCampaign: true, editCampaign: true, deleteCampaign: true },
  employee: { campaigns: true, analytics: false, users: false, createCampaign: false, editCampaign: false, deleteCampaign: false },
  client:   { campaigns: false, analytics: false, users: false, createCampaign: false, editCampaign: false, deleteCampaign: false },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('crm_token')
    if (!token) { setLoading(false); return }
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      localStorage.removeItem('crm_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { bootstrap() }, [bootstrap])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('crm_token', data.access_token)
    const me = await authApi.me()
    setUser(me)
    toast.success(`Welcome back, ${me.name.split(' ')[0]}!`)
    return me
  }

  const register = async (formData) => {
    const res = await authApi.register(formData)
    toast.success('Account created! Please log in.')
    return res
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    setUser(null)
    toast.success('Signed out.')
  }

  const can = (permission) => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role]?.[permission] ?? false
  }

  const isAdmin = () => user?.role === 'admin'
  const isManager = () => ['admin', 'manager'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, can, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
