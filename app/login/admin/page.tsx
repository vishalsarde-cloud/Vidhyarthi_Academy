"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { demoCredentials } from "@/lib/auth-data"
import { GraduationCap, Loader2, Eye, EyeOff, AlertCircle, Shield, ArrowRight } from "lucide-react"

const APP_NAME = "Vidhyarthi Academy"

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const unauthorizedError = searchParams.get("error") === "unauthorized"

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      const result = await login(values.email, values.password)

      if (result.success) {
        const storedUser = localStorage.getItem("windsurf_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.role === "admin") {
            router.push("/admin")
          } else {
            setError("You don't have admin access. Please use student login.")
          }
        }
      } else {
        setError(result.error || "Login failed")
      }
    },
  })

  const fillDemoCredentials = () => {
    formik.setValues({
      email: demoCredentials.admin.email,
      password: demoCredentials.admin.password,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar to-sidebar/90 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            {/* Updated brand name */}
            <span className="text-2xl font-bold text-sidebar-foreground">{APP_NAME}</span>
          </Link>
        </div>

        <Card className="shadow-xl bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to access the administration portal</CardDescription>
          </CardHeader>
          <CardContent>
            {(error || unauthorizedError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {unauthorizedError ? "You need admin privileges to access this page" : error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  {...formik.getFieldProps("email")}
                  className={formik.touched.email && formik.errors.email ? "border-destructive" : ""}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-destructive">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...formik.getFieldProps("password")}
                    className={formik.touched.password && formik.errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-destructive">{formik.errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 bg-transparent"
                onClick={fillDemoCredentials}
              >
                Fill Admin Credentials
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Email: {demoCredentials.admin.email} | Password: {demoCredentials.admin.password}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Student user?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Login to Student Portal
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
