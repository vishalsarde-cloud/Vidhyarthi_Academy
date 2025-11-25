"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { courses, students, formatCurrency, formatDate, getEnrollmentsSnapshot } from "@/lib/data"
import { Search, Eye, CheckCircle2, Clock } from "lucide-react"
import type { Enrollment } from "@/lib/types"

export default function AdminEnrollmentsPage() {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const enrollments = getEnrollmentsSnapshot()
  const enrichedEnrollments = enrollments.map((enrollment) => ({
    ...enrollment,
    course: courses.find((c) => c.id === enrollment.courseId),
    student: students.find((s) => s.id === enrollment.studentId),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Enrollments</h1>
        <p className="text-muted-foreground">Monitor and manage student enrollments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search enrollments..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Installments</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedEnrollments.map((enrollment) => {
                const paidAmount = enrollment.schedule.reduce((sum, i) => sum + i.paidAmount, 0)
                const paidInstallments = enrollment.schedule.filter((i) => i.paid).length

                return (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{enrollment.student?.name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground max-w-[200px] truncate">{enrollment.course?.title}</p>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(enrollment.totalAmount)}</TableCell>
                    <TableCell>{enrollment.selectedInstallments}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(paidAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {paidInstallments}/{enrollment.selectedInstallments} paid
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.status === "completed"
                            ? "default"
                            : enrollment.status === "active"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {enrollment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedEnrollment(enrollment)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedEnrollment && (
        <Dialog open={!!selectedEnrollment} onOpenChange={() => setSelectedEnrollment(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Enrollment Details</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Student Info */}
                <div>
                  <h3 className="font-semibold mb-3">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedEnrollment.student?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedEnrollment.student?.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedEnrollment.student?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge className="mt-1">{selectedEnrollment.status}</Badge>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div>
                  <h3 className="font-semibold mb-3">Course Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Course Title</p>
                      <p className="font-medium">{selectedEnrollment.course?.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedEnrollment.course?.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Instructor</p>
                      <p className="font-medium">{selectedEnrollment.course?.instructor}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-lg">{formatCurrency(selectedEnrollment.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Installments</p>
                      <p className="font-medium text-lg">{selectedEnrollment.selectedInstallments}</p>
                    </div>
                  </div>

                  {/* Installment Schedule */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Installment Schedule</p>
                    {selectedEnrollment.schedule.map((inst) => (
                      <div key={inst.no} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {inst.paid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-600" />
                            )}
                            <span className="font-medium">Installment {inst.no}</span>
                          </div>
                          <Badge variant={inst.paid ? "default" : "outline"}>{inst.paid ? "Paid" : "Pending"}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>Amount</p>
                            <p className="font-medium text-foreground">{formatCurrency(inst.amount)}</p>
                          </div>
                          <div>
                            <p>Due Date</p>
                            <p className="font-medium text-foreground">{formatDate(inst.dueDate)}</p>
                          </div>
                          <div>
                            <p>Paid Amount</p>
                            <p className="font-medium text-foreground">{formatCurrency(inst.paidAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h3 className="font-semibold mb-3">Payment Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {selectedEnrollment.schedule.filter((i) => i.paid).length} of{" "}
                        {selectedEnrollment.selectedInstallments} paid
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (selectedEnrollment.schedule.filter((i) => i.paid).length /
                            selectedEnrollment.selectedInstallments) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedEnrollment.schedule.filter((i) => i.paid).length /
                          selectedEnrollment.selectedInstallments) *
                        100
                      }
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
