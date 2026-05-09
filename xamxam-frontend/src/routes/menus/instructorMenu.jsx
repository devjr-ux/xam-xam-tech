import { MdDashboard, MdSchool, MdQuiz, MdBarChart, MdForum, MdPeople, MdAdd } from 'react-icons/md'

const instructorMenu = [
  {
    label: 'Principal',
    items: [
      { icon: <MdDashboard />, label: 'Dashboard', to: '/instructor' },
      { icon: <MdBarChart />, label: 'Statistiques', to: '/instructor/stats' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { icon: <MdSchool />, label: 'Mes cours', to: '/instructor/courses' },
      { icon: <MdAdd />, label: 'Créer un cours', to: '/instructor/courses/create' },
      { icon: <MdQuiz />, label: 'Créer un Quiz', to: '/instructor/quizzes/create' },
    ],
  },
  {
    label: 'Apprenants',
    items: [
      { icon: <MdPeople />, label: 'Mes apprenants', to: '/instructor/students' },
      { icon: <MdForum />, label: 'Forum', to: '/instructor/forum' },
    ],
  },
]

export default instructorMenu
