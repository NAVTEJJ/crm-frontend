import { clsx } from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, containerClass, required, ...props },
  ref
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={clsx('relative input-glow rounded-lg transition-shadow', error && 'ring-1 ring-red-400')}>
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full h-10 border border-border rounded-lg bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'transition-colors focus:outline-none focus:border-primary',
            Icon ? 'pl-9 pr-3' : 'px-3',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
    </div>
  )
})

export default Input

export function Select({ label, error, children, className, containerClass, required, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={clsx(
          'h-10 w-full border border-border rounded-lg bg-white px-3 text-sm text-slate-900',
          'transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, containerClass, required, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full border border-border rounded-lg bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none',
          'transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
