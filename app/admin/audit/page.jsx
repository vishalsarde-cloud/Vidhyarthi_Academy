import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { auditLogs } from "@/lib/data"
import { Search, Activity, CreditCard, GraduationCap } from "lucide-react"

const actionIcons= {
  enrollment_created,
  payment_completed,
  default,
}

const actionColors= {
  enrollment_created: "bg-primary/10 text-primary",
  payment_completed: "bg-success/10 text-success",
  default: "bg-muted text-muted-foreground",
}

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audit logs..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => {
              const Icon = actionIcons[log.action] || actionIcons.default
              const colorClass = actionColors[log.action] || actionColors.default

              return (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">
                        {log.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {log.entity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Actor: {log.actorType} #{log.actorId} • Entity ID: {log.entityId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
