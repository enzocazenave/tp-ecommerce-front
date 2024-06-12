import { createContext, useEffect, useState } from 'react'
import api from '../api/api'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('checking')
  const [user, setUser] = useState({})

  useEffect(() => {
    validateToken()
  }, [])

  const setCheckingStatus = () => {
    setStatus('checking')
  }

  const login = (userData) => {
    setStatus('authenticated')
    setUser(userData)
    window.localStorage.setItem('TOKEN', userData.token)
  }

  const logout = () => {
    setStatus('not_authenticated')
    setUser({})
    window.localStorage.removeItem('TOKEN')
  }

  const validateToken = async () => {
    if (!window.localStorage.getItem('TOKEN')) {
      return logout()
    }

    try {
      const { data: response } = await api.get('/auth/renew')
      login(response.data)
    } catch(error) {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{
      setCheckingStatus, login, logout, user, status
    }}>
      { children }
    </AuthContext.Provider>
  )
}