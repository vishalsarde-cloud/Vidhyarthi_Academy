"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to appropriate login page
      if (pathname.startsWith("/admin")) {
        router.push("/login/admin")
      } else {
        router.push("/login")
      }
    }

    // Check role if required
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      if (requiredRole === "admin") {
        router.push("/login/admin?error=unauthorized")
      } else {
        router.push("/login?error=unauthorized")
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, user, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
