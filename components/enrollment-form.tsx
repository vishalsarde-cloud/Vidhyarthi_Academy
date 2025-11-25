"use client"

import { useState, useEffect, useMemo } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { Course, Installment, Enrollment } from "@/lib/types"
import { formatCurrency, formatDate, addEnrollment, getEnrollmentsByStudentId } from "@/lib/data"
import { useAuth } from "@/lib/auth-context"
import { Calendar, AlertCircle, CheckCircle2, Info, Sparkles, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface EnrollmentFormProps {
  course: Course
}

export function EnrollmentForm({ course }: EnrollmentFormProps) {
  const router = useRouter()
  const { user, isAuthenticated, isStudent } = useAuth()
  const [selectedInstallments, setSelectedInstallments] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)

  useEffect(() => {
    if (user && isStudent) {
      const existingEnrollments = getEnrollmentsByStudentId(user.id)
      const enrolled = existingEnrollments.some((e) => e.courseId === course.id)
      setAlreadyEnrolled(enrolled)
    }
  }, [user, course.id, isStudent])

  const generateDefaultSchedule = (count: number): Installment[] => {
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)
    const duration = endDate.getTime() - startDate.getTime()
    const interval = duration / count

    return Array.from({ length: count }, (_, i) => {
      const dueDate = new Date(startDate.getTime() + interval * i)
      if (dueDate < startDate) dueDate.setTime(startDate.getTime())
      if (dueDate > endDate) dueDate.setTime(endDate.getTime())

      const baseAmount = Math.floor(course.price / count)
      const remainder = course.price - baseAmount * count
      const amount = i === count - 1 ? baseAmount + remainder : baseAmount

      return {
        no: i + 1,
        amount,
        dueDate: dueDate.toISOString().split("T")[0],
        paidAmount: 0,
        paid: false,
        status: "pending" as const,
      }
    })
  }

  const [schedule, setSchedule] = useState<Installment[]>(() => generateDefaultSchedule(1))

  useEffect(() => {
    setSchedule(generateDefaultSchedule(selectedInstallments))
  }, [selectedInstallments])

  const totalScheduled = useMemo(() => {
    return schedule.reduce((sum, inst) => sum + (inst.amount || 0), 0)
  }, [schedule])

  const remaining = course.price - totalScheduled

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
  })

  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!isAuthenticated || !isStudent) {
        router.push("/login")
        return
      }

      // Validate schedule
      const invalidDates = schedule.some((inst) => {
        const date = new Date(inst.dueDate)
        return date < new Date(course.startDate) || date > new Date(course.endDate)
      })

      if (invalidDates) {
        alert("All installment dates must be within the course duration")
        return
      }

      if (Math.abs(totalScheduled - course.price) > 0.01) {
        alert("Total installment amounts must equal the course price")
        return
      }

      const newEnrollment: Enrollment = {
        id: `enrollment-${Date.now()}`,
        studentId: user!.id,
        courseId: course.id,
        totalAmount: course.price,
        selectedInstallments: selectedInstallments,
        status: "active",
        schedule: schedule,
        createdAt: new Date().toISOString().split("T")[0],
      }

      addEnrollment(newEnrollment)

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/my-enrollments")
      }, 2000)
    },
  })

  const updateInstallment = (index: number, field: "amount" | "dueDate", value: string | number) => {
    const newSchedule = [...schedule]
    if (field === "amount") {
      newSchedule[index].amount = Number(value) || 0
      // Auto-fill last installment if this is not the last one
      if (index < newSchedule.length - 1) {
        const sumExceptLast = newSchedule.slice(0, -1).reduce((sum, inst) => sum + inst.amount, 0)
        newSchedule[newSchedule.length - 1].amount = Math.max(0, course.price - sumExceptLast)
      }
    } else {
      newSchedule[index].dueDate = value as string
    }
    setSchedule(newSchedule)
  }

  const autoFillRemaining = () => {
    const newSchedule = [...schedule]
    const lastUnpaidIndices: number[] = []

    for (let i = newSchedule.length - 1; i >= 0; i--) {
      if (!newSchedule[i].paid && newSchedule[i].amount === 0) {
        lastUnpaidIndices.unshift(i)
      } else {
        break
      }
    }

    if (lastUnpaidIndices.length > 0) {
      const sumPaidOrFilled = newSchedule
        .filter((_, i) => !lastUnpaidIndices.includes(i))
        .reduce((sum, inst) => sum + inst.amount, 0)

      const remainingAmount = course.price - sumPaidOrFilled
      const splitAmount = Math.floor(remainingAmount / lastUnpaidIndices.length)
      const lastRemainder = remainingAmount - splitAmount * lastUnpaidIndices.length

      lastUnpaidIndices.forEach((idx, i) => {
        newSchedule[idx].amount = i === lastUnpaidIndices.length - 1 ? splitAmount + lastRemainder : splitAmount
      })
    }

    setSchedule(newSchedule)
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <LogIn className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
          <p className="text-muted-foreground">Please login or create an account to enroll in this course.</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (alreadyEnrolled) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Already Enrolled</h2>
          <p className="text-muted-foreground">
            You are already enrolled in this course. View your enrollment details in My Enrollments.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/my-enrollments">
              <Button>View My Enrollments</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline">Browse Other Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Enrollment Successful!</h2>
          <p className="text-muted-foreground">
            You have been enrolled in {course.title}. Redirecting to your enrollments...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Your account details will be used for this enrollment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...formik.getFieldProps("name")}
                placeholder="John Doe"
                className={formik.errors.name && formik.touched.name ? "border-destructive" : ""}
                readOnly={!!user?.name}
              />
              {formik.errors.name && formik.touched.name && (
                <p className="text-sm text-destructive">{formik.errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                placeholder="john@example.com"
                className={formik.errors.email && formik.touched.email ? "border-destructive" : ""}
                readOnly={!!user?.email}
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-sm text-destructive">{formik.errors.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...formik.getFieldProps("phone")}
              placeholder="+1 234 567 8900"
              className={formik.errors.phone && formik.touched.phone ? "border-destructive" : ""}
              readOnly={!!user?.phone}
            />
            {formik.errors.phone && formik.touched.phone && (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Choose how many installments and customize your payment dates</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {formatCurrency(course.price)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label>Number of Installments</Label>
              <Select
                value={String(selectedInstallments)}
                onValueChange={(value) => setSelectedInstallments(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: course.maxInstallments }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1} {i === 0 ? "Payment" : "Installments"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={autoFillRemaining} className="gap-2 mt-6 bg-transparent">
              <Sparkles className="h-4 w-4" />
              Auto-fill Remaining
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Course duration: {formatDate(course.startDate)} to {formatDate(course.endDate)}. All payment dates must
              fall within this period.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {schedule.map((installment, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {installment.no}
                </div>
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={installment.amount || ""}
                        onChange={(e) => updateInstallment(index, "amount", e.target.value)}
                        className="pl-7"
                        placeholder="0.00"
                        min={0}
                        max={course.price}
                        readOnly={index === schedule.length - 1 && schedule.length > 1}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={installment.dueDate}
                        onChange={(e) => updateInstallment(index, "dueDate", e.target.value)}
                        className="pl-10"
                        min={course.startDate}
                        max={course.endDate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <span className="font-medium">Total Scheduled</span>
            <div className="text-right">
              <span className={`text-xl font-bold ${Math.abs(remaining) < 0.01 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(totalScheduled)}
              </span>
              {Math.abs(remaining) >= 0.01 && (
                <p className="text-sm text-destructive">
                  {remaining > 0
                    ? `${formatCurrency(remaining)} remaining`
                    : `${formatCurrency(Math.abs(remaining))} over`}
                </p>
              )}
            </div>
          </div>

          {Math.abs(remaining) >= 0.01 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The total installment amounts must equal the course price ({formatCurrency(course.price)}).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting || Math.abs(remaining) >= 0.01} className="min-w-[140px]">
          Complete Enrollment
        </Button>
      </div>
    </form>
  )
}
