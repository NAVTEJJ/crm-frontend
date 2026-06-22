import { clsx } from 'clsx'
import { CAMPAIGN_STATUS, ROLE_META } from '../../utils/helpers'

export function StatusBadge({ status }) {
  const meta = CAMPAIGN_STATUS[status] || { label: status, color: 'bg-slate-100 text-slate-600', dot: '#94A3B8' }
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', meta.color)}>
      <span
        className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', status === 'active' && 'status-pulse')}
        style={{ backgroundColor: meta.dot }}
      />
      {meta.label}
    </span>
  )
}

export function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: 'bg-slate-100 text-slate-600' }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', meta.color)}>
      {meta.label}
    </span>
  )
}

export function ActiveBadge({ active }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', active ? 'bg-green-500' : 'bg-slate-400')} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
