import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  currentUserRequest,
  loginRequest,
  logoutRequest,
} from '../api/auth'
import { ApiError, setUnauthorizedHandler } from '../api/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const refreshMe = useCallback(async () => {
    setLoading(true)
    setAuthError(null)

    try {
      const currentUser = await currentUserRequest()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      setUser(null)
      if (!(error instanceof ApiError) || error.status !== 401) setAuthError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const removeHandler = setUnauthorizedHandler(() => {
      setUser(null)
      setAuthError(null)
    })
    const bootstrapTimer = window.setTimeout(refreshMe, 0)
    return () => {
      window.clearTimeout(bootstrapTimer)
      removeHandler()
    }
  }, [refreshMe])

  const login = useCallback(async (credentials) => {
    const authenticatedUser = await loginRequest(credentials)
    setUser(authenticatedUser)
    setAuthError(null)
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setAuthError(null)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshMe,
  }), [authError, loading, login, logout, refreshMe, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
