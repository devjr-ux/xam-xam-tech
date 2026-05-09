import { MdDashboard, MdSchool, MdQuiz, MdEmojiEvents, MdForum, MdFavorite, MdPerson } from 'react-icons/md'

const studentMenu = [
  {
    label: 'Principal',
    items: [
      { icon: <MdDashboard />, label: 'Dashboard', to: '/student' },
      { icon: <MdSchool />, label: 'Mes cours', to: '/student/courses' },
    ],
  },
  {
    label: 'Apprentissage',
    items: [
      { icon: <MdQuiz />, label: 'Quiz', to: '/student/quizzes' },
      { icon: <MdEmojiEvents />, label: 'Certificats', to: '/student/certificates' },
      { icon: <MdFavorite />, label: 'Favoris', to: '/student/favorites' },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { icon: <MdForum />, label: 'Forum', to: '/student/forum' },
      { icon: <MdPerson />, label: 'Mon profil', to: '/student/profile' },
    ],
  },
]

export default studentMenu
