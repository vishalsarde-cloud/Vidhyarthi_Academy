"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { courses } from "@/lib/data"
import { createAdminEnrollment, getAllAdminEnrollments } from "@/lib/admin-enrollment"
import { addOfflinePayment } from "@/lib/payment-management"
import { CheckCircle2, AlertCircle, Users, CreditCard } from "lucide-react"

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
  const [enrollments, setEnrollments] = useState([])
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

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

      // Create enrollment
      const enrollment = createAdminEnrollment({
        studentId: `STU-${Date.now()}`,
        studentName: values.studentName,
        studentEmail: values.studentEmail,
        studentPhone: values.studentPhone,
        courseId: values.courseId,
        courseName: selectedCourse.title,
        courseFees: selectedCourse.price,
        selectedInstallments: values.selectedInstallments,
        schedule,
        enrollmentStatus: "active",
        enrollmentDate: new Date().toISOString().split("T")[0],
        notes: values.notes,
        createdBy: "admin",
      })

      setSuccessMessage(`Student ${values.studentName} enrolled successfully in ${selectedCourse.title}`)
      setEnrollmentSuccess(true)
      formik.resetForm()

      // Refresh enrollments list
      setTimeout(() => {
        setEnrollments(getAllAdminEnrollments())
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

    const payment = addOfflinePayment({
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

          {/* Enrollments List */}
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.slice(-5).map(enrollment => (
                    <div key={enrollment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{enrollment.studentName}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                          <p className="text-sm text-muted-foreground">${enrollment.courseFees} - {enrollment.selectedInstallments} installments</p>
                        </div>
                        <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">{enrollment.status}</span>
                      </div>
                    </div>
                  ))}
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
              <CardDescription>Add offline payment entries for enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Enrollment */}
              <div className="space-y-2">
                <Label>Select Student Enrollment</Label>
                <Select value={selectedEnrollment?.id || ""} onValueChange={(enrollmentId) => {
                  const enrollment = enrollments.find(e => e.id === enrollmentId)
                  setSelectedEnrollment(enrollment)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an enrollment" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map(enrollment => (
                      <SelectItem key={enrollment.id} value={enrollment.id}>
                        {enrollment.studentName} - {enrollment.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEnrollment && (
                <>
                  {/* Enrollment Details */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p><span className="font-semibold">Student:</span> {selectedEnrollment.studentName}</p>
                    <p><span className="font-semibold">Course:</span> {selectedEnrollment.courseName}</p>
                    <p><span className="font-semibold">Total Fees:</span> ${selectedEnrollment.courseFees}</p>
                    <p><span className="font-semibold">Installments:</span> {selectedEnrollment.selectedInstallments}</p>
                  </div>

                  {/* Payment Entry */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Payment Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentDate">Payment Date</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentData.paymentDate}
                          onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentNotes">Payment Notes</Label>
                      <Input
                        id="paymentNotes"
                        placeholder="Add notes about this payment"
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleAddPayment} className="w-full">
                      Record Offline Payment
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
