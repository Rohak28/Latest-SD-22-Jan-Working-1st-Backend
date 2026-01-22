"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Create the authentication context
const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")
      if (storedUser && storedToken) {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Error loading user from localStorage:", err)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }, [])

  // Signup function
  const signup = async (name, email, password, userType) => {
    try {
      setError(null)
      
      // Call backend API
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Create user object for localStorage
      const newUser = {
        id: data.userId || Date.now().toString(),
        email,
        name,
        userType,
      }

      // Store user and token
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("token", data.token || "dummy-token")
      setCurrentUser(newUser)

      return newUser
    } catch (err) {
      const errorMessage = err.message || "Signup failed"
      setError(errorMessage)
      throw err
    }
  }

  // Login function
  const login = async (email, password, userType) => {
    try {
      setError(null)

      // Call backend API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in")
      }

      // Create user object for localStorage
      const user = {
        id: data.userId || Date.now().toString(),
        email,
        name: data.name || email.split("@")[0],
        userType,
      }

      // Store user and token
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", data.token || "dummy-token")
      setCurrentUser(user)

      return user
    } catch (err) {
      const errorMessage = err.message || "Login failed"
      setError(errorMessage)
      throw err
    }
  }

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setCurrentUser(null)
      setError(null)
      return Promise.resolve()
    } catch (err) {
      console.error("Logout error:", err)
      return Promise.reject(err)
    }
  }

  const value = {
    currentUser,
    userType: currentUser?.userType,
    isPatient: currentUser?.userType === "patient",
    isSLP: currentUser?.userType === "slp",
    isLoggedIn: !!currentUser,
    signup,
    login,
    logout,
    error,
    setError,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
