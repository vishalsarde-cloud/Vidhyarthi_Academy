"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

import { validateCredentials, registerStudent, updateStudentProfile } from "./auth-data"

>
  logout: () => void
  register: (data) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
  isAdmin: boolean
  isStudent: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session on mount
    const storedUser = localStorage.getItem("windsurf_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("windsurf_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password)=> {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const validUser = validateCredentials(email, password)

    if (validUser) {
      setUser(validUser)
      localStorage.setItem("windsurf_user", JSON.stringify(validUser))
      setIsLoading(false)
      return { success: true }
    }

    setIsLoading(false)
    return { success: false, error: "Invalid email or password" }
  }

  const register = async (data)=> {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const newUser = registerStudent(data)
      setUser(newUser)
      localStorage.setItem("windsurf_user", JSON.stringify(newUser))
      setIsLoading(false)
      return { success: true }
    } catch {
      setIsLoading(false)
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  const updateProfile = async (data)=> {
    if (!user) return { success: false, error: "Not authenticated" }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = updateStudentProfile(user.email, data)
    if (updatedUser) {
      setUser(updatedUser)
      localStorage.setItem("windsurf_user", JSON.stringify(updatedUser))
      setIsLoading(false)
      return { success: true }
    }

    setIsLoading(false)
    return { success: false, error: "Failed to update profile" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("windsurf_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStudent: user?.role === "student",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
