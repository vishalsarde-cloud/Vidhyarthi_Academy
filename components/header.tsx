"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, Menu, LogOut, LayoutDashboard, LogIn, User, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const APP_NAME = "Vidhyarthi Academy"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/courses">
            <Button variant={pathname === "/courses" ? "secondary" : "ghost"} className="text-sm">
              Courses
            </Button>
          </Link>
          {isAuthenticated && user?.role === "student" && (
            <>
              <Link href="/my-enrollments">
                <Button variant={pathname === "/my-enrollments" ? "secondary" : "ghost"} className="text-sm">
                  My Enrollments
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant={pathname === "/profile" ? "secondary" : "ghost"} className="text-sm">
                  Profile
                </Button>
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === "admin" && (
            <Link href="/admin">
              <Button variant={pathname.startsWith("/admin") ? "secondary" : "ghost"} className="text-sm">
                Admin Portal
              </Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-primary capitalize mt-1">{user?.role} Account</p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === "student" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-enrollments" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        My Enrollments
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Student Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="text-sm bg-transparent">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/courses" className="cursor-pointer">
                  Courses
                </Link>
              </DropdownMenuItem>
              {isAuthenticated && user?.role === "student" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/my-enrollments" className="cursor-pointer">
                      My Enrollments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    Admin Portal
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      Student Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login/admin" className="cursor-pointer">
                      Admin Login
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
