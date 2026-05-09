import { MdDashboard, MdPeople, MdSchool, MdBarChart, MdVerifiedUser, MdForum, MdSettings } from 'react-icons/md'
import { FaCheck } from 'react-icons/fa'

const adminMenu = [
  {
    label: 'Principal',
    items: [
      { icon: <MdDashboard />, label: 'Vue d\'ensemble', to: '/admin' },
      { icon: <MdBarChart />, label: 'Statistiques', to: '/admin/stats' },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { icon: <MdPeople />, label: 'Utilisateurs', to: '/admin/users' },
      { icon: <MdSchool />, label: 'Formations', to: '/admin/courses' },
      { icon: <FaCheck />, label: 'Validation', to: '/admin/validation', badge: '4' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { icon: <MdForum />, label: 'Forum', to: '/admin/forum' },
      { icon: <MdSettings />, label: 'Paramètres', to: '/admin/settings' },
    ],
  },
]

export default adminMenu
