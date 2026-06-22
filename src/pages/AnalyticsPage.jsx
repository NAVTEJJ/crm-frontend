import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, MousePointerClick, DollarSign, Plus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsApi } from '../api/analytics'
import { campaignsApi } from '../api/campaigns'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input, { Select } from '../components/ui/Input'
import { fmt } from '../utils/helpers'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border shadow-card rounded-xl px-3 py-2 text-xs">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  )
}

const EMPTY_FORM = { campaign_id: '', impressions: '', clicks: '', conversions: '', revenue: '', date: '' }

export default function AnalyticsPage() {
  const { can } = useAuth()
  const [records, setRecords] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchAnalytics = (campaignId = selectedCampaign) => {
    const params = campaignId ? { campaign_id: campaignId } : {}
    return analyticsApi.list(params)
      .then((r) => setRecords(Array.isArray(r) ? r : (r?.data ?? r?.items ?? [])))
  }

  useEffect(() => {
    Promise.all([
      fetchAnalytics(),
      campaignsApi.list({ limit: 100 }).then((r) => setCampaigns(Array.isArray(r) ? r : (r?.data ?? r?.items ?? []))),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) fetchAnalytics(selectedCampaign)
  }, [selectedCampaign])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.campaign_id) { toast.error('Select a campaign'); return }
    setSubmitting(true)
    try {
      await analyticsApi.create({
        campaign_id: parseInt(form.campaign_id),
        impressions:  parseInt(form.impressions  || 0),
        clicks:       parseInt(form.clicks       || 0),
        conversions:  parseInt(form.conversions  || 0),
        revenue:      parseFloat(form.revenue    || 0),
        date:         form.date || new Date().toISOString().split('T')[0],
      })
      toast.success('Analytics record created')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      fetchAnalytics()
    } catch {
      toast.error('Failed to create record')
    } finally {
      setSubmitting(false)
    }
  }

  const totals = records.reduce(
    (acc, r) => ({
      impressions:  acc.impressions  + (r.impressions  || 0),
      clicks:       acc.clicks       + (r.clicks       || 0),
      conversions:  acc.conversions  + (r.conversions  || 0),
      revenue:      acc.revenue      + (r.revenue      || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  )

  const chartData = [...records]
    .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at))
    .slice(-30)
    .map((r) => ({
      date:        fmt.dateShort(r.date || r.created_at),
      impressions: r.impressions  || 0,
      clicks:      r.clicks       || 0,
      conversions: r.conversions  || 0,
    }))

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track campaign performance over time</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="h-9 px-3 pr-8 border border-border rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none"
            aria-label="Filter by campaign"
          >
            <option value="">All campaigns</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {can('analytics') && (
            <Button icon={Plus} size="sm" onClick={() => setModalOpen(true)}>
              Add record
            </Button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Impressions"  value={totals.impressions}  icon={BarChart3}          color="blue"   loading={loading} delay={0} />
        <StatCard title="Clicks"       value={totals.clicks}       icon={MousePointerClick}  color="green"  loading={loading} delay={0.07} />
        <StatCard title="Conversions"  value={totals.conversions}  icon={TrendingUp}         color="purple" loading={loading} delay={0.14} />
        <StatCard title="Revenue"      value={totals.revenue}      icon={DollarSign}         color="amber"  loading={loading} delay={0.21} prefix="$" />
      </div>

      {/* Line chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Performance over time (last 30 records)</h3>
        {loading ? (
          <div className="skeleton h-56 rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No analytics data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="impressions" stroke="#2563EB" strokeWidth={2} dot={false} name="Impressions" />
              <Line type="monotone" dataKey="clicks"      stroke="#059669" strokeWidth={2} dot={false} name="Clicks" />
              <Line type="monotone" dataKey="conversions" stroke="#7C3AED" strokeWidth={2} dot={false} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Records table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        className="card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-900">Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Analytics records">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                {['Date', 'Campaign', 'Impressions', 'Clicks', 'Conversions', 'Revenue'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No records found</td></tr>
              ) : (
                records.map((r) => {
                  const camp = campaigns.find((c) => c.id === r.campaign_id)
                  return (
                    <tr key={r.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmt.dateShort(r.date || r.created_at)}</td>
                      <td className="px-5 py-3 font-medium text-slate-900 max-w-[160px] truncate">{camp?.name || `#${r.campaign_id}`}</td>
                      <td className="px-5 py-3 text-slate-600 tabular-nums">{(r.impressions || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-600 tabular-nums">{(r.clicks      || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-600 tabular-nums">{(r.conversions || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-900 font-medium tabular-nums">${(r.revenue || 0).toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add analytics record"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={submitting}>Save record</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <Select label="Campaign" value={form.campaign_id} onChange={set('campaign_id')}>
            <option value="">Select a campaign…</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Date" type="date" value={form.date} onChange={set('date')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Impressions"  type="number" min="0" value={form.impressions}  onChange={set('impressions')} />
            <Input label="Clicks"       type="number" min="0" value={form.clicks}       onChange={set('clicks')} />
            <Input label="Conversions"  type="number" min="0" value={form.conversions}  onChange={set('conversions')} />
            <Input label="Revenue ($)"  type="number" min="0" step="0.01" value={form.revenue} onChange={set('revenue')} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
