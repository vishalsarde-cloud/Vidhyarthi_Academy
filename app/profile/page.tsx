"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { courses, formatCurrency, formatDate, getEnrollmentsByStudentId } from "@/lib/data"
import { getAllEnrollments } from "@/lib/enrollment-store"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Edit2,
  Save,
  X,
  Linkedin,
  Github,
  BookOpen,
  CreditCard,
  Award,
  Loader2,
} from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    education: user?.education || "",
    occupation: user?.occupation || "",
    linkedIn: user?.linkedIn || "",
    github: user?.github || "",
  })

  const getEnrollments = () => {
    if (!user) return []
    
    // Get self-registered enrollments from data.ts
    const selfRegisteredEnrollments = getEnrollmentsByStudentId(user.id)
    
    // Get admin-enrolled courses from enrollment-store.ts using email matching
    const allAdminEnrollments = getAllEnrollments()
    const adminEnrollmentsByEmail = allAdminEnrollments.filter(e => e.studentEmail === user.email)
    
    // Convert admin enrollments to Enrollment format
    const convertedAdminEnrollments = adminEnrollmentsByEmail.map((adminEnrollment: any) => ({
      id: adminEnrollment.id,
      studentId: adminEnrollment.studentId,
      courseId: adminEnrollment.courseId,
      enrollmentDate: adminEnrollment.enrollmentDate,
      status: adminEnrollment.status,
      schedule: adminEnrollment.schedule || [],
      totalAmount: adminEnrollment.courseFees,
      selectedInstallments: adminEnrollment.selectedInstallments || 1,
      createdAt: adminEnrollment.createdAt || new Date().toISOString(),
    }))
    
    // Combine both types of enrollments
    return [...selfRegisteredEnrollments, ...convertedAdminEnrollments]
  }

  const enrollments = getEnrollments()
  const enrichedEnrollments = enrollments.map((e) => ({
    ...e,
    course: courses.find((c) => c.id === e.courseId),
  }))

  const totalSpent = enrichedEnrollments.reduce((sum, e) => {
    return sum + e.schedule.reduce((s, inst) => s + inst.paidAmount, 0)
  }, 0)

  const completedCourses = enrichedEnrollments.filter((e) => e.status === "completed").length
  const activeCourses = enrichedEnrollments.filter((e) => e.status === "active").length

  const handleSave = async () => {
    const result = await updateProfile(editData)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      education: user?.education || "",
      occupation: user?.occupation || "",
      linkedIn: user?.linkedIn || "",
      github: user?.github || "",
    })
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(user?.name || "U")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                      {user?.occupation && (
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Briefcase className="h-4 w-4" />
                          {user.occupation}
                        </p>
                      )}
                    </div>
                    {!isEditing && (
                      <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {user?.bio && <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{user.bio}</p>}

                  {/* Social Links */}
                  {(user?.linkedIn || user?.github) && (
                    <div className="flex items-center gap-3 mt-4">
                      {user.linkedIn && (
                        <a
                          href={user.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {user.github && (
                        <a
                          href={user.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-primary/10 mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{enrichedEnrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-success/10 mb-2">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-accent/20 mb-2">
                    <GraduationCap className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{activeCourses}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-muted mb-2">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Personal Details</TabsTrigger>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    {isEditing ? "Update your personal details below" : "Your personal and contact information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={editData.address}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="education">Education</Label>
                          <Input
                            id="education"
                            value={editData.education}
                            onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            value={editData.occupation}
                            onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedIn">LinkedIn URL</Label>
                          <Input
                            id="linkedIn"
                            value={editData.linkedIn}
                            onChange={(e) => setEditData({ ...editData, linkedIn: e.target.value })}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github">GitHub URL</Label>
                          <Input
                            id="github"
                            value={editData.github}
                            onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCancel} className="gap-2 bg-transparent">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium text-foreground">{user?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email Address</p>
                            <p className="font-medium text-foreground">{user?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone Number</p>
                            <p className="font-medium text-foreground">{user?.phone || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium text-foreground">
                              {user?.dateOfBirth ? formatDate(user.dateOfBirth) : "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Education</p>
                            <p className="font-medium text-foreground">{user?.education || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Occupation</p>
                            <p className="font-medium text-foreground">{user?.occupation || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium text-foreground">{user?.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <div className="space-y-4">
                {enrichedEnrollments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No courses enrolled yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  enrichedEnrollments.map((enrollment) => {
                    const paidAmount = enrollment.schedule.reduce((sum, inst) => sum + inst.paidAmount, 0)
                    const progressPercent = (paidAmount / enrollment.totalAmount) * 100

                    return (
                      <Card key={enrollment.id}>
                        <CardContent className="pt-6">
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
                              <h3 className="text-lg font-semibold text-foreground">{enrollment.course?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.course?.instructor} - {enrollment.course?.duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.schedule.filter((i) => i.paid).length} of {enrollment.selectedInstallments}{" "}
                                paid
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
