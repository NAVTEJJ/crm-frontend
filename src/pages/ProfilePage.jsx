import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, LogOut, Edit2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../api/users'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { RoleBadge } from '../components/ui/Badge'
import { fmt, initials, avatarColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(user?.name || '')
  const [saving, setSaving]   = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    if (name.trim() === user?.name) { setEditing(false); return }
    setSaving(true)
    try {
      await usersApi.update(user.id, { name: name.trim() })
      toast.success('Profile updated — refresh to see changes')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const color = avatarColor(user?.name || '')
  const ini   = initials(user?.name)

  const INFO = [
    { icon: Mail,     label: 'Email',     value: user?.email },
    { icon: Shield,   label: 'Role',      value: <RoleBadge role={user?.role} /> },
    { icon: Calendar, label: 'Member since', value: fmt.date(user?.created_at) },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex items-center gap-5"
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-label={`Avatar for ${user?.name}`}
        >
          {ini}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setName(user?.name || '') } }}
                className="flex-1 h-9 px-3 border border-border rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 input-glow"
                autoFocus
                aria-label="Edit name"
              />
              <Button size="sm" icon={Check} onClick={handleSave} loading={saving}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setName(user?.name || '') }}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 truncate">{user?.name}</h2>
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors cursor-pointer"
                aria-label="Edit name"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{user?.role} · Nexus CRM</p>
        </div>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card divide-y divide-border"
      >
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Account information</h3>
        </div>
        {INFO.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-slate-500" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <div className="text-sm font-medium text-slate-900">{value || '—'}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="card border-red-100"
      >
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-900">Session</h3>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Sign out</p>
            <p className="text-xs text-slate-500 mt-0.5">You will be redirected to the login page.</p>
          </div>
          <Button variant="danger" icon={LogOut} onClick={handleLogout} size="sm">Sign out</Button>
        </div>
      </motion.div>
    </div>
  )
}
