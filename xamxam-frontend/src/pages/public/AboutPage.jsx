import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight } from '../../animations/variants'
import { FaGraduationCap, FaUsers, FaGlobe, FaAward } from 'react-icons/fa'

const team = [
  { name: 'Mamadou Diallo', role: 'CEO & Fondateur', emoji: '👨🏿‍💼', country: '🇸🇳' },
  { name: 'Fatou Sow', role: 'CTO', emoji: '👩🏾‍💻', country: '🇸🇳' },
  { name: 'Kofi Mensah', role: 'Head of Content', emoji: '👨🏾‍🎓', country: '🇬🇭' },
  { name: 'Aïssatou Ba', role: 'Lead Designer', emoji: '👩🏿‍🎨', country: '🇸🇳' },
]

const values = [
  { icon: <FaGraduationCap />, title: 'Excellence', desc: 'Des formations de qualité mondiale adaptées au contexte africain.' },
  { icon: <FaUsers />, title: 'Communauté', desc: 'Apprendre ensemble, s\'entraider, grandir en communauté.' },
  { icon: <FaGlobe />, title: 'Accessibilité', desc: 'Une plateforme accessible même avec une connexion faible.' },
  { icon: <FaAward />, title: 'Reconnaissance', desc: 'Des certificats reconnus par les meilleures entreprises africaines.' },
]

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible" className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Notre mission : <span className="text-gradient">démocratiser</span><br />l&apos;éducation tech en Afrique
          </motion.h1>
          <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-slate-400 text-lg max-w-2xl mx-auto">
            XamXam Tech est née de la conviction que chaque africain mérite accès aux meilleures formations technologiques, peu importe sa connexion ou son budget.
          </motion.p>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-3">Nos valeurs</motion.h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50 transition-colors">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-3">Notre équipe</motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-500">Des passionnés de tech venus de toute l&apos;Afrique</motion.p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center bg-white rounded-2xl p-6 border border-slate-100 card-hover">
                <div className="text-6xl mb-3">{member.emoji}</div>
                <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                <p className="text-slate-500 text-xs mt-1">{member.role}</p>
                <p className="text-lg mt-2">{member.country}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
