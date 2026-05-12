import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Logo from '../../components/ui/Logo'
import { fadeInUp, staggerContainer } from '../../animations/variants'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email requis'
    if (!form.password) errs.password = 'Mot de passe requis'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const profile = await login(form.email, form.password)
      const redirects = { admin: '/admin', instructor: '/instructor', student: '/student' }
      navigate(redirects[profile?.role] || '/student')
    } catch (err) {
      setErrors({ general: err.message || 'Email ou mot de passe incorrect' })
    } finally {
      setLoading(false)
    }
  }

  // Demo quick login
  const demoLogin = (role) => {
    const demos = {
      admin: { email: 'admin@xamxam.com', password: 'password' },
      instructor: { email: 'formateur@xamxam.com', password: 'password' },
      student: { email: 'apprenant@xamxam.com', password: 'password' },
    }
    setForm(demos[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <Logo to="/" size="lg" />
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeInUp} className="glassmorphism rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Bon retour ! 👋</h2>
          <p className="text-slate-400 text-sm mb-6">Connectez-vous à votre compte</p>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-300">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} size="md" className="mt-2 w-full justify-center">
              Se connecter
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-slate-400 text-xs text-center mb-3">Comptes de démonstration :</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Admin', emoji: '👑' },
                { role: 'instructor', label: 'Formateur', emoji: '👨‍🏫' },
                { role: 'student', label: 'Apprenant', emoji: '🎓' },
              ].map(({ role, label, emoji }) => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-5">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
