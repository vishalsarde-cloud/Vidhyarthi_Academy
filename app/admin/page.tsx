"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { courses, getAllEnrollments, getAllPayments, formatCurrency, formatDate, getEnrollmentsSnapshot, getPaymentsSnapshot } from "@/lib/data"
import { getAllStudents } from "@/lib/auth-data"
import { DollarSign, Users, AlertCircle, CheckCircle2, Clock, UserCheck, BookOpen, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh data every 1 second to catch updates in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const allPayments = getPaymentsSnapshot()
  const allEnrollments = getEnrollmentsSnapshot()
  const allStudents = getAllStudents()

  const totalRevenue = allPayments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0)
  const totalEnrollments = allEnrollments.length
  const activeCourses = courses.filter((c) => c.active).length
  const totalStudents = allStudents.length

  const pendingPayments = allEnrollments.reduce((count, enrollment) => {
    return count + enrollment.schedule.filter((i) => !i.paid).length
  }, 0)

  const recentPayments = [...allPayments]
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .slice(0, 5)

  const recentStudents = [...allStudents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getPaymentDetails = (payment: (typeof allPayments)[0]) => {
    const enrollment = allEnrollments.find((e) => e.id === payment.enrollmentId)
    const student = allStudents.find((s) => s.id === enrollment?.studentId)
    const course = courses.find((c) => c.id === enrollment?.courseId)
    return { enrollment, student, course }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {allPayments.filter((p) => p.status === "success").length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {allEnrollments.filter((e) => e.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Link href="/admin/pending-payments">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Across all enrollments</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No payments yet</p>
              ) : (
                recentPayments.map((payment) => {
                  const { student, course } = getPaymentDetails(payment)
                  return (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            payment.status === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {payment.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student?.name || "Unknown Student"}</p>
                          <p className="text-sm text-muted-foreground">
                            {course?.title?.substring(0, 25) || "Unknown Course"}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Installment #{payment.installmentNo} | {formatDate(payment.paidAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                        <Badge variant={payment.status === "success" ? "default" : "destructive"} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No students yet</p>
              ) : (
                recentStudents.map((student) => {
                  const studentEnrollments = allEnrollments.filter((e) => e.studentId === student.id)
                  return (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {studentEnrollments.length} courses
                        </Badge>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(student.createdAt)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
