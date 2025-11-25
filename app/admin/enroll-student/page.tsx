"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { courses } from "@/lib/data"
import { CheckCircle2, AlertCircle, Users, CreditCard, Trash2 } from "lucide-react"
import {
  getAllEnrollments,
  addEnrollment,
  deleteEnrollment,
  addPayment,
} from "@/lib/enrollment-store"

const validationSchema = Yup.object({
  studentName: Yup.string().required("Student name is required"),
  studentEmail: Yup.string().email("Invalid email").required("Email is required"),
  studentPhone: Yup.string().required("Phone number is required"),
  courseId: Yup.string().required("Course is required"),
  selectedInstallments: Yup.number().min(1, "At least 1 installment required").required("Number of installments is required"),
})

export default function AdminEnrollStudentPage() {
  const [activeTab, setActiveTab] = useState("enroll")
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)

  // Load enrollments on mount
  useEffect(() => {
    setEnrollments(getAllEnrollments())
  }, [])

  const formik = useFormik({
    initialValues: {
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      courseId: "",
      selectedInstallments: 1,
      notes: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const selectedCourse = courses.find(c => c.id === values.courseId)
      if (!selectedCourse) {
        alert("Course not found")
        return
      }

      // Generate payment schedule
      const installmentAmount = Math.floor(selectedCourse.price / values.selectedInstallments)
      const remainder = selectedCourse.price - (installmentAmount * values.selectedInstallments)
      
      const schedule = Array.from({ length: values.selectedInstallments }, (_, i) => ({
        no: i + 1,
        amount: i === values.selectedInstallments - 1 ? installmentAmount + remainder : installmentAmount,
        dueDate: new Date().toISOString().split("T")[0],
        paidAmount: 0,
        paid: false,
        status: "pending",
      }))

      // Create enrollment using global store
      const enrollment = addEnrollment({
        studentId: `STU-${Date.now()}`,
        studentName: values.studentName,
        studentEmail: values.studentEmail,
        studentPhone: values.studentPhone,
        courseId: values.courseId,
        courseName: selectedCourse.title,
        courseFees: selectedCourse.price,
        selectedInstallments: values.selectedInstallments,
        schedule,
        status: "active",
        enrollmentDate: new Date().toISOString().split("T")[0],
        notes: values.notes,
        createdBy: "admin",
      })

      setSuccessMessage(`Student ${values.studentName} enrolled successfully in ${selectedCourse.title}`)
      setEnrollmentSuccess(true)
      formik.resetForm()

      // Refresh enrollments list
      setTimeout(() => {
        setEnrollments(getAllEnrollments())
        setEnrollmentSuccess(false)
      }, 2000)
    },
  })

  const handleAddPayment = () => {
    if (!selectedEnrollment) {
      alert("Please select an enrollment first")
      return
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      alert("Please enter a valid amount")
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

    alert(`Payment of $${paymentData.amount} recorded for ${selectedEnrollment.studentName}`)
    setPaymentData({ amount: 0, paymentDate: new Date().toISOString().split("T")[0], notes: "" })
    setSelectedEnrollment(null)
  }

  const handleDeleteEnrollment = (enrollmentId: string) => {
    deleteEnrollment(enrollmentId)
    setEnrollments(getAllEnrollments())
    if (selectedEnrollment?.id === enrollmentId) {
      setSelectedEnrollment(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Enrollment Management</h1>
        <p className="text-muted-foreground mt-2">Enroll students offline and manage their payment information</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enroll" className="gap-2">
            <Users className="h-4 w-4" />
            Enroll Student
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Manage Payments
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Tab */}
        <TabsContent value="enroll" className="space-y-6">
          {enrollmentSuccess && (
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">{successMessage}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Enroll New Student</CardTitle>
              <CardDescription>Add a new student with complete information and payment schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Student Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name *</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter student name"
                        {...formik.getFieldProps("studentName")}
                        className={formik.errors.studentName && formik.touched.studentName ? "border-destructive" : ""}
                      />
                      {formik.errors.studentName && formik.touched.studentName && (
                        <p className="text-sm text-destructive">{formik.errors.studentName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentEmail">Email Address *</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        placeholder="student@example.com"
                        {...formik.getFieldProps("studentEmail")}
                        className={formik.errors.studentEmail && formik.touched.studentEmail ? "border-destructive" : ""}
                      />
                      {formik.errors.studentEmail && formik.touched.studentEmail && (
                        <p className="text-sm text-destructive">{formik.errors.studentEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentPhone">Phone Number *</Label>
                      <Input
                        id="studentPhone"
                        placeholder="Enter phone number"
                        {...formik.getFieldProps("studentPhone")}
                        className={formik.errors.studentPhone && formik.touched.studentPhone ? "border-destructive" : ""}
                      />
                      {formik.errors.studentPhone && formik.touched.studentPhone && (
                        <p className="text-sm text-destructive">{formik.errors.studentPhone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseId">Select Course *</Label>
                      <Select value={formik.values.courseId} onValueChange={(value) => formik.setFieldValue("courseId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.filter(c => c.active).map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title} - ${course.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formik.errors.courseId && formik.touched.courseId && (
                        <p className="text-sm text-destructive">{formik.errors.courseId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedInstallments">Number of Installments *</Label>
                      <Input
                        id="selectedInstallments"
                        type="number"
                        min="1"
                        max="6"
                        {...formik.getFieldProps("selectedInstallments")}
                        className={formik.errors.selectedInstallments && formik.touched.selectedInstallments ? "border-destructive" : ""}
                      />
                      {formik.errors.selectedInstallments && formik.touched.selectedInstallments && (
                        <p className="text-sm text-destructive">{formik.errors.selectedInstallments}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Admin Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Add any additional notes"
                      {...formik.getFieldProps("notes")}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Enroll Student
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>Last {Math.min(5, enrollments.length)} enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Total Fees</TableHead>
                        <TableHead>Installments</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.slice(-5).reverse().map(enrollment => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                          <TableCell>{enrollment.courseName}</TableCell>
                          <TableCell>${enrollment.courseFees}</TableCell>
                          <TableCell>{enrollment.selectedInstallments}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                              {enrollment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEnrollment(enrollment.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
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
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><strong>Student:</strong> {selectedEnrollment.studentName}</p>
                    <p><strong>Course:</strong> {selectedEnrollment.courseName}</p>
                    <p><strong>Total Fees:</strong> ${selectedEnrollment.courseFees}</p>
                    <p><strong>Installments:</strong> {selectedEnrollment.selectedInstallments}</p>
                  </div>

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
