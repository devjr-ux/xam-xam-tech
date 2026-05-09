export const formatPrice = (amount, currency = 'FCFA') =>
  `${Number(amount).toLocaleString('fr-FR')} ${currency}`

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
}

export const truncate = (str, length = 80) =>
  str?.length > length ? str.slice(0, length) + '…' : str

export const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'XX'

export const getRoleLabel = (role) =>
  ({ admin: 'Administrateur', instructor: 'Formateur', student: 'Apprenant' }[role] || role)
