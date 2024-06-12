import { createRoot } from 'react-dom/client'
import MainPage from './MainPage'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Toaster position="bottom-right" />
    <MainPage />
  </AuthProvider>
)