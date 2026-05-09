import { motion } from 'framer-motion'
import { scaleIn } from '../../animations/variants'

export default function Card({ children, className = '', animate = true, hover = true }) {
  const base = `bg-white rounded-2xl shadow-sm border border-slate-100 ${hover ? 'card-hover' : ''} ${className}`

  if (animate) {
    return (
      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={base}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}
