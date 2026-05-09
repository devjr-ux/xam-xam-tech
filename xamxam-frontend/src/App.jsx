import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { RefreshProvider } from './context/RefreshContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <RefreshProvider>
            <AppRouter />
          </RefreshProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
