import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const fmt = {
  date: (d) => d ? format(parseISO(d), 'MMM d, yyyy') : '—',
  dateShort: (d) => d ? format(parseISO(d), 'MMM d') : '—',
  datetime: (d) => d ? format(parseISO(d), 'MMM d, yyyy HH:mm') : '—',
  relative: (d) => d ? formatDistanceToNow(parseISO(d), { addSuffix: true }) : '—',
  currency: (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—',
  number: (n) => n != null ? Number(n).toLocaleString() : '—',
}

export const CAMPAIGN_STATUS = {
  draft:     { label: 'Draft',     color: 'bg-slate-100 text-slate-600',  dot: '#64748B' },
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700',  dot: '#059669' },
  paused:    { label: 'Paused',    color: 'bg-amber-100 text-amber-700',  dot: '#D97706' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700',    dot: '#2563EB' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',      dot: '#DC2626' },
}

export const ROLE_META = {
  admin:    { label: 'Admin',    color: 'bg-purple-100 text-purple-700' },
  manager:  { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
  employee: { label: 'Employee', color: 'bg-teal-100 text-teal-700' },
  client:   { label: 'Client',  color: 'bg-orange-100 text-orange-700' },
}

export function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function avatarColor(name = '') {
  const colors = ['#2563EB','#059669','#7C3AED','#D97706','#0D9488','#DC2626','#DB2777']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

export function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }

export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }
