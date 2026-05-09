import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../../animations/variants'

const features = [
  {
    icon: '🎥',
    title: 'Vidéos HD optimisées',
    desc: 'Cours en vidéo haute définition, compressés pour les faibles connexions 3G/4G africaines.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: '📝',
    title: 'Quiz interactifs',
    desc: 'Évaluez vos connaissances avec des quiz dynamiques et obtenez des résultats instantanés.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: '🏆',
    title: 'Certificats reconnus',
    desc: 'Obtenez des certificats téléchargeables validés par des entreprises partenaires africaines.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: '📊',
    title: 'Suivi de progression',
    desc: 'Visualisez votre progression en temps réel et fixez vos objectifs d\'apprentissage.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: '💬',
    title: 'Forum communautaire',
    desc: 'Échangez avec d\'autres apprenants et formateurs dans notre forum de discussion.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '📱',
    title: '100% Mobile Ready',
    desc: 'Interface optimisée pour smartphones et tablettes. Apprenez n\'importe où en Afrique.',
    color: 'from-rose-500 to-red-600',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-sm font-semibold mb-4">
            Pourquoi XamXam Tech ?
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Tout ce dont vous avez besoin pour apprendre
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-500 text-lg max-w-2xl mx-auto">
            Une plateforme complète pensée pour les apprenants africains, avec des outils modernes
            et une expérience d&apos;apprentissage engageante.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="group p-6 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 bg-white"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
