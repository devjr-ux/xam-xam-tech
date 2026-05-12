import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaCheck, FaSave, FaEye, FaEyeSlash, FaKey,
  FaSpinner, FaExclamationTriangle, FaCreditCard,
} from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import { getSettings, saveSettings } from '../../firebase/settingsService'

const sections = ['Général', 'Paiements', 'Emails', 'Sécurité']

const INP = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-colors'

const DEFAULTS = {
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
  // PayTech
  paytech_enabled: false,
  paytech_mode: 'test',
  paytech_api_key: '',
  paytech_api_secret: '',
  // Wave
  wave_enabled: false,
  wave_api_key: '',
  // Orange Money
  orange_enabled: false,
  orange_api_key: '',
  orange_api_secret: '',
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('Général')
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [showKeys, setShowKeys] = useState({})

  useEffect(() => {
    getSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle    = (key) => setSettings(p => ({ ...p, [key]: !p[key] }))
  const update    = (key, val) => setSettings(p => ({ ...p, [key]: val }))
  const toggleKey = (key) => setShowKeys(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
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

  const ApiKeyField = ({ label, fieldKey, placeholder }) => (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-1.5">
        <FaKey className="text-slate-400 text-xs" /> {label}
      </label>
      <div className="relative">
        <input
          type={showKeys[fieldKey] ? 'text' : 'password'}
          value={settings[fieldKey]}
          onChange={e => update(fieldKey, e.target.value)}
          placeholder={placeholder}
          className={`${INP} pr-10 font-mono text-xs`}
        />
        <button
          type="button"
          onClick={() => toggleKey(fieldKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showKeys[fieldKey] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <FaSpinner className="animate-spin text-cyan-500 text-2xl" />
        <span>Chargement des paramètres...</span>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Paramètres ⚙️</h1>
          <p className="text-slate-500 text-sm mt-1">Configuration générale de la plateforme</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
            saved ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-md shadow-cyan-500/20'
          }`}
        >
          {saving ? <FaSpinner className="animate-spin" /> : saved ? <FaCheck /> : <FaSave />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSection === s ? 'bg-cyan-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300'
            }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* ── GÉNÉRAL ── */}
      {activeSection === 'Général' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Informations du site</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nom du site',       key: 'siteName' },
                { label: 'Email de contact',  key: 'siteEmail' },
                { label: 'Téléphone',         key: 'sitePhone' },
                { label: 'Adresse',           key: 'siteAddress' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
                  <input className={INP} value={settings[key]} onChange={e => update(key, e.target.value)} />
                </div>
              ))}
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

      {/* ── PAIEMENTS ── */}
      {activeSection === 'Paiements' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">

          {/* Config générale */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800">Configuration générale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Devise</label>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className={INP}>
                  <option>FCFA</option><option>EUR</option><option>USD</option><option>GHS</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Commission plateforme (%)</label>
                <input type="number" min="0" max="100" value={settings.commissionRate} onChange={e => update('commissionRate', e.target.value)} className={INP} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Prix minimum ({settings.currency})</label>
                <input type="number" value={settings.minCoursePrice} onChange={e => update('minCoursePrice', e.target.value)} className={INP} />
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

          {/* PayTech */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FaCreditCard className="text-orange-500 text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">PayTech</h3>
                  <p className="text-xs text-slate-400">Orange Money, Wave, Free Money, Carte bancaire</p>
                </div>
              </div>
              <button
                onClick={() => toggle('paytech_enabled')}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.paytech_enabled ? 'bg-cyan-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings.paytech_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.paytech_enabled && (
              <div className="space-y-4 pt-2 border-t border-slate-100">

                {/* Mode test/production */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'test', label: 'Test', desc: 'Aucun vrai paiement', color: 'amber' },
                      { val: 'production', label: 'Production', desc: 'Paiements réels', color: 'green' },
                    ].map(({ val, label, desc, color }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => update('paytech_mode', val)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          settings.paytech_mode === val
                            ? `border-${color}-400 bg-${color}-50`
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-semibold text-slate-800 text-sm">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {settings.paytech_mode === 'production' && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-700 text-xs">
                      Mode production activé. Les clés ci-dessous traitent de vrais paiements. Gardez-les confidentielles.
                    </p>
                  </div>
                )}

                <ApiKeyField
                  label="API Key"
                  fieldKey="paytech_api_key"
                  placeholder="Votre PayTech API Key"
                />
                <ApiKeyField
                  label="API Secret"
                  fieldKey="paytech_api_secret"
                  placeholder="Votre PayTech API Secret"
                />

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-600">Où trouver vos clés ?</p>
                  <p>Connectez-vous à votre compte PayTech → Paramètres → API Keys</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Wave */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-black text-sm">W</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Wave</h3>
                  <p className="text-xs text-slate-400">Paiement direct via Wave</p>
                </div>
              </div>
              <button
                onClick={() => toggle('wave_enabled')}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.wave_enabled ? 'bg-cyan-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings.wave_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.wave_enabled && (
              <div className="pt-2 border-t border-slate-100">
                <ApiKeyField
                  label="Wave API Key"
                  fieldKey="wave_api_key"
                  placeholder="wave_sk_..."
                />
              </div>
            )}
          </motion.div>

          {/* Orange Money */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-orange-600 font-black text-sm">OM</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Orange Money</h3>
                  <p className="text-xs text-slate-400">API Orange Money directe</p>
                </div>
              </div>
              <button
                onClick={() => toggle('orange_enabled')}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.orange_enabled ? 'bg-cyan-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings.orange_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.orange_enabled && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <ApiKeyField
                  label="API Key"
                  fieldKey="orange_api_key"
                  placeholder="Votre Orange Money API Key"
                />
                <ApiKeyField
                  label="API Secret"
                  fieldKey="orange_api_secret"
                  placeholder="Votre Orange Money API Secret"
                />
              </div>
            )}
          </motion.div>

        </motion.div>
      )}

      {/* ── EMAILS ── */}
      {activeSection === 'Emails' && (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Notifications par email</h3>
          <Toggle label="Email de bienvenue" desc="Envoyé à chaque nouveau compte" settingKey="welcomeEmail" />
          <Toggle label="Email d'inscription à un cours" desc="Confirmation après enrollment" settingKey="enrollmentEmail" />
          <Toggle label="Email de complétion" desc="Félicitations et certificat disponible" settingKey="completionEmail" />
          <Toggle label="Notifications forum" desc="Alertes pour les nouvelles réponses" settingKey="forumNotifications" />
        </motion.div>
      )}

      {/* ── SÉCURITÉ ── */}
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
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm transition-all"
              onClick={() => alert('Action bloquée en démonstration')}
            >
              Réinitialiser la base de données
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
