import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight } from '../../animations/variants'
import Button from '../../components/ui/Button'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible" className="text-4xl font-bold text-white mb-3">
            Contactez-<span className="text-gradient">nous</span>
          </motion.h1>
          <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-slate-400">
            Notre équipe est disponible 7j/7 pour vous aider
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-5">
            {[
              { icon: <MdEmail />, title: 'Email', info: 'contact@xamxamtech.com', color: 'bg-cyan-100 text-cyan-600' },
              { icon: <MdPhone />, title: 'Téléphone', info: '+221 77 000 00 00', color: 'bg-blue-100 text-blue-600' },
              { icon: <MdLocationOn />, title: 'Adresse', info: 'Dakar, Sénégal', color: 'bg-green-100 text-green-600' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-xl`}>{item.icon}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-slate-500 text-sm">{item.info}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeInRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-100">
            {sent ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Message envoyé !</h3>
                <p className="text-slate-500">Nous vous répondrons dans les 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Envoyer un message</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Nom complet</label>
                    <input type="text" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" placeholder="Mamadou Diallo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" placeholder="votre@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Sujet</label>
                  <input type="text" required value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" placeholder="Votre sujet" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none" placeholder="Votre message..." />
                </div>
                <Button type="submit" size="md" className="w-full justify-center">Envoyer le message</Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
