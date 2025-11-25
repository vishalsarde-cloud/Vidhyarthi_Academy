import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { enrollments, payments, courses, formatCurrency } from "@/lib/data"
import { Download, TrendingUp, DollarSign, Users, Calendar } from "lucide-react"

export default function AdminReportsPage() {
  const totalRevenue = payments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0)

  const totalOutstanding = enrollments.reduce((sum, enrollment) => {
    const paid = enrollment.schedule.reduce((s, i) => s + i.paidAmount, 0)
    return sum + (enrollment.totalAmount - paid)
  }, 0)

  const overdueInstallments = enrollments.reduce((count, enrollment) => {
    return count + enrollment.schedule.filter((i) => !i.paid && new Date(i.dueDate) < new Date()).length
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Financial overview and analytics</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">Pending collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.filter((e) => e.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Installments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInstallments}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => {
                const courseEnrollments = enrollments.filter((e) => e.courseId === course.id)
                const courseRevenue = courseEnrollments.reduce((sum, enrollment) => {
                  return sum + enrollment.schedule.reduce((s, i) => s + i.paidAmount, 0)
                }, 0)
                const maxRevenue = course.price * 10
                const percentage = (courseRevenue / maxRevenue) * 100

                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{course.title}</p>
                      <span className="text-sm font-semibold">{formatCurrency(courseRevenue)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    {Math.round((totalRevenue / (totalRevenue + totalOutstanding)) * 100)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-warning">
                    {Math.round((totalOutstanding / (totalRevenue + totalOutstanding)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
