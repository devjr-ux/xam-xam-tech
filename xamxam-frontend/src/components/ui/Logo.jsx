import { Link } from 'react-router-dom'
import { FaGraduationCap } from 'react-icons/fa'

/**
 * Logo XamXam Tech
 * @param {string}  to     - lien (défaut: "/")
 * @param {string}  size   - "sm" | "md" | "lg"
 * @param {boolean} noLink - si true, pas de wrapper <Link>
 */
export default function Logo({ to = '/', size = 'md', noLink = false }) {
  const sizes = {
    sm: { icon: 'w-7 h-7 text-sm',  text: 'text-base' },
    md: { icon: 'w-9 h-9 text-base', text: 'text-xl'  },
    lg: { icon: 'w-12 h-12 text-2xl', text: 'text-2xl' },
  }
  const s = sizes[size] || sizes.md

  const content = (
    <span className="inline-flex items-center gap-2">
      <span className={`${s.icon} bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <FaGraduationCap className="text-white" />
      </span>
      <span className={`${s.text} font-bold text-white`}>
        Xam<span className="text-cyan-400">Xam</span>
        <span className="text-slate-400 text-sm font-normal ml-1">Tech</span>
      </span>
    </span>
  )

  if (noLink) return content

  return <Link to={to} className="inline-flex items-center">{content}</Link>
}
