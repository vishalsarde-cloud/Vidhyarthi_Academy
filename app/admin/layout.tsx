"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-muted/30">
        <AdminSidebar />
        <div className="pl-64">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
