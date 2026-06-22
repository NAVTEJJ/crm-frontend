import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit2, Trash2, Users, Shield } from 'lucide-react'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { RoleBadge } from '../components/ui/Badge'
import { fmt, initials, avatarColor, ROLE_META } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user: me, isAdmin } = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [editModal, setEditModal]   = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm]       = useState({ name: '', email: '', role: 'employee' })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const fetchUsers = useCallback(() =>
    usersApi.list({ limit: 200 })
      .then((r) => setUsers(Array.isArray(r) ? r : (r?.data ?? r?.items ?? [])))
      .catch(() => toast.error('Failed to load users')),
  [])

  useEffect(() => { fetchUsers().finally(() => setLoading(false)) }, [fetchUsers])

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Shield size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Admin access required</p>
        <p className="text-xs mt-1">Only administrators can view this page.</p>
      </div>
    )
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openEdit = (u) => {
    setEditModal(u)
    setForm({ name: u.name || '', email: u.email || '', role: u.role || 'employee' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSubmitting(true)
    try {
      await usersApi.update(editModal.id, { name: form.name.trim(), role: form.role })
      toast.success('User updated')
      setEditModal(null)
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await usersApi.delete(deleteModal.id)
      toast.success('User removed')
      setDeleteModal(null)
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = users.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full h-9 pl-9 pr-3 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700 placeholder:text-slate-400"
          aria-label="Search users"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Users table">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                {['User', 'Email', 'Role', 'Joined', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="skeleton w-8 h-8 rounded-full" /><div className="skeleton h-4 w-28 rounded" /></div></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-40 rounded" /></td>
                    <td className="px-5 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
                    <td className="px-5 py-3"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-5 py-3" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400 text-sm">
                  {search ? 'No users match your search' : 'No users found'}
                </td></tr>
              ) : (
                filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColor(u.name || '') }}
                          aria-hidden="true"
                        >
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 flex items-center gap-1.5">
                            {u.name || '—'}
                            {u.id === me?.id && (
                              <span className="text-xs text-primary font-normal">(you)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{fmt.dateShort(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors cursor-pointer"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        {u.id !== me?.id && (
                          <button
                            onClick={() => setDeleteModal(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit user"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleUpdate} loading={submitting}>Save</Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4" noValidate>
          <Input label="Full name" value={form.name} onChange={set('name')} placeholder="Jane Smith" />
          <Input label="Email" value={form.email} disabled />
          <Select label="Role" value={form.role} onChange={set('role')}>
            {Object.keys(ROLE_META).map((r) => (
              <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </Select>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remove user"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove <strong className="text-slate-900">{deleteModal?.name}</strong> ({deleteModal?.email}) from the platform? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
