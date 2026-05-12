import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaDownload, FaSpinner, FaShareAlt, FaCheckCircle } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useRefreshOnNav } from '../../hooks/useRefreshOnNav'
import { studentService } from '../../services/studentService'

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildCertificateHTML(cert, verifyBaseUrl) {
  const studentName   = cert.studentName   || 'Apprenant'
  const courseName    = cert.courseName    || 'Formation'
  const courseLevel   = cert.courseLevel   || 'Intermédiaire'
  const instructorName = cert.instructorName || 'XamXam Tech'
  const score         = cert.score         ?? 100
  const totalLessons  = cert.totalLessons  || 0
  const totalHours    = cert.totalHours    || 1
  const issueDate     = formatDate(cert.issuedAt)
  const certId        = cert.certificateId || '—'
  const verifyUrl     = `${verifyBaseUrl}/verify/${certId}`
  const qrUrl         = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=0d1b3e&bgcolor=ffffff&data=${encodeURIComponent(verifyUrl)}`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Certificat — ${courseName}</title>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Montserrat',sans-serif;background:#dde1e9;
  display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.cert{width:1050px;min-height:720px;display:flex;background:white;
  box-shadow:0 30px 90px rgba(0,0,0,.25);overflow:hidden;position:relative}

/* ── Panneau gauche ── */
.left{width:230px;background:linear-gradient(170deg,#0b1c3e 0%,#0e2d5c 55%,#0b1c3e 100%);
  flex-shrink:0;display:flex;flex-direction:column;align-items:flex-start;
  justify-content:center;padding:36px 22px;position:relative;overflow:hidden}

/* Décoration coin haut gauche */
.left-deco-tl{position:absolute;top:0;left:0;width:70px;height:70px;
  background:linear-gradient(135deg,#00b4d8,#0077b6);
  clip-path:polygon(0 0,100% 0,0 100%)}
/* Décoration coin bas gauche */
.left-deco-bl{position:absolute;bottom:0;left:0;width:70px;height:70px;
  background:linear-gradient(225deg,#00b4d8,#0077b6);
  clip-path:polygon(0 0,0 100%,100% 100%)}

.stat-item{margin-bottom:22px;position:relative;z-index:1}
.stat-icon{width:36px;height:36px;border:1.5px solid rgba(0,180,216,.35);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:15px;margin-bottom:7px}
.stat-label{font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;
  color:#00b4d8;font-weight:700;margin-bottom:3px}
.stat-value{font-size:11px;color:rgba(255,255,255,.65);font-weight:500}
.stat-dot{width:5px;height:5px;background:#00b4d8;border-radius:50%;margin:6px 0}
.left-site{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
  font-size:8px;color:rgba(255,255,255,.35);letter-spacing:1px;white-space:nowrap}

/* ── Zone principale ── */
.main{flex:1;padding:26px 30px 0 50px;display:flex;flex-direction:column;position:relative}

/* Coin déco haut gauche main */
.main-deco-tl{position:absolute;top:0;left:0;width:44px;height:44px;
  background:linear-gradient(135deg,#00b4d8,#0077b6);
  clip-path:polygon(0 0,100% 0,0 100%);opacity:.6}

/* Ruban haut droite */
.ribbon{position:absolute;top:0;right:0;width:128px;
  background:linear-gradient(170deg,#0b1c3e,#0e2d5c);
  padding:18px 10px 22px;text-align:center;
  clip-path:polygon(0 0,100% 0,100% 88%,50% 100%,0 88%)}
.ribbon-star{font-size:17px;margin-bottom:4px}
.ribbon-name{font-size:7.5px;font-weight:800;letter-spacing:1px;color:#00b4d8;text-transform:uppercase}
.ribbon-sub{font-size:7px;color:rgba(255,255,255,.55);margin-top:5px;line-height:1.5}

/* Logo */
.logo-area{text-align:center;margin-bottom:10px;position:relative;z-index:1}
.logo-main{font-size:24px;font-weight:900;color:#0b1c3e;line-height:1}
.logo-main span{color:#00b4d8}
.logo-dash{font-size:9px;letter-spacing:5px;color:#64748b;text-transform:uppercase;margin:1px 0}
.logo-tag{font-size:9px;color:#94a3b8;font-style:italic}

.hdivider{height:1.5px;background:linear-gradient(to right,transparent,#00b4d8,#0077b6,transparent);margin:8px 0}

/* Titre */
.cert-main-title{text-align:center;font-size:40px;font-weight:900;
  color:#0b1c3e;letter-spacing:5px;text-transform:uppercase;line-height:1}
.cert-sub-title{text-align:center;font-size:13px;font-weight:700;
  color:#00b4d8;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px}

/* Décerné à */
.decerne{display:flex;align-items:center;gap:10px;margin:7px 0}
.dline{flex:1;height:1px;background:#e2e8f0}
.dtxt{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#94a3b8;white-space:nowrap}

/* Nom étudiant */
.student-name{text-align:center;font-family:'Dancing Script',cursive;font-size:50px;
  color:#0b1c3e;line-height:1.05;position:relative;margin:4px 0}
.student-name::after{content:'';display:block;width:80%;height:1.5px;
  background:linear-gradient(to right,transparent,#00b4d8,transparent);
  margin:4px auto 0}

/* Pour avoir */
.pour-avoir{text-align:center;font-size:10px;color:#64748b;margin:10px 0 6px;letter-spacing:.3px}

/* Badge cours */
.course-badge{display:flex;align-items:center;gap:14px;
  background:linear-gradient(135deg,#0b1c3e,#0e2d5c);
  border-radius:8px;padding:10px 22px;margin:0 auto 6px;max-width:460px}
.badge-icon-wrap{width:38px;height:38px;background:rgba(0,180,216,.2);border-radius:7px;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.badge-course{font-size:14px;font-weight:700;color:white}
.badge-level{font-size:10px;color:#00b4d8;margin-top:2px}

/* Attestation */
.attestation{text-align:center;font-size:9.5px;color:#475569;line-height:1.7;margin:6px 0}

/* Bas */
.bottom-row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-bottom:10px}

/* Signatures */
.sigs{display:flex;align-items:flex-end;gap:28px}
.sig{text-align:center}
.sig-cursive{font-family:'Dancing Script',cursive;font-size:22px;color:#0b1c3e;line-height:1;margin-bottom:2px}
.sig-line{width:120px;height:1px;background:#94a3b8;margin-bottom:4px}
.sig-name{font-size:8.5px;font-weight:700;color:#0b1c3e}
.sig-role{font-size:7.5px;color:#94a3b8}

/* Sceau doré */
.seal-wrap{text-align:center}
.seal{width:82px;height:82px;
  background:radial-gradient(circle at 35% 35%,#ffe87c,#d4a017 55%,#9a7200 100%);
  border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:0 6px 24px rgba(180,130,0,.45);border:2px solid rgba(255,220,50,.4);
  margin:0 auto}
.seal-brand-top{font-size:7px;font-weight:800;color:#0b1c3e;letter-spacing:1px;text-transform:uppercase}
.seal-brand-main{font-size:9.5px;font-weight:900;color:#0b1c3e}
.seal-stars{font-size:9px;color:#0b1c3e;letter-spacing:2px}
.seal-ribbon{display:flex;justify-content:center;gap:0;margin-top:2px}
.ribbon-arm{width:0;height:0;border-left:14px solid transparent;
  border-right:14px solid transparent;border-top:16px solid #0b1c3e}

/* QR Code */
.qr-area{text-align:center}
.qr-box{width:84px;height:84px;border:1px solid #e2e8f0;border-radius:4px;padding:3px;margin:0 auto}
.qr-box img{width:100%;height:100%}
.qr-label{font-size:7.5px;font-weight:700;color:#00b4d8;margin-top:5px;letter-spacing:1px}
.cert-id-txt{font-size:8px;color:#0b1c3e;font-weight:700;font-family:monospace;margin-top:2px}

/* Barre de bas */
.footer-strip{background:linear-gradient(135deg,#0b1c3e,#0e2d5c);
  padding:5px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:10px}
.footer-site{font-size:8px;color:rgba(255,255,255,.4);letter-spacing:1px;
  display:flex;align-items:center;gap:5px}
.footer-tag{font-size:8px;color:rgba(255,255,255,.4);letter-spacing:.5px}

@media print{
  body{background:white;padding:0}
  .cert{box-shadow:none;width:100%}
  @page{margin:0;size:A4 landscape}
}
</style>
</head>
<body>
<div class="cert">
  <!-- Panneau gauche -->
  <div class="left">
    <div class="left-deco-tl"></div>
    <div class="left-deco-bl"></div>

    <div class="stat-item">
      <div class="stat-icon">💻</div>
      <div class="stat-label">Cours Complet</div>
      <div class="stat-value">${totalLessons} Modules</div>
    </div>
    <div class="stat-dot"></div>

    <div class="stat-item">
      <div class="stat-icon">📋</div>
      <div class="stat-label">Évaluations Réussies</div>
      <div class="stat-value">Score : ${score}%</div>
    </div>
    <div class="stat-dot"></div>

    <div class="stat-item">
      <div class="stat-icon">⏱</div>
      <div class="stat-label">Durée</div>
      <div class="stat-value">${totalHours} Heures</div>
    </div>
    <div class="stat-dot"></div>

    <div class="stat-item">
      <div class="stat-icon">📅</div>
      <div class="stat-label">Date D'Émission</div>
      <div class="stat-value">${issueDate}</div>
    </div>

    <div class="left-site">🌐 www.xamxamtech.com</div>
  </div>

  <!-- Zone principale -->
  <div class="main">
    <div class="main-deco-tl"></div>

    <!-- Ruban haut droit -->
    <div class="ribbon">
      <div class="ribbon-star">⭐</div>
      <div class="ribbon-name">XAMXAM TECH</div>
      <div class="ribbon-sub">L'excellence dans<br>la formation en ligne</div>
    </div>

    <!-- Logo -->
    <div class="logo-area">
      <div class="logo-main">Xam<span>Xam</span></div>
      <div class="logo-dash">— TECH —</div>
      <div class="logo-tag">Apprendre. Innover. Réussir.</div>
    </div>

    <div class="hdivider"></div>

    <!-- Titre -->
    <div class="cert-main-title">CERTIFICAT</div>
    <div class="cert-sub-title">DE RÉUSSITE</div>

    <!-- Décerné à -->
    <div class="decerne">
      <div class="dline"></div>
      <div class="dtxt">• DÉCERNÉ À •</div>
      <div class="dline"></div>
    </div>

    <!-- Nom -->
    <div class="student-name">${studentName}</div>

    <div class="pour-avoir">pour avoir suivi avec succès et terminé la formation</div>

    <!-- Badge cours -->
    <div class="course-badge">
      <div class="badge-icon-wrap">🎓</div>
      <div>
        <div class="badge-course">${courseName}</div>
        <div class="badge-level">Niveau : ${courseLevel}</div>
      </div>
    </div>

    <!-- Attestation -->
    <div class="attestation">
      Ce certificat atteste de la réussite de toutes les évaluations et de<br>
      l'acquisition des compétences requises dans ce domaine.
    </div>

    <!-- Bas de page -->
    <div class="bottom-row">
      <!-- Signatures + sceau -->
      <div class="sigs">
        <div class="sig">
          <div class="sig-cursive">Thierry K.</div>
          <div class="sig-line"></div>
          <div class="sig-name">M. Thierry K.</div>
          <div class="sig-role">Directeur Académique</div>
        </div>

        <div class="seal-wrap">
          <div class="seal">
            <div class="seal-brand-top">XamXam</div>
            <div class="seal-brand-main">TECH</div>
            <div class="seal-stars">★ ★ ★</div>
          </div>
          <div class="seal-ribbon">
            <div class="ribbon-arm"></div>
          </div>
        </div>

        <div class="sig">
          <div class="sig-cursive">${instructorName.split(' ')[0] || 'Alain'}</div>
          <div class="sig-line"></div>
          <div class="sig-name">${instructorName}</div>
          <div class="sig-role">Responsable Pédagogique</div>
        </div>
      </div>

      <!-- QR Code -->
      <div class="qr-area">
        <div class="qr-box">
          <img src="${qrUrl}" alt="QR Code vérification" />
        </div>
        <div class="qr-label">ID Certificat</div>
        <div class="cert-id-txt">${certId}</div>
      </div>
    </div>

    <!-- Barre footer -->
    <div class="footer-strip">
      <div class="footer-site">🌐 www.xamxamtech.com</div>
      <div class="footer-tag">Ensemble, construisons votre avenir.</div>
    </div>
  </div>
</div>
</body>
</html>`
}

export default function CertificatesPage() {
  const { user }                = useAuth()
  const [certs, setCerts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [printing, setPrinting] = useState(null)
  const [copied, setCopied]     = useState(null)

  useRefreshOnNav(() => {
    setLoading(true)
    studentService.getCertificates()
      .then(data => setCerts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  })

  const handleDownload = (cert) => {
    setPrinting(cert.id)
    const base = window.location.origin
    const html = buildCertificateHTML(cert, base)
    const win  = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.onload = () => { win.print(); setPrinting(null) }
  }

  const handleShare = (cert) => {
    const url = `${window.location.origin}/verify/${cert.certificateId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(cert.id)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-800">Mes certificats 🏆</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? '...' : `${certs.length} certificat(s) obtenu(s)`}
        </p>
      </motion.div>

      {/* Info conditions */}
      <motion.div variants={fadeInUp}
        className="bg-cyan-50 border border-cyan-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <MdVerified className="text-cyan-500 text-xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-cyan-800 text-sm font-semibold">Conditions d'obtention</p>
          <p className="text-cyan-700 text-xs mt-1">
            Complétez <strong>100% des leçons</strong> du cours ET réussissez <strong>tous les quiz</strong>.
            Le certificat est généré automatiquement et téléchargeable en PDF.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
              <Skeleton className="h-36 w-full rounded-xl mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <motion.div variants={fadeInUp}
          className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun certificat pour l'instant</h3>
          <p className="text-slate-400 text-sm">
            Terminez un cours et validez tous ses quiz pour obtenir votre diplôme.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((cert, i) => (
            <motion.div key={cert.id} custom={i} variants={cardVariants}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300">

              {/* Aperçu style certificat */}
              <div className="h-44 bg-gradient-to-br from-[#0b1c3e] to-[#0e2d5c] relative overflow-hidden flex">
                {/* Panneau gauche mini */}
                <div className="w-20 bg-black/20 flex flex-col items-center justify-center gap-2 flex-shrink-0 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 bg-cyan-400/30"
                    style={{ clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
                  <div className="text-center">
                    <div className="text-cyan-400 text-xs font-bold">{cert.score ?? 100}%</div>
                    <div className="text-white/40 text-[9px]">Score</div>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-cyan-400" />
                  <div className="text-center">
                    <div className="text-white/70 text-xs font-bold">{cert.totalLessons || 0}</div>
                    <div className="text-white/40 text-[9px]">Modules</div>
                  </div>
                </div>

                {/* Zone principale mini */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                  <div className="text-white text-xs font-bold tracking-widest opacity-60 mb-1">XAMXAM TECH</div>
                  <div className="text-white/40 text-[9px] tracking-widest mb-3">— TECH —</div>
                  <div className="text-white text-lg font-black tracking-widest uppercase mb-1">CERTIFICAT</div>
                  <div className="text-cyan-400 text-[10px] tracking-widest font-bold mb-2">DE RÉUSSITE</div>
                  <div className="text-white/50 text-[9px] mb-1">DÉCERNÉ À</div>
                  <div className="text-white font-bold text-base" style={{ fontFamily: 'cursive' }}>
                    {cert.studentName || user?.name || 'Apprenant'}
                  </div>
                </div>

                {/* QR mini */}
                <div className="w-16 flex flex-col items-center justify-center pr-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&color=ffffff&bgcolor=00000000&data=${encodeURIComponent(window.location.origin + '/verify/' + cert.certificateId)}`}
                    alt="QR" className="w-10 h-10 opacity-60"
                  />
                </div>
              </div>

              {/* Détails */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-bold text-slate-800 truncate">{cert.courseName || '—'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Niveau : <span className="text-slate-600">{cert.courseLevel || '—'}</span>
                      {' · '}Formateur : <span className="text-slate-600">{cert.instructorName || '—'}</span>
                    </p>
                  </div>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                    <MdVerified /> Certifié
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 flex-wrap">
                  <span>📅 {formatDate(cert.issuedAt)}</span>
                  <span>·</span>
                  <span className="font-mono text-[10px]">{cert.certificateId}</span>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => handleDownload(cert)} disabled={printing === cert.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1c3e] hover:bg-[#0e2d5c] text-white text-xs font-semibold transition-all disabled:opacity-50">
                    {printing === cert.id
                      ? <><FaSpinner className="animate-spin" /> Génération...</>
                      : <><FaDownload /> Télécharger PDF</>}
                  </button>
                  <button type="button" onClick={() => handleShare(cert)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all">
                    {copied === cert.id ? <><FaCheckCircle className="text-green-500" /> Copié !</> : <><FaShareAlt /> Partager</>}
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
