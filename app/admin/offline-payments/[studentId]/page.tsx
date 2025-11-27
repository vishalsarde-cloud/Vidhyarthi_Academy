"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Printer, Download, Edit2, Trash2 } from "lucide-react"
import {
  getAllPayments,
  getAllEnrollments,
  updatePayment,
  deletePayment,
  getAllPaymentsForStudent,
} from "@/lib/enrollment-store"
import { getPayments } from "@/lib/data"
import { printPaymentReceipt, generateDownloadReceipt } from "@/lib/offline-receipt-generator"

export default function StudentPaymentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string

  const [payments, setPayments] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [student, setStudent] = useState<any>(null)

  // Load data on mount
  useEffect(() => {
    const allEnrollments = getAllEnrollments()
    const onlinePayments = getPayments()
    
    setEnrollments(allEnrollments)

    // Get student info from enrollments
    const studentEnrollments = allEnrollments.filter(e => e.studentId === studentId)
    if (studentEnrollments.length > 0) {
      const firstEnrollment = studentEnrollments[0]
      setStudent({
        studentId: firstEnrollment.studentId,
        studentName: firstEnrollment.studentName,
        studentEmail: firstEnrollment.studentEmail,
        studentPhone: firstEnrollment.studentPhone,
        enrollments: studentEnrollments,
      })
      
      // Get all payments (both online and offline)
      const allPayments = getAllPaymentsForStudent(studentId, allEnrollments, onlinePayments)
      setPayments(allPayments)
    }
  }, [studentId])

  const studentPayments = useMemo(() => {
    return payments.filter(p => p.studentId === studentId)
  }, [payments, studentId])

  const stats = useMemo(() => {
    return {
      total: studentPayments.length,
      completed: studentPayments.filter(p => p.status === "completed").length,
      pending: studentPayments.filter(p => p.status === "pending").length,
      failed: studentPayments.filter(p => p.status === "failed").length,
      totalAmount: studentPayments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    }
  }, [studentPayments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    updatePayment(paymentId, { status: newStatus })
    setPayments(getAllPayments())
  }

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId)
    setPayments(getAllPayments())
  }

  const filteredPayments = statusFilter === "all" 
    ? studentPayments 
    : studentPayments.filter(p => p.status === statusFilter)

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading student details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <Button
          onClick={() => router.back()}
          className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            👤 {student.studentName}
          </h1>
          <p className="text-muted-foreground mt-1">ID: <span className="font-semibold text-slate-700">{student.studentId}</span></p>
        </div>
      </div>

      {/* Student Information */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
          <CardTitle className="text-2xl text-slate-800">📋 Student Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</p>
              <p className="font-semibold text-lg text-slate-800 mt-2">{student.studentName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
              <p className="font-semibold text-lg text-slate-800 mt-2">{student.studentEmail || "-"}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</p>
              <p className="font-semibold text-lg text-slate-800 mt-2">{student.studentPhone || "-"}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Enrollments</p>
              <p className="font-semibold text-lg text-blue-700 mt-2">{student.enrollments.length}</p>
            </div>
          </div>

          {/* Installment Details by Course */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-xl mb-4 text-slate-800">📊 Installment Details by Course</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-center">Total Installments</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-center">Current Installment</TableHead>
                    <TableHead className="text-right">Total Fees</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.map((enrollment: any) => {
                    const enrollmentPayments = studentPayments.filter(p => p.enrollmentId === enrollment.id && p.status === "completed")
                    const totalPaid = enrollmentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
                    const remaining = Math.max(0, enrollment.courseFees - totalPaid)
                    const totalInstallments = enrollment.selectedInstallments || 1
                    const installmentAmount = enrollment.courseFees / totalInstallments
                    const completedInstallments = Math.floor(totalPaid / installmentAmount)
                    const nextInstallmentNo = completedInstallments + 1
                    
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold">{enrollment.courseName}</TableCell>
                        <TableCell className="text-center font-semibold">{totalInstallments}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">{completedInstallments}/{totalInstallments}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800">#{nextInstallmentNo}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(enrollment.courseFees)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{formatCurrency(totalPaid)}</TableCell>
                        <TableCell className={`text-right font-semibold ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(remaining)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Payments</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Collected</p>
                <p className="text-2xl font-bold text-purple-600 mt-1 break-words">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
          <CardTitle className="text-2xl text-slate-800">📚 Enrolled Courses</CardTitle>
          <CardDescription className="text-base">Courses this student is enrolled in with installment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Course Fees</TableHead>
                  <TableHead>Total Installments</TableHead>
                  <TableHead>Current Installment</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.enrollments.length > 0 ? (
                  student.enrollments.map((enrollment: any) => {
                    const enrollmentPayments = studentPayments.filter(p => p.enrollmentId === enrollment.id && p.status === "completed")
                    const totalPaid = enrollmentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
                    const totalInstallments = enrollment.selectedInstallments || 1
                    const installmentAmount = enrollment.courseFees / totalInstallments
                    const completedInstallments = Math.floor(totalPaid / installmentAmount)
                    const currentInstallmentNo = completedInstallments + 1
                    
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-semibold">{enrollment.courseName}</TableCell>
                        <TableCell>{enrollment.courseId}</TableCell>
                        <TableCell>{formatCurrency(enrollment.courseFees)}</TableCell>
                        <TableCell className="font-semibold">{totalInstallments}</TableCell>
                        <TableCell className="font-semibold text-blue-600">#{currentInstallmentNo}</TableCell>
                        <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Payment Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course-wise Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course-wise Payment Summary</CardTitle>
          <CardDescription>Total paid vs course fees for each enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Course Fees</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.enrollments.map((enrollment: any) => {
                  const coursePayments = studentPayments.filter(p => p.courseId === enrollment.courseId && p.status === "completed")
                  const totalPaid = coursePayments.reduce((sum, p) => sum + p.amount, 0)
                  const remaining = Math.max(0, enrollment.courseFees - totalPaid)
                  const percentage = (totalPaid / enrollment.courseFees) * 100
                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-semibold">{enrollment.courseName}</TableCell>
                      <TableCell>{formatCurrency(enrollment.courseFees)}</TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(totalPaid)}</TableCell>
                      <TableCell className={remaining > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {studentPayments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment: any, index: number) => {
                    const coursePayments = studentPayments.filter(p => p.courseId === payment.courseId).sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())
                    const installmentNo = coursePayments.findIndex(p => p.id === payment.id) + 1
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold">{payment.courseName}</TableCell>
                        <TableCell className="font-semibold">#{installmentNo}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={payment.status} onValueChange={(newStatus) => handleStatusChange(payment.id, newStatus)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => printPaymentReceipt({
                                studentId: payment.studentId,
                                studentName: payment.studentName,
                                courseId: payment.courseId,
                                courseName: payment.courseName,
                                courseFees: payment.courseFees,
                                paymentAmount: payment.amount,
                                paymentDate: payment.paymentDate,
                                paymentMethod: payment.paymentMethod,
                                paymentStatus: payment.status,
                                notes: payment.notes,
                                receiptId: payment.receiptId,
                                createdAt: payment.createdAt,
                              })}
                              title="Print Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateDownloadReceipt({
                                studentId: payment.studentId,
                                studentName: payment.studentName,
                                courseId: payment.courseId,
                                courseName: payment.courseName,
                                courseFees: payment.courseFees,
                                paymentAmount: payment.amount,
                                paymentDate: payment.paymentDate,
                                paymentMethod: payment.paymentMethod,
                                paymentStatus: payment.status,
                                notes: payment.notes,
                                receiptId: payment.receiptId,
                                createdAt: payment.createdAt,
                              })}
                              title="Download Receipt"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-destructive hover:text-destructive"
                              title="Delete Payment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
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
