import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

// Public Pages
import LandingPage from '../pages/public/LandingPage'
import CoursesPage from '../pages/public/CoursesPage'
import CourseDetailPage from '../pages/public/CourseDetailPage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminCoursesPage from '../pages/admin/AdminCoursesPage'
import AdminStatsPage from '../pages/admin/AdminStatsPage'
import AdminValidationPage from '../pages/admin/AdminValidationPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'

// Instructor Pages
import InstructorDashboard from '../pages/instructor/InstructorDashboard'
import InstructorCoursesPage from '../pages/instructor/InstructorCoursesPage'
import CreateCoursePage from '../pages/instructor/CreateCoursePage'
import InstructorStudentsPage from '../pages/instructor/InstructorStudentsPage'
import InstructorStatsPage from '../pages/instructor/InstructorStatsPage'
import CreateQuizPage from '../pages/instructor/CreateQuizPage'

// 404
import NotFoundPage from '../pages/public/NotFoundPage'

// Student Pages
import PaymentPage from '../pages/student/PaymentPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentCoursesPage from '../pages/student/StudentCoursesPage'
import LearnPage from '../pages/student/LearnPage'
import QuizPage from '../pages/student/QuizPage'
import CertificatesPage from '../pages/student/CertificatesPage'
import FavoritesPage from '../pages/student/FavoritesPage'
import ProfilePage from '../pages/student/ProfilePage'

// Shared
import ForumPage from '../pages/shared/ForumPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* ─── Public ─── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* ─── Auth ─── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ─── Lecture cours (plein écran) ─── */}
      <Route
        path="/courses/:id/learn"
        element={
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        }
      />

      {/* ─── Page de paiement ─── */}
      <Route
        path="/courses/:courseId/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* ─── Admin ─── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="stats" element={<AdminStatsPage />} />
        <Route path="validation" element={<AdminValidationPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ─── Instructor ─── */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="courses" element={<InstructorCoursesPage />} />
        <Route path="courses/create" element={<CreateCoursePage />} />
        <Route path="courses/:id/edit" element={<CreateCoursePage />} />
        <Route path="students" element={<InstructorStudentsPage />} />
        <Route path="stats" element={<InstructorStatsPage />} />
        <Route path="quizzes/create" element={<CreateQuizPage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="*" element={<Navigate to="/instructor" replace />} />
      </Route>

      {/* ─── Student ─── */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="quizzes/:id" element={<QuizPage />} />
        <Route path="quizzes" element={<QuizPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>

      {/* ─── 404 ─── */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
