"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { formatCurrency, formatDate } from "@/lib/data"
import { Calendar, Clock, User, CreditCard } from "lucide-react"
import Link from "next/link"

export function CourseCard({ course }) {
  const categoryColors= {
    Development: "bg-primary/10 text-primary",
    "Data Science": "bg-accent/20 text-accent-foreground",
    Design: "bg-chart-3/20 text-chart-3",
    Cloud: "bg-chart-4/20 text-chart-4",
    Mobile: "bg-chart-5/20 text-chart-5",
    Security: "bg-destructive/10 text-destructive",
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={categoryColors[course.category] || "bg-muted text-muted-foreground"}>
            {course.category}
          </Badge>
          <Badge variant="outline" className="font-mono">
            Up to {course.maxInstallments} installments
          </Badge>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(course.startDate)} - {formatDate(course.endDate)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 pt-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(course.price)}</p>
          <p className="text-xs text-muted-foreground">
            From {formatCurrency(course.price / course.maxInstallments)}/mo
          </p>
        </div>
        <Link href={`/enroll/${course.id}`}>
          <Button className="gap-2">
            <CreditCard className="h-4 w-4" />
            Enroll Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
