import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../../animations/variants'
import Button from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center max-w-md"
      >
        <motion.div
          variants={fadeInUp}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-9xl mb-6"
        >
          🚀
        </motion.div>

        <motion.h1 variants={fadeInUp} className="text-8xl font-black text-gradient mb-4">
          404
        </motion.h1>

        <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-white mb-3">
          Page introuvable
        </motion.h2>

        <motion.p variants={fadeInUp} className="text-slate-400 mb-8 leading-relaxed">
          Cette page s&apos;est égarée dans l&apos;espace digital. Pas d&apos;inquiétude, revenons sur Terre.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto justify-center">
              ← Retour à l&apos;accueil
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
              Voir les formations
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
