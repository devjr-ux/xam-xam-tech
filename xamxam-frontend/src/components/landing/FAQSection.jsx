import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import { staggerContainer, fadeInUp } from '../../animations/variants'

const faqs = [
  {
    q: 'Est-ce que les formations sont gratuites ?',
    a: 'Nous proposons des cours d\'initiation gratuits. Les formations certifiantes sont payantes, avec des tarifs adaptés au contexte africain (à partir de 15,000 FCFA). Des bourses sont disponibles pour les étudiants.',
  },
  {
    q: 'La plateforme fonctionne-t-elle avec une faible connexion internet ?',
    a: 'Oui ! XamXam Tech est optimisé pour les connexions 3G et même 2G. Les vidéos sont compressées et disponibles en différentes qualités. Vous pouvez aussi télécharger les cours en PDF pour un accès hors ligne.',
  },
  {
    q: 'Les certificats sont-ils reconnus par les entreprises ?',
    a: 'Nos certificats sont reconnus par plus de 50 entreprises partenaires en Afrique de l\'Ouest (MTN, Orange, Wave, etc.). Ils peuvent être partagés sur LinkedIn et intégrés à votre CV.',
  },
  {
    q: 'Comment fonctionne le suivi de progression ?',
    a: 'Votre tableau de bord affiche en temps réel votre progression dans chaque cours, les quiz réussis, les heures d\'apprentissage et vos points forts. Des rappels sont envoyés pour vous motiver.',
  },
  {
    q: 'Puis-je devenir formateur sur XamXam Tech ?',
    a: 'Absolument ! Si vous êtes expert dans votre domaine, vous pouvez postuler comme formateur. Nos équipes vous forment pour créer des cours de qualité et vous recevez une commission sur chaque inscription.',
  },
  {
    q: 'Y a-t-il un accompagnement personnalisé ?',
    a: 'Oui. Chaque apprenant a accès au forum de discussion, aux sessions Q&A avec les formateurs, et peut bénéficier d\'un mentorat individuel via notre programme premium.',
  },
]

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FiChevronDown className="text-slate-400 text-xl" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
            FAQ
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-500">
            Vous avez des questions ? Nous avons les réponses.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
