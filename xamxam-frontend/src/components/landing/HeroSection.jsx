import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaPlayCircle, FaArrowRight, FaStar } from 'react-icons/fa'
import { HiAcademicCap, HiUsers, HiBookOpen } from 'react-icons/hi'
import Button from '../ui/Button'
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../../animations/variants'

const stats = [
  { icon: <HiUsers />, value: '15,000+', label: 'Apprenants' },
  { icon: <HiBookOpen />, value: '200+', label: 'Formations' },
  { icon: <HiAcademicCap />, value: '98%', label: 'Satisfaction' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-700/20 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Plateforme #1 en Afrique de l&apos;Ouest</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Apprenez les{' '}
              <span className="text-gradient">compétences tech</span>{' '}
              de demain
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              XamXam Tech vous offre des formations certifiantes en développement web, data, design et plus encore.
              Optimisé pour les faibles connexions. Accessible partout en Afrique.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-10">
              <Link to="/register">
                <Button size="lg" className="group">
                  Commencer gratuitement
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" size="lg" icon={<FaPlayCircle />}>
                  Voir les formations
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['🧑🏿‍💻', '👩🏾‍🎓', '👨🏽‍💼', '👩🏿‍🔬', '🧑🏾‍🎨'].map((emoji, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-base">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-xs" />)}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">+15,000 apprenants satisfaits</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Visual card */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              {/* Main card */}
              <div className="glassmorphism rounded-3xl p-6 w-80">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl">
                      🚀
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">React.js Avancé</p>
                      <p className="text-white/70 text-xs">48 leçons · 12h</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-3/5" />
                  </div>
                  <p className="text-white/70 text-xs mt-1.5">60% complété</p>
                </div>

                <div className="space-y-3">
                  {['Introduction à React Hooks', 'State Management', 'API REST avec Axios'].map((lesson, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/50'}`}>
                        {i < 2 ? '✓' : (i + 1)}
                      </div>
                      <span className={`text-sm ${i < 2 ? 'text-white' : 'text-white/50'}`}>{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 glassmorphism rounded-2xl px-3 py-2"
              >
                <p className="text-white text-xs font-medium">🏆 Certificat inclus</p>
              </motion.div>

              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 glassmorphism rounded-2xl px-3 py-2"
              >
                <p className="text-white text-xs font-medium">📱 Mobile first</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-white/10"
        >
          {stats.map(({ icon, value, label }, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <div className="text-cyan-400 text-2xl flex justify-center mb-2">{icon}</div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
