import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white',
  danger: 'bg-red-500 hover:bg-red-400 text-white',
  ghost: 'text-slate-700 hover:bg-slate-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-2 rounded-xl font-semibold
        transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
