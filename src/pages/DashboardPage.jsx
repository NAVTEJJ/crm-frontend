import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Megaphone, Users, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { campaignsApi } from '../api/campaigns'
import StatCard from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/Badge'
import { fmt, CAMPAIGN_STATUS } from '../utils/helpers'

const PIE_COLORS = {
  active:    '#059669',
  draft:     '#94A3B8',
  paused:    '#F59E0B',
  completed: '#2563EB',
  cancelled: '#EF4444',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-xl shadow-card px-3 py-2 text-sm">
      <span className="font-medium text-slate-900 capitalize">{payload[0].name}</span>
      <span className="text-slate-500 ml-2">{payload[0].value} campaigns</span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    campaignsApi.list({ limit: 50 })
      .then((r) => setCampaigns(Array.isArray(r) ? r : (r?.data ?? r?.items ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total    = campaigns.length
  const active   = campaigns.filter((c) => c.status === 'active').length
  const draft    = campaigns.filter((c) => c.status === 'draft').length
  const recent   = [...campaigns].slice(0, 6)

  const pieData = Object.keys(CAMPAIGN_STATUS)
    .map((s) => ({ name: s, value: campaigns.filter((c) => c.status === s).length }))
    .filter((d) => d.value > 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Here&apos;s what&apos;s happening with your campaigns today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Campaigns" value={total}  icon={Megaphone}   color="blue"   delay={0}    loading={loading} trendLabel="All time" />
        <StatCard title="Active Now"      value={active} icon={TrendingUp}  color="green"  delay={0.07} loading={loading} trendLabel={active > 0 ? 'Running' : 'None running'} trend={active > 0 ? 1 : null} />
        <StatCard title="Drafts"          value={draft}  icon={BarChart3}   color="amber"  delay={0.14} loading={loading} trendLabel="Pending launch" />
        <StatCard title="Team members"    value="—"      icon={Users}       color="purple" delay={0.21} loading={false}   trendLabel="Managed in Users tab" />
      </div>

      {/* Chart + Recent table */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="card p-5 xl:col-span-2"
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Campaign status</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="skeleton w-36 h-36 rounded-full" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <Megaphone size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No campaigns yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-600 capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="card p-5 xl:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent campaigns</h3>
            <Link to="/campaigns" className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-slate-400">
              <Megaphone size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No campaigns yet</p>
              <Link to="/campaigns" className="mt-2 text-xs text-primary font-medium">Create one</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{fmt.dateShort(c.created_at)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
