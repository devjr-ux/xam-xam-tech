import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import Logo from '../../components/ui/Logo'
import { MdVerified } from 'react-icons/md'
import { getCertificateByNumber } from '../../firebase/certificateService'
import { staggerContainer, fadeInUp } from '../../animations/variants'

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function VerifyCertificatePage() {
  const { id: paramId } = useParams()
  const navigate        = useNavigate()

  const [input, setInput]   = useState(paramId || '')
  const [cert, setCert]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (paramId) verify(paramId)
  }, [paramId])

  const verify = async (id) => {
    const val = (id || input).trim().toUpperCase()
    if (!val) { setError('Veuillez saisir un numéro de certificat.'); return }
    setLoading(true)
    setError('')
    setCert(null)
    setSearched(false)
    try {
      const result = await getCertificateByNumber(val)
      setCert(result)
      setSearched(true)
      if (result && id !== paramId) navigate(`/verify/${val}`, { replace: true })
    } catch {
      setError('Erreur lors de la vérification. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); verify() }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1c3e] via-[#0e2d5c] to-[#0b1c3e] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Logo to="/" size="md" />
        <span className="text-white/50 text-sm">Vérification de certificat</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible"
          className="w-full max-w-2xl space-y-6">

          {/* Titre */}
          <motion.div variants={fadeInUp} className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MdVerified className="text-cyan-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérifier un certificat</h1>
            <p className="text-white/50 text-sm">
              Saisissez l'identifiant unique ou scannez le QR Code du certificat pour confirmer son authenticité.
            </p>
          </motion.div>

          {/* Formulaire */}
          <motion.div variants={fadeInUp}>
            <form onSubmit={handleSubmit}
              className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                placeholder="Ex : XXT-2026-AB12CD"
                className="flex-1 bg-transparent text-white placeholder-white/30 px-3 py-2.5 focus:outline-none font-mono text-sm"
              />
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm transition-all disabled:opacity-50">
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                {loading ? 'Recherche...' : 'Vérifier'}
              </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-2 ml-4">{error}</p>}
          </motion.div>

          {/* Résultat */}
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl overflow-hidden border ${
                cert ? 'border-green-500/30' : 'border-red-500/30'
              }`}
            >
              {cert ? (
                <div>
                  {/* Bandeau succès */}
                  <div className="bg-green-500/20 border-b border-green-500/20 px-6 py-4 flex items-center gap-3">
                    <FaCheckCircle className="text-green-400 text-2xl flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-bold">Certificat valide et authentique</p>
                      <p className="text-green-400/70 text-xs">
                        Émis par XamXam Tech · Vérifié en temps réel
                      </p>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="bg-white/5 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Apprenant', value: cert.studentName || '—', icon: '👤' },
                      { label: 'Formation', value: cert.courseName  || '—', icon: '📚' },
                      { label: 'Niveau',    value: cert.courseLevel || '—', icon: '🏅' },
                      { label: 'Score',     value: `${cert.score ?? 100}%`,  icon: '📊' },
                      { label: 'Date d\'émission', value: formatDate(cert.issuedAt), icon: '📅' },
                      { label: 'Formateur', value: cert.instructorName || '—', icon: '👨‍🏫' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wide">{label}</p>
                          <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ID */}
                  <div className="bg-white/5 border-t border-white/10 px-6 py-3 flex items-center justify-between">
                    <span className="text-white/40 text-xs">N° Certificat</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">{cert.certificateId}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 p-8 text-center">
                  <FaTimesCircle className="text-red-400 text-4xl mx-auto mb-3" />
                  <p className="text-red-300 font-bold text-lg mb-1">Certificat introuvable</p>
                  <p className="text-red-400/70 text-sm">
                    Aucun certificat ne correspond à l'identifiant <strong className="text-red-300">{input}</strong>.
                    Vérifiez l'orthographe ou contactez l'établissement.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Info bas */}
          <motion.div variants={fadeInUp}
            className="text-center text-white/30 text-xs">
            Ce système de vérification est fourni par XamXam Tech.
            Tous les certificats sont stockés de manière sécurisée.
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
