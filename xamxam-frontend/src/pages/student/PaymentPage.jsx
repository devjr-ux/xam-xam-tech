import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSpinner, FaCheckCircle, FaLock, FaMobile, FaArrowLeft } from 'react-icons/fa'
import { studentService } from '../../services/studentService'
import { fadeInUp, staggerContainer } from '../../animations/variants'

const METHODS = [
  {
    id:    'wave',
    name:  'Wave',
    color: 'from-blue-500 to-blue-600',
    logo:  '🌊',
    hint:  'Ex : 77 123 45 67',
  },
  {
    id:    'orange_money',
    name:  'Orange Money',
    color: 'from-orange-500 to-orange-600',
    logo:  '🍊',
    hint:  'Ex : 77 456 78 90',
  },
  {
    id:    'free_money',
    name:  'Free Money',
    color: 'from-red-500 to-red-600',
    logo:  '📱',
    hint:  'Ex : 76 789 01 23',
  },
]

export default function PaymentPage() {
  const { courseId }                    = useParams()
  const [searchParams]                  = useSearchParams()
  const enrollmentId                    = searchParams.get('enrollment')
  const navigate                        = useNavigate()

  const [paymentInfo, setPaymentInfo]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [method, setMethod]             = useState('wave')
  const [phone, setPhone]               = useState('')
  const [processing, setProcessing]     = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState('')
  const [step, setStep]                 = useState(1) // 1=méthode 2=confirmation 3=succès

  useEffect(() => {
    if (!enrollmentId) { navigate(`/courses/${courseId}`); return }
    studentService.checkAccess(courseId)
      .then(async access => {
        if (access.hasAccess) { navigate(`/courses/${courseId}/learn`); return }
        const info = await studentService.initiatePayment(enrollmentId)
        setPaymentInfo(info)
        setLoading(false)
      })
      .catch(() => { navigate(`/courses/${courseId}`); setLoading(false) })
  }, [enrollmentId, courseId, navigate])

  const handleConfirm = async () => {
    if (!phone.trim()) { setError('Entrez votre numéro de téléphone.'); return }
    if (phone.replace(/\s/g, '').length < 8) { setError('Numéro invalide.'); return }

    setError('')
    setProcessing(true)

    try {
      await studentService.confirmPayment(enrollmentId, {
        phone:     phone.trim(),
        method,
        reference: paymentInfo?.reference,
      })
      setSuccess(true)
      setStep(3)
      // Rediriger vers le cours après 3 secondes
      setTimeout(() => navigate(`/courses/${courseId}/learn`), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de paiement. Réessayez.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-cyan-500 text-4xl" />
      </div>
    )
  }

  if (!paymentInfo) return null

  const selectedMethod = METHODS.find(m => m.id === method)

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-6">
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 mx-auto transition-colors"
          >
            <FaArrowLeft /> Retour au cours
          </button>
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-1">Paiement sécurisé</h1>
          <p className="text-slate-400 text-sm">Débloquez l'accès à votre formation</p>
        </motion.div>

        {/* Récapitulatif commande */}
        <motion.div variants={fadeInUp} className="bg-slate-800 rounded-2xl p-5 mb-5 border border-white/10">
          <h3 className="text-white font-semibold mb-3">📋 Récapitulatif</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Formation</span>
              <span className="font-medium text-white truncate ml-4 max-w-[200px]">{paymentInfo.course?.title}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Formateur</span>
              <span>{paymentInfo.course?.instructor || '—'}</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-cyan-400 font-bold text-lg">
                {Number(paymentInfo.amount).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </motion.div>

        {/* ÉTAPE 1 : Choisir la méthode */}
        {step === 1 && (
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-white font-semibold">Choisissez votre méthode</h3>
            <div className="space-y-3">
              {METHODS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    method === m.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-slate-800 hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {m.logo}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold">{m.name}</p>
                    <p className="text-slate-400 text-xs">Paiement mobile rapide et sécurisé</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    method === m.id ? 'border-cyan-500 bg-cyan-500' : 'border-slate-500'
                  }`}>
                    {method === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-base transition-colors"
            >
              Continuer →
            </button>
          </motion.div>
        )}

        {/* ÉTAPE 2 : Saisir le numéro */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
              <FaArrowLeft /> Changer de méthode
            </button>

            {/* Méthode sélectionnée */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${selectedMethod?.color} bg-opacity-20`}>
              <span className="text-3xl">{selectedMethod?.logo}</span>
              <div>
                <p className="text-white font-bold">{selectedMethod?.name}</p>
                <p className="text-white/70 text-xs">Paiement de {Number(paymentInfo.amount).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                <FaMobile className="inline mr-2" />
                Numéro {selectedMethod?.name}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                placeholder={selectedMethod?.hint}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base"
              />
              {error && <p className="text-red-400 text-xs mt-1.5">⚠️ {error}</p>}
            </div>

            {/* Instructions */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
              <p className="font-semibold mb-1">📱 Instructions {selectedMethod?.name} :</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Entrez votre numéro {selectedMethod?.name} ci-dessus</li>
                <li>Cliquez sur "Payer maintenant"</li>
                <li>Vous recevrez une demande de paiement sur votre téléphone</li>
                <li>Confirmez le paiement sur votre application</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-base transition-colors disabled:opacity-60"
            >
              {processing
                ? <><FaSpinner className="animate-spin" /> Traitement en cours...</>
                : <><FaLock /> Payer {Number(paymentInfo.amount).toLocaleString('fr-FR')} FCFA</>
              }
            </button>

            <p className="text-slate-500 text-xs text-center flex items-center justify-center gap-1">
              <FaLock className="text-green-500" /> Paiement 100% sécurisé — Vos données sont protégées
            </p>
          </motion.div>
        )}

        {/* ÉTAPE 3 : Succès */}
        {step === 3 && success && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">Paiement réussi ! 🎉</h2>
            <p className="text-slate-400">
              Votre accès au cours <strong className="text-white">"{paymentInfo.course?.title}"</strong> est maintenant actif.
            </p>
            <div className="bg-slate-800 rounded-xl p-4 text-left text-sm space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Méthode</span>
                <span>{selectedMethod?.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Numéro</span>
                <span>{phone}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Montant</span>
                <span className="text-green-400 font-bold">{Number(paymentInfo.amount).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm">Redirection vers le cours dans 3 secondes...</p>
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseId}/learn`)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-colors"
            >
              Accéder au cours maintenant →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
