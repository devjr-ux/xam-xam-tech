import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaStar, FaUsers, FaClock, FaArrowRight } from 'react-icons/fa'
import { staggerContainer, fadeInUp, cardVariants } from '../../animations/variants'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const courses = [
  {
    emoji: '⚛️',
    title: 'React.js de Zéro à Expert',
    instructor: 'Mamadou Diallo',
    category: 'Développement Web',
    level: 'Débutant',
    rating: 4.9,
    students: 3200,
    duration: '24h',
    price: '25,000 FCFA',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Bestseller',
    badgeColor: 'yellow',
  },
  {
    emoji: '🐍',
    title: 'Python & Data Science',
    instructor: 'Fatou Sow',
    category: 'Data & IA',
    level: 'Intermédiaire',
    rating: 4.8,
    students: 2100,
    duration: '30h',
    price: '30,000 FCFA',
    color: 'from-green-500 to-teal-600',
    badge: 'Nouveau',
    badgeColor: 'green',
  },
  {
    emoji: '🎨',
    title: 'UI/UX Design avec Figma',
    instructor: 'Aïssatou Ba',
    category: 'Design',
    level: 'Débutant',
    rating: 4.7,
    students: 1800,
    duration: '18h',
    price: '20,000 FCFA',
    color: 'from-purple-500 to-pink-600',
    badge: 'Populaire',
    badgeColor: 'purple',
  },
  {
    emoji: '📱',
    title: 'Flutter - Apps Mobiles',
    instructor: 'Cheikh Mbaye',
    category: 'Mobile',
    level: 'Intermédiaire',
    rating: 4.8,
    students: 1400,
    duration: '28h',
    price: '28,000 FCFA',
    color: 'from-blue-500 to-indigo-600',
    badge: null,
    badgeColor: null,
  },
  {
    emoji: '🔧',
    title: 'Laravel API Backend',
    instructor: 'Ibrahima Ndiaye',
    category: 'Backend',
    level: 'Intermédiaire',
    rating: 4.9,
    students: 1600,
    duration: '22h',
    price: '27,000 FCFA',
    color: 'from-red-500 to-rose-600',
    badge: 'Top Rated',
    badgeColor: 'cyan',
  },
  {
    emoji: '☁️',
    title: 'DevOps & Cloud AWS',
    instructor: 'Moussa Traoré',
    category: 'DevOps',
    level: 'Avancé',
    rating: 4.7,
    students: 980,
    duration: '35h',
    price: '40,000 FCFA',
    color: 'from-orange-500 to-amber-600',
    badge: null,
    badgeColor: null,
  },
]

export default function CoursesPreview() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4"
        >
          <div>
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-sm font-semibold mb-3">
              Nos formations
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900">
              Formations les plus populaires
            </motion.h2>
          </div>
          <motion.div variants={fadeInUp}>
            <Link to="/courses">
              <Button variant="outline" icon={<FaArrowRight />}>Voir tout</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover group"
            >
              {/* Thumbnail */}
              <div className={`h-40 bg-gradient-to-br ${course.color} flex items-center justify-center relative`}>
                <span className="text-6xl">{course.emoji}</span>
                {course.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge color={course.badgeColor}>{course.badge}</Badge>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <FaClock className="text-[10px]" /> {course.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cyan-600 font-semibold bg-cyan-50 px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-xs text-slate-400">{course.level}</span>
                </div>

                <h3 className="font-bold text-slate-800 mb-1.5 text-base leading-snug group-hover:text-cyan-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-xs mb-3">par {course.instructor}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-slate-400" /> {course.students.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-800">{course.price}</span>
                  <Link to={`/courses/${i + 1}`}>
                    <Button size="sm">S&apos;inscrire</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
