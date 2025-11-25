"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  Settings,
  Activity,
  Bell,
  UserCheck,
  ChevronDown,
} from "lucide-react"

const APP_NAME = "Vidyarthi Academy"

type NavItem = 
  | { href: string; label: string; icon: typeof LayoutDashboard }
  | { label: string; icon: typeof LayoutDashboard; submenu: { href: string; label: string }[] }

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  {
    label: "Students",
    icon: UserCheck,
    submenu: [
      { href: "/admin/students", label: "View Students" },
      { href: "/admin/enroll-student", label: "Enroll Student" },
    ],
  },
  { href: "/admin/enrollments", label: "Enrollments", icon: Users },
  {
    label: "Payments",
    icon: CreditCard,
    submenu: [
      { href: "/admin/payments", label: "View Payments" },
      { href: "/admin/offline-payments", label: "Offline Payments" },
    ],
  },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/audit", label: "Audit Logs", icon: Activity },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar text-sidebar-foreground overflow-y-auto">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold">{APP_NAME}</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const hasSubmenu = "submenu" in item
          const isExpanded = hasSubmenu && expandedMenus.includes(item.label)

          if (hasSubmenu && "submenu" in item) {
            const isActive = item.submenu.some((sub) => pathname === sub.href)
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l border-sidebar-border/50 pl-4 mt-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname === subitem.href
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isSubActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                          )}
                        >
                          {subitem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          if ("href" in item) {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          }

          return null
        })}
      </nav>
    </aside>
  )
}
