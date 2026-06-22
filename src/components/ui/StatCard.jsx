import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

function useCountUp(target, duration = 900, enabled = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!enabled || typeof target !== 'number') { setCount(target); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, enabled])
  return count
}

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'blue', prefix = '', suffix = '', loading = false, delay = 0 }) {
  const count = useCountUp(typeof value === 'number' ? value : 0, 900)
  const displayed = typeof value === 'number' ? count : value

  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-100' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'ring-green-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  ring: 'ring-amber-100' },
  }
  const c = colorMap[color] || colorMap.blue

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-4 w-24 rounded mb-4" />
        <div className="skeleton h-8 w-16 rounded mb-2" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
      className="card p-5 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center ring-4', c.bg, c.ring)}>
          <Icon size={20} className={c.icon} aria-hidden="true" />
        </div>
      </div>

      <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none mb-2">
        {prefix}{typeof value === 'number' ? displayed.toLocaleString() : displayed}{suffix}
      </p>

      {(trend != null || trendLabel) && (
        <div className="flex items-center gap-1.5">
          {trend != null && (
            trend >= 0
              ? <TrendingUp size={14} className="text-green-500" />
              : <TrendingDown size={14} className="text-red-500" />
          )}
          {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}
