"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Bell, Shield } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    allowPartialPayments: true,
    autoFillEnabled: true,
    reminderDaysBeforeDue: 3,
    maxOverpayPercent: 5,
    requirePaymentReason: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and policies</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Configure payment behavior and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Partial Payments</Label>
                <p className="text-sm text-muted-foreground">Students can pay less than the full installment amount</p>
              </div>
              <Switch
                checked={settings.allowPartialPayments}
                onCheckedChange={(checked) => setSettings({ ...settings, allowPartialPayments: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-fill Remaining Amount</Label>
                <p className="text-sm text-muted-foreground">Automatically calculate the last installment amount</p>
              </div>
              <Switch
                checked={settings.autoFillEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, autoFillEnabled: checked })}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="maxOverpay">Maximum Overpayment (%)</Label>
              <Input
                id="maxOverpay"
                type="number"
                value={settings.maxOverpayPercent}
                onChange={(e) => setSettings({ ...settings, maxOverpayPercent: Number(e.target.value) })}
                className="max-w-[200px]"
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground">
                Allow overpayment up to this percentage of the installment amount
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure automated notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reminderDays">Payment Reminder (days before due)</Label>
              <Input
                id="reminderDays"
                type="number"
                value={settings.reminderDaysBeforeDue}
                onChange={(e) => setSettings({ ...settings, reminderDaysBeforeDue: Number(e.target.value) })}
                className="max-w-[200px]"
                min={1}
                max={30}
              />
              <p className="text-sm text-muted-foreground">Send payment reminders this many days before the due date</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Policies
            </CardTitle>
            <CardDescription>Configure administrative controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Reason for Schedule Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Admins must provide a reason when modifying payment schedules
                </p>
              </div>
              <Switch
                checked={settings.requirePaymentReason}
                onCheckedChange={(checked) => setSettings({ ...settings, requirePaymentReason: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
