"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { courses, formatCurrency, formatDate, getAllEnrollments, getAllPayments, getEnrollmentsSnapshot, getPaymentsSnapshot } from "@/lib/data"
import { getAllStudents } from "@/lib/auth-data"

import {
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  BookOpen,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // Refresh data every 1 second to catch updates in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const allStudents = getAllStudents()
  const allEnrollments = getEnrollmentsSnapshot()
  const allPayments = getPaymentsSnapshot()

  // Get only students who have enrollments
  const enrolledStudentIds = new Set(allEnrollments.map((e) => e.studentId))
  const students = allStudents.filter((student) => enrolledStudentIds.has(student.id))

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone?.includes(searchQuery),
  )

  const getStudentStats = (studentId) => {
    const studentEnrollments = allEnrollments.filter((e) => e.studentId === studentId)
    const totalCourses = studentEnrollments.length
    const activeCourses = studentEnrollments.filter((e) => e.status === "active").length
    const completedCourses = studentEnrollments.filter((e) => e.status === "completed").length

    let totalPaid = 0
    let totalDue = 0

    studentEnrollments.forEach((enrollment) => {
      enrollment.schedule.forEach((inst) => {
        totalPaid += inst.paidAmount
        totalDue += inst.amount
      })
    })

    return { totalCourses, activeCourses, completedCourses, totalPaid, totalDue }
  }

  const getStudentPayments = (studentId): Payment[] => {
    const studentEnrollments = allEnrollments.filter((e) => e.studentId === studentId)
    const enrollmentIds = studentEnrollments.map((e) => e.id)
    return allPayments.filter((p) => enrollmentIds.includes(p.enrollmentId))
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteStudent = (student) => {
    // Remove student from all enrollments
    const studentEnrollments = allEnrollments.filter((e) => e.studentId === student.id)
    studentEnrollments.forEach((enrollment) => {
      const index = allEnrollments.indexOf(enrollment)
      if (index > -1) {
        allEnrollments.splice(index, 1)
      }
    })

    // Remove student payments
    const studentPayments = allPayments.filter((p) => {
      const enrollment = allEnrollments.find((e) => e.id === p.enrollmentId)
      return enrollment?.studentId === student.id
    })
    studentPayments.forEach((payment) => {
      const index = allPayments.indexOf(payment)
      if (index > -1) {
        allPayments.splice(index, 1)
      }
    })

    // Trigger refresh
    setRefreshKey((k) => k + 1)
    setStudentToDelete(null)
  }

  const StudentDetailModal = ({ student }: { student: Student }) => {
    const stats = getStudentStats(student.id)
    const studentEnrollments = allEnrollments
      .filter((e) => e.studentId === student.id)
      .map((e) => ({
        ...e,
        course: courses.find((c) => c.id === e.courseId),
      }))
    const studentPayments = getStudentPayments(student.id)

    return (
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
            <DialogTitle>Student Profile</DialogTitle>
            <Link href={`/admin/students/${student.id}`}>
              <Button size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </p>
                  {student.occupation && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4" />
                      {student.occupation}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Member since {formatDate(student.createdAt)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{stats.totalCourses}</p>
                    <p className="text-xs text-muted-foreground">Total Courses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <GraduationCap className="h-6 w-6 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold">{stats.completedCourses}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CreditCard className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Users className="h-6 w-6 mx-auto text-accent-foreground mb-2" />
                    <p className="text-2xl font-bold">{stats.activeCourses}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Personal Details</TabsTrigger>
                  <TabsTrigger value="enrollments">Enrollments ({studentEnrollments.length})</TabsTrigger>
                  <TabsTrigger value="payments">Payments ({studentPayments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{student.phone || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">
                              {student.dateOfBirth ? formatDate(student.dateOfBirth) : "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Education</p>
                            <p className="font-medium">{student.education || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Occupation</p>
                            <p className="font-medium">{student.occupation || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 md:col-span-2">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{student.address || "Not provided"}</p>
                          </div>
                        </div>
                        {student.bio && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground mb-1">Bio</p>
                            <p className="text-sm">{student.bio}</p>
                          </div>
                        )}
                        {student.emergencyContact && (
                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Emergency Contact</p>
                              <p className="font-medium">{student.emergencyContact}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="enrollments" className="space-y-4">
                  {studentEnrollments.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No enrollments found for this student.
                      </CardContent>
                    </Card>
                  ) : (
                    studentEnrollments.map((enrollment) => {
                      const paidAmount = enrollment.schedule.reduce((sum, inst) => sum + inst.paidAmount, 0)
                      const progressPercent = (paidAmount / enrollment.totalAmount) * 100

                      return (
                        <Card key={enrollment.id}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
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
                                <h4 className="font-semibold text-foreground">{enrollment.course?.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Enrolled on {formatDate(enrollment.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-foreground">
                                  {formatCurrency(paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {enrollment.schedule.filter((i) => i.paid).length} of{" "}
                                  {enrollment.selectedInstallments} paid
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                            <div className="mt-4 space-y-2">
                              {enrollment.schedule.map((inst) => (
                                <div
                                  key={inst.no}
                                  className={`flex items-center justify-between p-2 rounded text-sm ${
                                    inst.paid
                                      ? "bg-green-50 text-green-700"
                                      : inst.status === "overdue"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-muted/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {inst.paid ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : inst.status === "overdue" ? (
                                      <AlertCircle className="h-4 w-4" />
                                    ) : (
                                      <Clock className="h-4 w-4" />
                                    )}
                                    <span>Installment {inst.no}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">Due: {formatDate(inst.dueDate)}</span>
                                    <span className="font-medium">{formatCurrency(inst.amount)}</span>
                                    <Badge variant={inst.paid ? "default" : "outline"} className="text-xs">
                                      {inst.paid ? "Paid" : inst.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  {studentPayments.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No payments found for this student.
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {studentPayments.map((payment) => {
                            const enrollment = studentEnrollments.find((e) => e.id === payment.enrollmentId)
                            return (
                              <div
                                key={payment.id}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                  payment.status === "success"
                                    ? "bg-green-50/50 border-green-200"
                                    : "bg-red-50/50 border-red-200"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-full ${
                                      payment.status === "success"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                  >
                                    {payment.status === "success" ? (
                                      <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {enrollment?.course?.title?.substring(0, 30) || "Unknown Course"}...
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Installment #{payment.installmentNo} | {payment.method.toUpperCase()}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-mono">{payment.txnRef}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                                  <p className="text-sm text-muted-foreground">{formatDate(payment.paidAt)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground">View and manage all registered students</p>
      </div>

      {/* Stats Cards - updated with real-time data */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEnrollments.filter((e) => e.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEnrollments.filter((e) => e.status === "completed").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
                <TableHead>Contact</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const stats = getStudentStats(student.id)

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{student.phone || "N/A"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{stats.totalCourses} enrolled</Badge>
                          {stats.activeCourses > 0 && <Badge variant="outline">{stats.activeCourses} active</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(stats.totalPaid)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)} className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${student.id}`} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStudentToDelete(student)}
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStudent && <StudentDetailModal student={selectedStudent} />}

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{studentToDelete?.name}</span>? This will
              remove all their enrollments and payment records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => studentToDelete && handleDeleteStudent(studentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
