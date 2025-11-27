"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, BookOpen, CreditCard, Target } from "lucide-react"
import { getAllPayments, getAllEnrollments, getUniqueEnrolledStudents } from "@/lib/enrollment-store"

export default function DashboardPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    setPayments(getAllPayments())
    setEnrollments(getAllEnrollments())
    setStudents(getUniqueEnrolledStudents())
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const stats = useMemo(() => {
    const completedPayments = payments.filter(p => p.status === "completed")
    const totalCourseFees = enrollments.reduce((sum: number, e: any) => sum + e.courseFees, 0)
    const totalPaid = completedPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
    const collectionRate = totalCourseFees > 0 ? Math.round((totalPaid / totalCourseFees) * 100) : 0

    return {
      totalStudents: students.length,
      totalEnrollments: enrollments.length,
      totalCourses: new Set(enrollments.map((e: any) => e.courseId)).size,
      totalPayments: payments.length,
      totalCourseFees,
      totalPaid,
      totalRemaining: totalCourseFees - totalPaid,
      collectionRate,
      completedCount: completedPayments.length,
      pendingCount: payments.filter(p => p.status === "pending").length,
      failedCount: payments.filter(p => p.status === "failed").length,
    }
  }, [payments, enrollments, students])

  const topStudents = useMemo(() => {
    const studentMap = new Map()
    payments.forEach((payment: any) => {
      if (payment.status === "completed") {
        if (!studentMap.has(payment.studentId)) {
          studentMap.set(payment.studentId, {
            studentId: payment.studentId,
            studentName: payment.studentName,
            totalPaid: 0,
            paymentCount: 0,
          })
        }
        const student = studentMap.get(payment.studentId)
        student.totalPaid += payment.amount
        student.paymentCount += 1
      }
    })
    return Array.from(studentMap.values())
      .sort((a: any, b: any) => b.totalPaid - a.totalPaid)
      .slice(0, 5)
  }, [payments])

  const topCourses = useMemo(() => {
    const courseMap = new Map()
    enrollments.forEach((enrollment: any) => {
      if (!courseMap.has(enrollment.courseId)) {
        courseMap.set(enrollment.courseId, {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          enrollmentCount: 0,
          totalFees: 0,
        })
      }
      const course = courseMap.get(enrollment.courseId)
      course.enrollmentCount += 1
      course.totalFees += enrollment.courseFees
    })
    return Array.from(courseMap.values())
      .sort((a: any, b: any) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5)
  }, [enrollments])

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
            📊 Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome to Vidhyarthi Academy Management System</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Students */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Enrollments */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEnrollments}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPayments}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.collectionRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-700">Total Course Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalCourseFees)}</p>
            <p className="text-sm text-green-600 mt-2">Expected revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-700">💰 Total Collected (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalPaid)}</p>
            <p className="text-sm text-blue-600 mt-2">Amount received in rupees</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-orange-700">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.totalRemaining)}</p>
            <p className="text-sm text-orange-600 mt-2">Pending collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Completed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.completedCount}</p>
            <p className="text-sm text-muted-foreground mt-2">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{stats.pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-2">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle>🌟 Top Students by Amount Paid</CardTitle>
          <CardDescription>Students with highest payment amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Payment Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.length > 0 ? (
                  topStudents.map((student: any, index: number) => (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <Badge className="bg-blue-600">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{student.studentName}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(student.totalPaid)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.paymentCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No payment data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Courses */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle>📚 Top Courses by Enrollment</CardTitle>
          <CardDescription>Most popular courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Total Fees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.length > 0 ? (
                  topCourses.map((course: any, index: number) => (
                    <TableRow key={course.courseId}>
                      <TableCell>
                        <Badge className="bg-purple-600">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{course.courseName}</TableCell>
                      <TableCell>{course.courseId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.enrollmentCount}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">{formatCurrency(course.totalFees)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No course data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
