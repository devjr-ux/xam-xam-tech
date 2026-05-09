import { motion } from 'framer-motion'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'

const testimonials = [
  {
    name: 'Aminata Diallo',
    role: 'Développeuse Frontend',
    company: 'Orange Sénégal',
    avatar: '👩🏿‍💻',
    text: 'XamXam Tech a transformé ma carrière. En 6 mois, j\'ai appris React et décroché mon premier emploi de développeuse. Les formateurs sont excellents et le suivi est impeccable.',
    rating: 5,
    country: '🇸🇳 Sénégal',
  },
  {
    name: 'Kofi Mensah',
    role: 'Data Scientist',
    company: 'MTN Ghana',
    avatar: '👨🏾‍🔬',
    text: 'La formation Python & Data Science est incroyable. Le contenu est adapté au marché africain avec des cas pratiques locaux. Je recommande à 100%.',
    rating: 5,
    country: '🇬🇭 Ghana',
  },
  {
    name: 'Fatima Ouédraogo',
    role: 'Designer UX/UI',
    company: 'Freelance',
    avatar: '👩🏾‍🎨',
    text: 'Grâce au cours Figma, j\'ai lancé mon activité de freelance. La plateforme fonctionne très bien même avec une connexion lente. C\'est parfait pour l\'Afrique.',
    rating: 5,
    country: '🇧🇫 Burkina Faso',
  },
  {
    name: 'Ibrahim Touré',
    role: 'Développeur Backend',
    company: 'Startup fintech',
    avatar: '👨🏿‍💼',
    text: 'J\'ai appris Laravel en 3 mois sur XamXam Tech. Les quizzes et les projets pratiques m\'ont vraiment aidé à consolider mes connaissances. Top plateforme !',
    rating: 5,
    country: '🇨🇮 Côte d\'Ivoire',
  },
  {
    name: 'Mariama Barry',
    role: 'Product Manager',
    company: 'Wave Africa',
    avatar: '👩🏿‍💼',
    text: 'Même sans background technique, j\'ai réussi à comprendre les bases du développement. Les certificats sont reconnus par les entreprises. Excellente initiative !',
    rating: 5,
    country: '🇬🇳 Guinée',
  },
  {
    name: 'Seydou Coulibaly',
    role: 'DevOps Engineer',
    company: 'Société Générale Mali',
    avatar: '👨🏾‍💻',
    text: 'La formation DevOps est complète et très bien structurée. J\'ai obtenu mon certificat AWS grâce aux bases solides apprises ici. Merci XamXam Tech !',
    rating: 5,
    country: '🇲🇱 Mali',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-sm font-semibold mb-4">
            Témoignages
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ce que disent nos apprenants
          </motion.h2>
          <motion.div variants={fadeInUp} className="flex justify-center items-center gap-2">
            {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-xl" />)}
            <span className="text-slate-600 ml-2 font-semibold">4.9/5 · 3,200+ avis</span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <FaQuoteLeft className="text-cyan-400 text-xl mb-3" />
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.country}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} className="text-yellow-400 text-xs" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
