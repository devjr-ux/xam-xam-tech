import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCheck, FaSave } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const sections = ['Général', 'Paiements', 'Emails', 'Sécurité']

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('Général')
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'XamXam Tech',
    siteEmail: 'contact@xamxamtech.com',
    sitePhone: '+221 77 000 00 00',
    siteAddress: 'Dakar, Sénégal',
    maintenanceMode: false,
    registrationOpen: true,
    requireEmailVerification: true,
    maxCoursesPerInstructor: 20,
    commissionRate: 30,
    currency: 'FCFA',
    minCoursePrice: 5000,
    welcomeEmail: true,
    enrollmentEmail: true,
    completionEmail: true,
    forumNotifications: true,
    twoFactorAuth: false,
    maxLoginAttempts: 5,
    sessionTimeout: 120,
  })

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }))
  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ label, desc, settingKey }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => toggle(settingKey)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings[settingKey] ? 'bg-cyan-500' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings[settingKey] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Paramètres ⚙️</h1>
          <p className="text-slate-500 text-sm mt-1">Configuration générale de la plateforme</p>
        </div>
        <Button icon={saved ? <FaCheck /> : <FaSave />} onClick={handleSave} variant={saved ? 'outline' : 'primary'}>
          {saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === s ? 'bg-cyan-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'}`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {activeSection === 'Général' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Informations du site</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nom du site" value={settings.siteName} onChange={e => update('siteName', e.target.value)} />
              <Input label="Email de contact" value={settings.siteEmail} onChange={e => update('siteEmail', e.target.value)} />
              <Input label="Téléphone" value={settings.sitePhone} onChange={e => update('sitePhone', e.target.value)} />
              <Input label="Adresse" value={settings.siteAddress} onChange={e => update('siteAddress', e.target.value)} />
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Options d&apos;accès</h3>
            <Toggle label="Mode maintenance" desc="Ferme l'accès public à la plateforme" settingKey="maintenanceMode" />
            <Toggle label="Inscriptions ouvertes" desc="Permet aux nouveaux utilisateurs de s'inscrire" settingKey="registrationOpen" />
            <Toggle label="Vérification email requise" desc="Les nouveaux comptes doivent vérifier leur email" settingKey="requireEmailVerification" />
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Limites des formateurs</h3>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Cours maximum par formateur</label>
              <input type="number" value={settings.maxCoursesPerInstructor} onChange={e => update('maxCoursesPerInstructor', e.target.value)} className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeSection === 'Paiements' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Configuration des paiements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Devise</label>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
                  <option>FCFA</option><option>EUR</option><option>USD</option><option>GHS</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Commission plateforme (%)</label>
                <input type="number" min="0" max="100" value={settings.commissionRate} onChange={e => update('commissionRate', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Prix minimum ({settings.currency})</label>
                <input type="number" value={settings.minCoursePrice} onChange={e => update('minCoursePrice', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <p className="text-cyan-700 text-sm font-semibold">💰 Répartition des revenus</p>
              <div className="flex justify-between text-sm text-cyan-600 mt-2">
                <span>Formateur : {100 - settings.commissionRate}%</span>
                <span>XamXam Tech : {settings.commissionRate}%</span>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Méthodes de paiement</h3>
            {['Orange Money', 'Wave', 'Free Money', 'Carte bancaire', 'PayPal'].map((method, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{method}</span>
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {activeSection === 'Emails' && (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Notifications par email</h3>
          <Toggle label="Email de bienvenue" desc="Envoyé à chaque nouveau compte" settingKey="welcomeEmail" />
          <Toggle label="Email d'inscription à un cours" desc="Confirmation après enrollment" settingKey="enrollmentEmail" />
          <Toggle label="Email de complétion" desc="Félicitations et certificat disponible" settingKey="completionEmail" />
          <Toggle label="Notifications forum" desc="Alertes pour les nouvelles réponses" settingKey="forumNotifications" />
        </motion.div>
      )}

      {activeSection === 'Sécurité' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Authentification</h3>
            <Toggle label="Double authentification (2FA)" desc="Obligatoire pour les admins et formateurs" settingKey="twoFactorAuth" />
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-1">Tentatives de connexion max.</label>
                <input type="number" min="3" max="10" value={settings.maxLoginAttempts} onChange={e => update('maxLoginAttempts', e.target.value)} className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-1">Timeout session (minutes)</label>
                <input type="number" min="30" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', e.target.value)} className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-bold text-red-700 mb-3">⚠️ Zone dangereuse</h3>
            <div className="space-y-2">
              <Button variant="danger" size="sm" onClick={() => alert('Action bloquée en démonstration')}>
                Réinitialiser la base de données
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
