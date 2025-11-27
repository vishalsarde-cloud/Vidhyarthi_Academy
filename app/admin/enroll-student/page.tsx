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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { courses, formatCurrency } from "@/lib/data"
import { CheckCircle2, AlertCircle, Users, Trash2 } from "lucide-react"
import {
  getAllEnrollments,
  addEnrollment,
  deleteEnrollment,
} from "@/lib/enrollment-store"
import { getStudentByEmail, updateStudentPassword, registerStudent } from "@/lib/auth-data"

const validationSchema = Yup.object({
  studentName: Yup.string().required("Student name is required"),
  studentEmail: Yup.string().email("Invalid email").required("Email is required"),
  studentPhone: Yup.string().required("Phone number is required"),
  courseId: Yup.string().required("Course is required"),
  selectedInstallments: Yup.number().min(1, "At least 1 installment required").required("Number of installments is required"),
  studentPassword: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required for student login"),
})

export default function AdminEnrollStudentPage() {
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [enrollments, setEnrollments] = useState<any[]>([])

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
      studentPassword: "",
      notes: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const selectedCourse = courses.find(c => c.id === values.courseId)
      if (!selectedCourse) {
        alert("Course not found")
        return
      }

      // Check if student already exists
      let existingStudent = getStudentByEmail(values.studentEmail)
      
      if (existingStudent) {
        // Update password if student exists
        updateStudentPassword(values.studentEmail, values.studentPassword)
      } else {
        // Create new student account
        registerStudent({
          name: values.studentName,
          email: values.studentEmail,
          password: values.studentPassword,
          phone: values.studentPhone,
          address: "",
          dateOfBirth: "",
          gender: "other",
          education: "",
          occupation: "",
          emergencyContact: "",
        })
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

  const handleDeleteEnrollment = (enrollmentId: string) => {
    deleteEnrollment(enrollmentId)
    setEnrollments(getAllEnrollments())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Enroll Student</h1>
        <p className="text-muted-foreground mt-2">Add new students with complete information and payment schedule</p>
      </div>

      <div className="space-y-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="studentPassword">Student Password *</Label>
                      <Input
                        id="studentPassword"
                        type="password"
                        placeholder="Set password for student login"
                        {...formik.getFieldProps("studentPassword")}
                        className={formik.errors.studentPassword && formik.touched.studentPassword ? "border-destructive" : ""}
                      />
                      {formik.errors.studentPassword && formik.touched.studentPassword && (
                        <p className="text-sm text-destructive">{formik.errors.studentPassword}</p>
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
                          <TableCell>{formatCurrency(enrollment.courseFees)}</TableCell>
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
      </div>
    </div>
  )
}
