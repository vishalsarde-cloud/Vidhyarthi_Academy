"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { CourseCard } from "@/components/course-card"
import { courses } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter only active courses
  const activeCourses = courses.filter((course) => course.active)

  const filteredCourses = useMemo(() => {
    return activeCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">All Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Explore our comprehensive catalog of professional courses ({filteredCourses.length} available)
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "No courses match your search." : "No active courses available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
