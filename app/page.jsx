import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { courses } from "@/lib/data"
import { CourseCard } from "@/components/course-card"
import Link from "next/link"
import { ArrowRight, GraduationCap, CreditCard, Shield, Clock, Users } from "lucide-react"

const APP_NAME = "Vidhyarthi Academy"

export default function HomePage() {
  const featuredCourses = courses.slice(0, 3)

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              <span>Flexible Payment Plans Available</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              Invest in Your Future with <span className="text-primary">Flexible Payments</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Enroll in world-class courses and split your fees into manageable installments. Learn at your pace, pay at
              your comfort.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" className="gap-2 text-base">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/my-enrollments">
                <Button size="lg" variant="outline" className="text-base bg-transparent">
                  View My Enrollments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose {APP_NAME}?</h2>
            <p className="mt-2 text-muted-foreground">Everything you need for a seamless learning experience</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon,
                title: "Flexible Installments",
                description: "Split your course fees into up to 6 easy installments",
              },
              {
                icon,
                title: "Secure Payments",
                description: "Bank-grade encryption for all your transactions",
              },
              {
                icon,
                title: "Custom Schedules",
                description: "Choose your own payment dates within course duration",
              },
              {
                icon,
                title: "Expert Instructors",
                description: "Learn from industry professionals with real experience",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">Start your journey with our most popular programs</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="hidden sm:flex gap-2 bg-transparent">
                View All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/courses">
              <Button variant="outline" className="gap-2 bg-transparent">
                View All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: "5,000+", label: "Students Enrolled" },
              { value: "50+", label: "Expert Courses" },
              { value: "98%", label: "Completion Rate" },
              { value: "$2M+", label: "In Installments Managed" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold text-sidebar-primary">{stat.value}</p>
                <p className="mt-1 text-sidebar-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ready to Start Learning?</h2>
                <p className="text-muted-foreground max-w-lg">
                  Join thousands of students who have transformed their careers through our courses. Flexible payment
                  plans make it easier than ever.
                </p>
              </div>
              <Link href="/courses">
                <Button size="lg" className="gap-2 whitespace-nowrap">
                  Get Started Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
