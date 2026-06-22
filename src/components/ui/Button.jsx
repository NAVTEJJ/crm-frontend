import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import Spinner from './Spinner'

const VARIANTS = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-glow',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-border shadow-sm',
  ghost: 'hover:bg-slate-100 text-slate-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  outline: 'border border-primary text-primary hover:bg-primary-light',
}
const SIZES = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-6 text-sm rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 14 : 16} className="text-current" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} aria-hidden="true" />
      ) : null}
      {children}
    </motion.button>
  )
}
