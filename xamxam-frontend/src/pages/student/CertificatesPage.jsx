import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaDownload, FaAward, FaSpinner } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import api from '../../services/api'

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-yellow-400 to-orange-500',
]

export default function CertificatesPage() {
  const { user }                    = useAuth()
  const [certs, setCerts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [printing, setPrinting]     = useState(null)

  useRefreshOnNav(() => {
    setLoading(true)
    api.get('/certificates')
      .then(r => setCerts(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  })

  const handlePrint = (cert) => {
    setPrinting(cert.id)
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Certificat — ${cert.course?.title}</title>
      <style>
        body { font-family: Georgia, serif; text-align:center; padding:60px; background:#f8f9fa; }
        .cert { background:white; border:4px solid #0891b2; padding:60px; max-width:700px; margin:0 auto; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.1); }
        h1 { color:#0891b2; font-size:32px; margin-bottom:8px; }
        h2 { font-size:28px; color:#1e293b; margin:24px 0; }
        .name { font-size:36px; color:#0891b2; font-style:italic; margin:16px 0; }
        .score { font-size:48px; font-weight:bold; color:#10b981; }
        .id { font-size:12px; color:#94a3b8; margin-top:32px; }
        hr { border:1px solid #e2e8f0; margin:24px 0; }
      </style>
      </head><body>
      <div class="cert">
        <h1>🎓 XamXam Tech</h1>
        <hr/>
        <p style="font-size:18px;color:#64748b">Certifie que</p>
        <div class="name">${user?.name || 'Apprenant'}</div>
        <p style="font-size:18px;color:#64748b">a complété avec succès</p>
        <h2>${cert.course?.title || 'Formation'}</h2>
        <div class="score">${cert.score ?? 100}%</div>
        <p style="color:#64748b">Score obtenu</p>
        <hr/>
        <p style="color:#475569">Délivré le ${new Date(cert.issued_at || cert.created_at).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'})}</p>
        <div class="id">N° ${cert.certificate_id}</div>
      </div>
      </body></html>
    `)
    win.document.close()
    win.print()
    setPrinting(null)
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Mes certificats 🏆</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? '...' : `${certs.length} certificat(s) obtenu(s)`}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
              <Skeleton className="h-32 w-full rounded-xl mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun certificat pour l'instant</h3>
          <p className="text-slate-400 text-sm">Terminez un cours pour obtenir votre premier certificat.</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((cert, i) => (
            <motion.div key={cert.id} custom={i} variants={cardVariants}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
              <div className={`h-28 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center relative`}>
                <FaAward className="text-white/30 text-8xl absolute" />
                <div className="relative z-10 text-center">
                  <MdVerified className="text-white text-3xl mx-auto mb-1" />
                  <p className="text-white text-xs font-semibold opacity-90">CERTIFIÉ</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 mb-1 truncate">
                  {cert.course?.title || '—'}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span>Score : <strong className="text-green-600">{cert.score ?? 100}%</strong></span>
                  <span>·</span>
                  <span>{cert.certificate_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {new Date(cert.issued_at || cert.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePrint(cert)}
                    disabled={printing === cert.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {printing === cert.id ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                    Télécharger
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
