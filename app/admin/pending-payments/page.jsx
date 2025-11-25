"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { courses, formatCurrency, formatDate, getEnrollmentsSnapshot, getPaymentsSnapshot } from "@/lib/data"
import { getAllStudents } from "@/lib/auth-data"
import { Search, Bell, AlertCircle, CheckCircle2, Mail } from "lucide-react"

export default function AdminPendingPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPending, setSelectedPending] = useState<any>(null)
  const [notificationSent, setNotificationSent] = useState<string | null>(null)

  const students = getAllStudents()
  const enrollments = getEnrollmentsSnapshot()

  // Get all pending installments
  const pendingPayments = enrollments
    .flatMap((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId)
      const student = students.find((s) => s.id === enrollment.studentId)

      return enrollment.schedule
        .filter((inst) => !inst.paid)
        .map((inst) => ({
          id: `${enrollment.id}-${inst.no}`,
          enrollmentId: enrollment.id,
          installmentNo: inst.no,
          amount: inst.amount,
          dueDate: inst.dueDate,
          student,
          course,
          enrollment,
          installment: inst,
        }))
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const filteredPending = pendingPayments.filter(
    (payment) =>
      payment.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.course?.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const overduePending = filteredPending.filter((p) => new Date(p.dueDate) < new Date())
  const upcomingPending = filteredPending.filter((p) => new Date(p.dueDate) >= new Date())

  const totalPendingAmount = filteredPending.reduce((sum, p) => sum + p.amount, 0)

  const handleSendNotification = (payment) => {
    // Simulate sending notification
    setNotificationSent(payment.id)
    setTimeout(() => setNotificationSent(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Payments</h1>
          <p className="text-muted-foreground">Track and manage all pending student payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10 text-warning">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{filteredPending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overduePending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/10 text-info">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingPending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Due</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Payments Alert */}
      {overduePending.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {overduePending.length} payment{overduePending.length !== 1 ? "s" : ""} are overdue. Please take action to
            collect these payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, email, or course..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No pending payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPending.map((payment) => {
                  const isOverdue = new Date(payment.dueDate) < new Date()
                  const daysUntilDue = Math.ceil(
                    (new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )

                  return (
                    <TableRow key={payment.id} className={isOverdue ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{payment.student?.name}</p>
                          <p className="text-sm text-muted-foreground">{payment.student?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[200px] truncate">{payment.course?.title}</p>
                      </TableCell>
                      <TableCell>#{payment.installmentNo}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(payment.dueDate)}</p>
                          <p className={`text-xs ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                            {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isOverdue ? "destructive" : "secondary"}>
                          {isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleSendNotification(payment)}
                          >
                            <Mail className="h-4 w-4" />
                            Send Reminder
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPending(payment)}
                          >
                            View
                          </Button>
                        </div>
                        {notificationSent === payment.id && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Reminder sent
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPending && (
        <Dialog open={!!selectedPending} onOpenChange={() => setSelectedPending(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>Pending payment information and student details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Student Info */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">Student Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedPending.student?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedPending.student?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedPending.student?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">Course Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium">{selectedPending.course?.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructor</p>
                    <p className="font-medium">{selectedPending.course?.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Installment</p>
                    <p className="font-medium">#{selectedPending.installmentNo}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Amount Due</p>
                    <p className="font-medium">{formatCurrency(selectedPending.amount)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedPending.dueDate)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={new Date(selectedPending.dueDate) < new Date() ? "destructive" : "secondary"}>
                      {new Date(selectedPending.dueDate) < new Date() ? "Overdue" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    handleSendNotification(selectedPending)
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Send Reminder
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedPending(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
