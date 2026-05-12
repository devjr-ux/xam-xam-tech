import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import Logo from '../ui/Logo'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'

const links = {
  Plateforme: [
    { label: 'Nos formations', to: '/courses' },
    { label: 'À propos', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Forum', to: '/forum' },
  ],
  Compte: [
    { label: 'Connexion', to: '/login' },
    { label: 'Inscription', to: '/register' },
    { label: 'Dashboard', to: '/student' },
  ],
  Légal: [
    { label: 'Conditions d\'utilisation', to: '#' },
    { label: 'Politique de confidentialité', to: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo to="/" size="md" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              La première plateforme d&apos;e-learning moderne adaptée au contexte africain.
              Apprenez à votre rythme, où que vous soyez.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MdLocationOn className="text-cyan-400" /> Dakar, Sénégal</span>
              <span className="flex items-center gap-2"><MdEmail className="text-cyan-400" /> contact@xamxamtech.com</span>
              <span className="flex items-center gap-2"><MdPhone className="text-cyan-400" /> +221 77 000 00 00</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} XamXam Tech. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: <FaFacebook />, href: '#' },
              { icon: <FaTwitter />, href: '#' },
              { icon: <FaLinkedin />, href: '#' },
              { icon: <FaYoutube />, href: '#' },
              { icon: <FaWhatsapp />, href: '#' },
            ].map(({ icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-cyan-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
