import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Zap, TrendingUp, Users, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const STATS = [
  { icon: TrendingUp, label: 'Campaigns active', value: '2.4k+' },
  { icon: Users,      label: 'Leads managed',    value: '180k+' },
  { icon: Target,     label: 'Conversion rate',  value: '34%'   },
]

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch {
      setErrors({ form: 'Invalid email or password.' })
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] brand-panel relative flex-col justify-between p-12 overflow-hidden">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Nexus <span className="text-primary-light">CRM</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-white leading-snug mb-4"
          >
            Drive growth with intelligent CRM
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-slate-400 text-base leading-relaxed"
          >
            Manage campaigns, track leads, and make data-driven decisions — all in one place.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex gap-8"
          >
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={14} className="text-primary-light" />
                  <span className="text-white font-bold text-xl">{value}</span>
                </div>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-slate-600 text-xs">
          Powered by Nexus Intelligence Platform &copy; 2024
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Nexus CRM</span>
          </div>

          <motion.div variants={stagger.item}>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500 mb-8">Sign in to your workspace</p>
          </motion.div>

          <motion.form
            variants={stagger.item}
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            noValidate
          >
            {errors.form && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errors.form}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                icon={Mail}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                icon={Lock}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" loading={loading} icon={LogIn} className="w-full" size="lg">
              Sign in
            </Button>
          </motion.form>

          <motion.p variants={stagger.item} className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:text-primary-dark transition-colors">
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
