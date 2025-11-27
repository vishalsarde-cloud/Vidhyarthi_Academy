"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Trash2, Plus, CreditCard, Download, Printer, CheckCircle2, XCircle, RefreshCw, Eye, AlertCircle } from "lucide-react"
import {
  getAllEnrollments,
  getAllPayments,
  getUniqueEnrolledStudents,
  addPayment,
  updatePayment,
  deletePayment,
  getPaymentSummaryForEnrollment,
  getAllPaymentsForStudent,
} from "@/lib/enrollment-store"
import { getPayments } from "@/lib/data"
import { getAllStudents as getAllRegisteredStudents } from "@/lib/auth-data"
import { printPaymentReceipt, generateDownloadReceipt } from "@/lib/offline-receipt-generator"

export default function OfflinePaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [editData, setEditData] = useState<any>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  // Get unique enrolled students
  const enrolledStudents = useMemo(() => {
    return getUniqueEnrolledStudents()
  }, [enrollments])

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter(student =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery)
    )
  }, [enrolledStudents, searchQuery])

  // Get payments for selected student
  const studentPayments = useMemo(() => {
    if (!selectedStudent) return []
    return payments.filter(p => p.studentId === selectedStudent.studentId)
  }, [selectedStudent, payments])

  // Filter payments by status
  const filteredPayments = useMemo(() => {
    let result = studentPayments
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter)
    }
    return result
  }, [studentPayments, statusFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = payments.length
    const completed = payments.filter(p => p.status === "completed").length
    const pending = payments.filter(p => p.status === "pending").length
    const totalAmount = payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0)
    return { total, completed, pending, totalAmount }
  }, [payments])

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment)
    setEditData({ ...payment })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    updatePayment(selectedPayment.id, editData)
    setPayments(getAllPayments())
    setIsEditDialogOpen(false)
    setSelectedPayment(null)
  }

  // Load data on mount
  useEffect(() => {
    const allEnrollments = getAllEnrollments()
    const offlinePayments = getAllPayments()
    const onlinePayments = getPayments()
    
    setEnrollments(allEnrollments)
    
    // Combine offline and online payments
    const combinedPayments = [
      ...offlinePayments,
      ...onlinePayments.map(p => {
        const enrollment = allEnrollments.find(e => e.id === p.enrollmentId)
        if (enrollment) {
          return {
            id: p.id,
            receiptId: p.receiptId || `RCP-${p.id}`,
            studentId: enrollment.studentId,
            studentName: enrollment.studentName,
            enrollmentId: p.enrollmentId,
            courseId: enrollment.courseId,
            courseName: enrollment.courseName,
            courseFees: enrollment.courseFees,
            amount: p.amount,
            installmentNo: p.installmentNo,
            paymentDate: p.paidAt,
            paymentMethod: p.method || "online",
            status: p.status === "success" ? "completed" : p.status,
            notes: "",
            createdAt: p.paidAt,
            updatedAt: p.paidAt,
            createdBy: "student",
          }
        }
        return null
      }).filter(Boolean)
    ]
    
    setPayments(combinedPayments)
  }, [])

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId)
    setPayments(getAllPayments())
    setDeleteConfirm(null)
  }

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    updatePayment(paymentId, { status: newStatus })
    setPayments(getAllPayments())
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
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

  const handleAddPayment = () => {
    if (!selectedEnrollment) {
      alert("Please select an enrollment first")
      return
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    // Calculate total already paid for this enrollment
    const enrollmentPayments = payments.filter(p => p.enrollmentId === selectedEnrollment.id && p.status === "completed")
    const totalAlreadyPaid = enrollmentPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalWillBePaid = totalAlreadyPaid + paymentData.amount

    // Validate that total payment doesn't exceed course fees
    if (totalWillBePaid > selectedEnrollment.courseFees) {
      const remaining = selectedEnrollment.courseFees - totalAlreadyPaid
      alert(`❌ Payment amount exceeds remaining balance!\n\nCourse Fees: ${formatCurrency(selectedEnrollment.courseFees)}\nAlready Paid: ${formatCurrency(totalAlreadyPaid)}\nRemaining: ${formatCurrency(remaining)}\n\nPlease enter an amount ≤ ${formatCurrency(remaining)}`)
      return
    }

    addPayment({
      studentId: selectedEnrollment.studentId,
      studentName: selectedEnrollment.studentName,
      enrollmentId: selectedEnrollment.id,
      courseId: selectedEnrollment.courseId,
      courseName: selectedEnrollment.courseName,
      courseFees: selectedEnrollment.courseFees,
      amount: paymentData.amount,
      installmentNo: 1,
      paymentDate: paymentData.paymentDate,
      paymentMethod: "offline",
      status: "completed",
      notes: paymentData.notes,
      createdBy: "admin",
    })

    alert(`✅ Payment of ${formatCurrency(paymentData.amount)} recorded for ${selectedEnrollment.studentName}`)
    setPaymentData({ amount: 0, paymentDate: new Date().toISOString().split("T")[0], notes: "" })
    setSelectedEnrollment(null)
    setPayments(getAllPayments())
  }

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("No payments to export")
      return
    }

    const headers = ["Student Name", "Student ID", "Course Name", "Amount", "Payment Date", "Status", "Payment Method", "Notes"]
    const rows = payments.map(p => [
      p.studentName,
      p.studentId,
      p.courseName,
      p.amount.toFixed(2),
      new Date(p.paymentDate).toLocaleDateString(),
      p.status,
      p.paymentMethod || "-",
      p.notes || "-"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `offline-payments-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            💳 Offline Payments Management
          </h1>
          <p className="text-muted-foreground mt-2 text-base">Efficiently manage student payments and track installments</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border border-slate-200 p-1">
          <TabsTrigger value="view" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            📊 View Payments
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4" />
            ➕ Record Payment
          </TabsTrigger>
        </TabsList>

        {/* View Payments Tab */}
        <TabsContent value="view" className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{payments.filter((p) => p.status === "failed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-purple-600/10">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-700">💰 Total Collected</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {formatCurrency(payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-base font-semibold text-slate-700">🔍 Search Students</Label>
            <Input
              id="search"
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
          <CardTitle className="text-2xl text-slate-800">👥 Enrolled Students</CardTitle>
          <CardDescription className="text-base">View and manage student payments with installment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course Fees</TableHead>
                  <TableHead>Fees Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => {
                    const studentPayments = payments.filter(p => p.studentId === student.studentId && p.status === "completed")
                    const totalCourseFees = student.enrollments.reduce((sum: number, e: any) => sum + e.courseFees, 0)
                    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0)
                    const remaining = Math.max(0, totalCourseFees - totalPaid)
                    const progressPercentage = totalCourseFees > 0 ? (totalPaid / totalCourseFees) * 100 : 0
                    const paymentStatus = remaining === 0 ? "Completed" : remaining < totalCourseFees * 0.25 ? "Almost Done" : "In Progress"
                    
                    return (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold">{student.studentName}</TableCell>
                        <TableCell>{student.studentEmail || "-"}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(totalCourseFees)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">{Math.round(progressPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              paymentStatus === "Completed" 
                                ? "bg-green-50 text-green-700" 
                                : paymentStatus === "Almost Done"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-blue-50 text-blue-700"
                            }
                          >
                            {paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                              title="Manage Installments"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/offline-payments/${student.studentId}`)}
                              title="View Full Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records for Selected Student */}
      {selectedStudent && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{selectedStudent.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedStudent.studentEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedStudent.studentPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-semibold">{selectedStudent.studentId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>Showing {filteredPayments.length} of {studentPayments.length} payments for {selectedStudent.studentName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Installment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(payment => {
                        const coursePayments = studentPayments.filter(p => p.courseId === payment.courseId).sort((a: any, b: any) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())
                        const installmentNo = coursePayments.findIndex(p => p.id === payment.id) + 1
                        
                        return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.studentName}</p>
                              <p className="text-xs text-muted-foreground">{payment.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{payment.courseName}</TableCell>
                          <TableCell className="font-semibold">#{installmentNo}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
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
                            <Badge variant="outline">{payment.paymentMethod}</Badge>
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
                                className="gap-1"
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
                                className="gap-1"
                                title="Download Receipt"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPayment(payment)}
                                className="gap-1"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(payment.id)}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
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
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update payment details</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input
                    value={editData.studentName || ""}
                    onChange={(e) => handleFieldChange("studentName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input
                    value={editData.courseName || ""}
                    onChange={(e) => handleFieldChange("courseName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={editData.amount || ""}
                    onChange={(e) => handleFieldChange("amount", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={editData.paymentDate || ""}
                    onChange={(e) => handleFieldChange("paymentDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editData.status || ""} onValueChange={(value) => handleFieldChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Input
                    value={editData.paymentMethod || ""}
                    onChange={(e) => handleFieldChange("paymentMethod", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={editData.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Add notes"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Payment</DialogTitle>
              <DialogDescription>Are you sure you want to delete this payment? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeletePayment(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
        </TabsContent>

        {/* Manage Payments Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Offline Payment</CardTitle>
              <CardDescription>Add offline payment entry for enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment">Select Enrollment</Label>
                <Select value={selectedEnrollment?.id || ""} onValueChange={(value) => {
                  const enrollment = enrollments.find((e: any) => e.id === value)
                  setSelectedEnrollment(enrollment)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an enrollment" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((enrollment: any) => (
                      <SelectItem key={enrollment.id} value={enrollment.id}>
                        {enrollment.studentName} - {enrollment.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEnrollment && (
                <>
                  {(() => {
                    const enrollmentPayments = payments.filter(p => p.enrollmentId === selectedEnrollment.id && p.status === "completed")
                    const totalPaid = enrollmentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
                    const remaining = Math.max(0, selectedEnrollment.courseFees - totalPaid)
                    const totalInstallments = selectedEnrollment.selectedInstallments || 1
                    const installmentAmount = selectedEnrollment.courseFees / totalInstallments
                    const completedInstallments = Math.floor(totalPaid / installmentAmount)
                    const nextInstallmentNo = completedInstallments + 1
                    
                    return (
                      <div className="bg-muted p-4 rounded-lg space-y-3 border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Student Name</p>
                            <p className="font-semibold">{selectedEnrollment.studentName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Course Name</p>
                            <p className="font-semibold">{selectedEnrollment.courseName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Course Fees</p>
                            <p className="font-semibold text-lg">{formatCurrency(selectedEnrollment.courseFees)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Installments</p>
                            <p className="font-semibold text-lg">{totalInstallments}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Per Installment Amount</p>
                            <p className="font-semibold text-lg">{formatCurrency(installmentAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completed Installments</p>
                            <p className="font-semibold text-lg text-green-600">{completedInstallments}/{totalInstallments}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Next Installment</p>
                            <p className="font-semibold text-lg text-blue-600">#{nextInstallmentNo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                            <p className="font-semibold text-lg text-green-600">{formatCurrency(totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Remaining Balance</p>
                            <p className={`font-semibold text-lg ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(remaining)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  

                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter payment amount"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Notes</Label>
                    <Input
                      id="paymentNotes"
                      placeholder="Add payment notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddPayment} className="w-full">
                    Record Offline Payment
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
