import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Logo from '../../components/ui/Logo'
import { fadeInUp, staggerContainer } from '../../animations/variants'

const roles = [
  { value: 'student', label: 'Apprenant', emoji: '🎓', desc: 'Je veux apprendre' },
  { value: 'instructor', label: 'Formateur', emoji: '👨‍🏫', desc: 'Je veux enseigner' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'student' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name || form.name.length < 2) errs.name = 'Nom requis (min 2 caractères)'
    if (!form.email) errs.email = 'Email requis'
    if (!form.password || form.password.length < 6) errs.password = 'Mot de passe min. 6 caractères'
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Les mots de passe ne correspondent pas'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      navigate(form.role === 'instructor' ? '/instructor' : '/student')
    } catch (err) {
      setErrors({ general: err.message || 'Erreur lors de l\'inscription' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <Logo to="/" size="lg" />
        </motion.div>

        <motion.div variants={fadeInUp} className="glassmorphism rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Créer un compte 🚀</h2>
          <p className="text-slate-400 text-sm mb-6">Rejoignez 15,000+ apprenants africains</p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map(({ value, label, emoji, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: value }))}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  form.role === value
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-xs opacity-70">{desc}</span>
              </button>
            ))}
          </div>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Nom complet</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Mamadou Diallo" className={inputClass} />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" className={inputClass} />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Mot de passe</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} placeholder="••••••••" className={inputClass} />
              </div>
              {errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{errors.password_confirmation}</p>}
            </div>

            <Button type="submit" loading={loading} size="md" className="mt-2 w-full justify-center">
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
