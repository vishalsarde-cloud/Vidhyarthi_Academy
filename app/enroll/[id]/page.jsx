import { Header } from "@/components/header"
import { EnrollmentForm } from "@/components/enrollment-form"
import { courses, formatCurrency, formatDate } from "@/lib/data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, CreditCard } from "lucide-react"

>
}

export default async function EnrollPage({ params }) {
  const { id } = await params
  const course = courses.find((c) => c.id === id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Enroll in Course</h1>
            <p className="mt-2 text-muted-foreground">Complete your enrollment and set up your payment schedule</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EnrollmentForm course={course} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Badge className="w-fit mb-2">{course.category}</Badge>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(course.startDate)} - {formatDate(course.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Course Fee</span>
                      <span className="text-2xl font-bold text-foreground">{formatCurrency(course.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Split into up to {course.maxInstallments} installments
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Flexible Payments</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You can customize your payment amounts and dates. The system will automatically calculate the
                        remaining balance for your final installment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
