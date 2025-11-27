"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { courses as initialCourses, formatCurrency } from "@/lib/data"
import type { Course } from "@/lib/types"
import { Plus, Pencil, Search, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSaveCourse = (courseData: Partial<Course>) => {
    if (editingCourse) {
      setCourses(courses.map((c) => (c.id === editingCourse.id ? { ...c, ...courseData } : c)))
    } else {
      const newCourse: Course = {
        id: String(courses.length + 1),
        title: courseData.title || "",
        description: courseData.description || "",
        price: courseData.price || 0,
        startDate: courseData.startDate || "",
        endDate: courseData.endDate || "",
        maxInstallments: courseData.maxInstallments || 1,
        active: true,
        category: courseData.category || "General",
        instructor: courseData.instructor || "",
        duration: courseData.duration || "",
      }
      setCourses([...courses, newCourse])
    }
    setIsDialogOpen(false)
    setEditingCourse(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingCourse(null)}>
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <CourseForm
              course={editingCourse}
              onSave={handleSaveCourse}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingCourse(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Max Installments</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(course.price)}</TableCell>
                  <TableCell>{course.maxInstallments}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>
                    <Badge variant={course.active ? "default" : "secondary"}>
                      {course.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingCourse(course)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCourses(courses.map((c) => (c.id === course.id ? { ...c, active: !c.active } : c)))
                          }}
                        >
                          {course.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CourseForm({
  course,
  onSave,
  onCancel,
}: {
  course: Course | null
  onSave: (data: Partial<Course>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    price: course?.price || 0,
    startDate: course?.startDate || "",
    endDate: course?.endDate || "",
    maxInstallments: course?.maxInstallments || 3,
    category: course?.category || "",
    instructor: course?.instructor || "",
    duration: course?.duration || "",
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter course title"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter course description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Development"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            placeholder="Instructor name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxInstallments">Max Installments</Label>
          <Input
            id="maxInstallments"
            type="number"
            value={formData.maxInstallments}
            onChange={(e) => setFormData({ ...formData, maxInstallments: Number(e.target.value) })}
            min={1}
            max={12}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 3 months"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>{course ? "Save Changes" : "Create Course"}</Button>
      </div>
    </div>
  )
}
