import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCamera, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import { useAuth } from '../../context/AuthContext'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import api from '../../services/api'

const COUNTRIES = ['Sénégal','Côte d\'Ivoire','Ghana','Mali','Burkina Faso','Guinée','Cameroun','Togo','Bénin','Niger','Maroc','Algérie','Autre']
const INP = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm'

export default function ProfilePage() {
  const { user, login, token } = useAuth()

  const [form, setForm] = useState({
    name:            user?.name    || '',
    email:           user?.email   || '',
    phone:           user?.phone   || '',
    country:         user?.country || '',
    bio:             user?.bio     || '',
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState('')
  const [errors, setErrors]     = useState({})

  // Sync form si user change
  useRefreshOnNav(() => {
    if (user) {
      setForm(p => ({
        ...p,
        name:    user.name    || '',
        email:   user.email   || '',
        phone:   user.phone   || '',
        country: user.country || '',
        bio:     user.bio     || '',
      }))
    }
  })

  const set = (k, v) => { setForm(p => ({...p, [k]: v})); setErrors(p => ({...p, [k]: ''})); setSuccess('') }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name = 'Nom obligatoire'
    if (form.newPassword) {
      if (form.newPassword.length < 8) e.newPassword = 'Minimum 8 caractères'
      if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas'
      if (!form.currentPassword) e.currentPassword = 'Entrez votre mot de passe actuel'
    }
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    setSuccess('')
    try {
      const payload = {
        name:    form.name.trim(),
        phone:   form.phone,
        country: form.country,
        bio:     form.bio,
      }
      if (form.newPassword) {
        payload.current_password = form.currentPassword
        payload.new_password     = form.newPassword
        payload.new_password_confirmation = form.confirmPassword
      }

      const r = await api.put('/profile', payload)
      // Mettre à jour le contexte auth avec les nouvelles données
      login(r.data, token)
      setSuccess('Profil mis à jour avec succès !')
      setForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (ex) {
      const apiErrors = ex.response?.data?.errors
      if (apiErrors) {
        const mapped = {}
        Object.entries(apiErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped)
      } else {
        setErrors({ general: ex.response?.data?.message || 'Erreur serveur.' })
      }
    } finally { setSaving(false) }
  }

  const roleBadge = { admin: '👑 Admin', instructor: '👨‍🏫 Formateur', student: '🎓 Apprenant' }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-2xl">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Mon profil</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos informations personnelles</p>
      </motion.div>

      {/* Avatar */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-600 transition-colors">
            <FaCamera className="text-xs" />
          </button>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-lg">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
            {roleBadge[user?.role] || user?.role}
          </span>
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">Informations personnelles</h3>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <FaExclamationTriangle /> {errors.general}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <FaCheck /> {success}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet *</label>
            <input className={`${INP} ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input className={`${INP} bg-slate-50 cursor-not-allowed`} value={form.email} readOnly />
            <p className="text-xs text-slate-400 mt-1">L'email ne peut pas être modifié</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
            <input className={INP} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+221 77 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pays</label>
            <select className={INP} value={form.country} onChange={e => set('country', e.target.value)}>
              <option value="">Sélectionner...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
          <textarea className={`${INP} resize-none`} rows={3} value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Décrivez-vous en quelques mots..." maxLength={500} />
          <p className="text-xs text-slate-400 mt-1">{form.bio.length}/500</p>
        </div>
      </motion.div>

      {/* Mot de passe */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800">Changer le mot de passe</h3>
        <p className="text-slate-400 text-sm">Laissez vide si vous ne souhaitez pas changer de mot de passe</p>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe actuel</label>
          <input type="password" className={`${INP} ${errors.currentPassword ? 'border-red-400' : ''}`}
            value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} />
          {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
            <input type="password" className={`${INP} ${errors.newPassword ? 'border-red-400' : ''}`}
              value={form.newPassword} onChange={e => set('newPassword', e.target.value)}
              placeholder="Minimum 8 caractères" />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer</label>
            <input type="password" className={`${INP} ${errors.confirmPassword ? 'border-red-400' : ''}`}
              value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20">
          {saving ? <><FaSpinner className="animate-spin" /> Sauvegarde...</> : <><FaCheck /> Sauvegarder les modifications</>}
        </button>
      </motion.div>
    </motion.div>
  )
}
