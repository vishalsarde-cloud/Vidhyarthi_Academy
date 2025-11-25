"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Edit2, Trash2, Plus } from "lucide-react"
import {
  getAllEnrollments,
  getAllPayments,
  getUniqueEnrolledStudents,
  addPayment,
  updatePayment,
  deletePayment,
  getPaymentSummaryForEnrollment,
} from "@/lib/enrollment-store"

export default function OfflinePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [editData, setEditData] = useState<any>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
    setEnrollments(getAllEnrollments())
    setPayments(getAllPayments())
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Offline Payments Management</h1>
        <p className="text-muted-foreground mt-2">Select a student to manage their payment information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Payments</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-primary">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="search">Search Students</Label>
            <Input
              id="search"
              placeholder="Search by student name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>Click on a student to view and manage their payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.studentId === student.studentId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-foreground">{student.studentName}</p>
                  <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                  <p className="text-sm text-muted-foreground">{student.studentPhone}</p>
                  <p className="text-xs text-primary mt-2">{student.enrollments.length} enrollment(s)</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No students found
              </div>
            )}
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.studentName}</p>
                              <p className="text-xs text-muted-foreground">{payment.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{payment.courseName}</TableCell>
                          <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
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
                                <SelectItem value="refunded">Refunded</SelectItem>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
    </div>
  )
}
