"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PaymentModal } from "@/components/payment-modal"
import { ReceiptViewer } from "@/components/receipt-viewer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import {
  courses,
  formatCurrency,
  formatDate,
  getEnrollmentsByStudentId,
  getPaymentsByEnrollmentId,
  addPayment,
  updateEnrollment,
} from "@/lib/data"
import { getAllStudents } from "@/lib/auth-data"

import Link from "next/link"
import { Calendar, CreditCard, CheckCircle2, Clock, AlertCircle, Receipt, BookOpen } from "lucide-react"

export default function MyEnrollmentsPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedInstallment, setSelectedInstallment] = useState<{
    installment: Installment
    enrollment: Enrollment
  } | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null)

  useEffect(() => {
    if (user) {
      const userEnrollments = getEnrollmentsByStudentId(user.id)
      setEnrollments(userEnrollments)

      // Get all payments for user's enrollments
      const userPayments: Payment[] = []
      userEnrollments.forEach((enrollment) => {
        userPayments.push(...getPaymentsByEnrollmentId(enrollment.id))
      })
      setPayments(userPayments)
    }
  }, [user])

  const getStudentData = ()=> {
    const students = getAllStudents()
    const student = students.find((s) => s.email === user?.email)
    return (
      student || {
        id: user?.id || "",
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        createdAt: user?.createdAt || new Date().toISOString(),
      }
    )
  }

  const enrichedEnrollments = enrollments.map((enrollment) => ({
    ...enrollment,
    course: courses.find((c) => c.id === enrollment.courseId),
    student: getStudentData(),
  }))

  const handlePaymentSuccess = (paymentId) => {
    if (!selectedInstallment) return

    const { enrollment, installment } = selectedInstallment
    const course = courses.find((c) => c.id === enrollment.courseId)

    // Create new payment record
    const newPayment= {
      id: paymentId,
      enrollmentId: enrollment.id,
      installmentNo: installment.no,
      amount: installment.amount - installment.paidAmount,
      paidAt: new Date().toISOString(),
      method: "card",
      txnRef: paymentId,
      status: "success",
    }

    // Add to global payments
    addPayment(newPayment)

    // Update local state
    setPayments((prev) => [...prev, newPayment])

    // Update enrollment schedule
    const updatedSchedule = enrollment.schedule.map((inst) => {
      if (inst.no === installment.no) {
        return {
          ...inst,
          paidAmount: inst.amount,
          paid: true,
          status: "paid",
        }
      }
      return inst
    })

    const allPaid = updatedSchedule.every((inst) => inst.paid)

    // Update global enrollments
    updateEnrollment(enrollment.id, {
      schedule: updatedSchedule,
      status: allPaid ? "completed" : enrollment.status,
    })

    // Update local state
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollment.id) {
          return {
            ...e,
            schedule: updatedSchedule,
            status: allPaid ? "completed" : e.status,
          }
        }
        return e
      }),
    )

    setSelectedInstallment(null)
  }

  const getPaymentForInstallment = (enrollmentId, installmentNo) => {
    return payments.find(
      (p) => p.enrollmentId === enrollmentId && p.installmentNo === installmentNo && p.status === "success",
    )
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Enrollments</h1>
            <p className="mt-2 text-muted-foreground">Track your courses and manage payment schedules</p>
          </div>

          {enrichedEnrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Enrollments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet. Start your learning journey today!
                </p>
                <Link href="/courses">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {enrichedEnrollments.map((enrollment) => {
                const paidAmount = enrollment.schedule.reduce((sum, inst) => sum + inst.paidAmount, 0)
                const progressPercent = (paidAmount / enrollment.totalAmount) * 100
                const nextInstallment = enrollment.schedule.find((inst) => !inst.paid)

                return (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
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
                            {enrollment.course && <Badge variant="outline">{enrollment.course.category}</Badge>}
                          </div>
                          <CardTitle className="text-xl">{enrollment.course?.title || "Unknown Course"}</CardTitle>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(paidAmount)}
                            <span className="text-muted-foreground text-base font-normal">
                              {" "}
                              / {formatCurrency(enrollment.totalAmount)}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.schedule.filter((i) => i.paid).length} of {enrollment.selectedInstallments}{" "}
                            installments paid
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payment Progress</span>
                          <span className="font-medium">{Math.round(progressPercent)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>

                      <div className="grid gap-3">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Payment Schedule
                        </h4>
                        <div className="grid gap-2">
                          {enrollment.schedule.map((installment) => {
                            const payment = getPaymentForInstallment(enrollment.id, installment.no)

                            return (
                              <div
                                key={installment.no}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  installment.paid
                                    ? "bg-success/5 border-success/20"
                                    : installment.status === "overdue"
                                      ? "bg-destructive/5 border-destructive/20"
                                      : "bg-muted/30"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {installment.paid ? (
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                  ) : installment.status === "overdue" ? (
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="font-medium text-foreground">Installment {installment.no}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Due: {formatDate(installment.dueDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-semibold text-foreground">
                                      {formatCurrency(installment.amount)}
                                    </p>
                                    {installment.paid && (
                                      <Badge variant="outline" className="text-success border-success/30">
                                        Paid
                                      </Badge>
                                    )}
                                  </div>
                                  {installment.paid && payment && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setSelectedReceipt(payment)}
                                      title="View Receipt"
                                    >
                                      <Receipt className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {nextInstallment && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Next Payment Due</p>
                            <p className="font-medium text-foreground">
                              {formatCurrency(nextInstallment.amount - nextInstallment.paidAmount)} on{" "}
                              {formatDate(nextInstallment.dueDate)}
                            </p>
                          </div>
                          <Button
                            className="gap-2"
                            onClick={() => setSelectedInstallment({ installment: nextInstallment, enrollment })}
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>

        {selectedInstallment && selectedInstallment.enrollment && (
          <PaymentModal
            isOpen={!!selectedInstallment}
            onClose={() => setSelectedInstallment(null)}
            installment={selectedInstallment.installment}
            course={courses.find((c) => c.id === selectedInstallment.enrollment.courseId)!}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {selectedReceipt && (
          <ReceiptViewer
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            payment={selectedReceipt}
            enrollment={enrollments.find((e) => e.id === selectedReceipt.enrollmentId)!}
            course={
              courses.find((c) => c.id === enrollments.find((e) => e.id === selectedReceipt.enrollmentId)?.courseId)!
            }
            student={getStudentData()}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
