import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations/variants'
import Button from '../ui/Button'

const perks = [
  'Accès à 200+ formations',
  'Certificats reconnus',
  'Support 7j/7',
  'Communauté active',
]

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-sm font-semibold mb-6">
            Commencez dès aujourd&apos;hui
          </motion.span>

          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Rejoignez les{' '}
            <span className="text-gradient">15,000+</span>{' '}
            apprenants africains
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et accédez à des cours de qualité mondiale
            adaptés à votre contexte local.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-10">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                <FaCheckCircle className="text-cyan-400" />
                {perk}
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto group">
                Créer un compte gratuit
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explorer les formations
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-slate-500 text-xs mt-6">
            Aucune carte de crédit requise · Annulation à tout moment
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
