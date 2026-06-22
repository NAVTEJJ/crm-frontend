import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Megaphone } from 'lucide-react'
import { campaignsApi } from '../api/campaigns'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input, { Select, Textarea } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { StatusBadge } from '../components/ui/Badge'
import { fmt, CAMPAIGN_STATUS } from '../utils/helpers'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const EMPTY = { name: '', description: '', status: 'draft', budget: '', start_date: '', end_date: '' }

function CampaignCard({ campaign, canEdit, canDelete, onEdit, onDelete }) {
  const status = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
      className="card p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{campaign.name}</p>
          {campaign.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{campaign.description}</p>
          )}
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        {campaign.budget != null && (
          <span><span className="font-medium text-slate-700">Budget</span> {fmt.currency(campaign.budget)}</span>
        )}
        {campaign.start_date && (
          <span><span className="font-medium text-slate-700">Start</span> {fmt.dateShort(campaign.start_date)}</span>
        )}
        {campaign.end_date && (
          <span><span className="font-medium text-slate-700">End</span> {fmt.dateShort(campaign.end_date)}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-slate-400">{fmt.relative(campaign.created_at)}</span>
        <div className="flex gap-1">
          {canEdit && (
            <button
              onClick={() => onEdit(campaign)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors cursor-pointer"
              aria-label={`Edit ${campaign.name}`}
            >
              <Edit2 size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(campaign)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              aria-label={`Delete ${campaign.name}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function CampaignsPage() {
  const { can } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchCampaigns = useCallback(() => {
    return campaignsApi.list({ limit: 100 })
      .then((r) => setCampaigns(Array.isArray(r) ? r : (r?.data ?? r?.items ?? [])))
      .catch(() => toast.error('Failed to load campaigns'))
  }, [])

  useEffect(() => { fetchCampaigns().finally(() => setLoading(false)) }, [fetchCampaigns])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      name:        c.name        || '',
      description: c.description || '',
      status:      c.status      || 'draft',
      budget:      c.budget      != null ? String(c.budget) : '',
      start_date:  c.start_date  ? c.start_date.split('T')[0] : '',
      end_date:    c.end_date    ? c.end_date.split('T')[0]   : '',
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(EMPTY) }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Campaign name is required'); return }
    setSubmitting(true)
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      status:      form.status,
      budget:      form.budget ? parseFloat(form.budget) : undefined,
      start_date:  form.start_date || undefined,
      end_date:    form.end_date   || undefined,
    }
    try {
      if (editing) {
        await campaignsApi.update(editing.id, payload)
        toast.success('Campaign updated')
      } else {
        await campaignsApi.create(payload)
        toast.success('Campaign created')
      }
      closeModal()
      fetchCampaigns()
    } catch {
      toast.error(editing ? 'Failed to update' : 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await campaignsApi.delete(deleteModal.id)
      toast.success('Campaign deleted')
      setDeleteModal(null)
      fetchCampaigns()
    } catch {
      toast.error('Failed to delete campaign')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = campaigns.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const canCreate = can('createCampaign')
  const canEdit   = can('editCampaign')
  const canDelete = can('deleteCampaign')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campaigns</h2>
          <p className="text-sm text-slate-500 mt-0.5">{campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && (
          <Button icon={Plus} onClick={openCreate}>New campaign</Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full h-9 pl-9 pr-3 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700 placeholder:text-slate-400"
            aria-label="Search campaigns"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 pr-7 border border-border rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {Object.keys(CAMPAIGN_STATUS).map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-slate-400"
        >
          <Megaphone size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {search || statusFilter ? 'No campaigns match your filters' : 'No campaigns yet'}
          </p>
          {canCreate && !search && !statusFilter && (
            <Button className="mt-4" size="sm" icon={Plus} onClick={openCreate}>Create your first campaign</Button>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={openEdit}
                onDelete={setDeleteModal}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit campaign' : 'New campaign'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editing ? 'Save changes' : 'Create campaign'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Campaign name" placeholder="e.g. Q3 Email Blast" value={form.name} onChange={set('name')} />
          <Textarea label="Description (optional)" placeholder="What is this campaign about?" value={form.description} onChange={set('description')} rows={3} />
          <Select label="Status" value={form.status} onChange={set('status')}>
            {Object.keys(CAMPAIGN_STATUS).map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
          <Input label="Budget ($)" type="number" min="0" step="0.01" placeholder="5000" value={form.budget} onChange={set('budget')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.start_date} onChange={set('start_date')} />
            <Input label="End date"   type="date" value={form.end_date}   onChange={set('end_date')} />
          </div>
        </form>
      </Modal>

      {/* Delete confirm Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete campaign"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong className="text-slate-900">{deleteModal?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
