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
import { GraduationCap, Loader2, Eye, EyeOff, AlertCircle, User, ArrowRight, UserPlus } from "lucide-react"

const APP_NAME = "Vidhyarthi Academy"

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

export default function StudentLoginPage() {
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
        router.push("/courses")
      } else {
        setError(result.error || "Login failed")
      }
    },
  })

  const fillDemoCredentials = () => {
    formik.setValues({
      email: demoCredentials.student.email,
      password: demoCredentials.student.password,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            {/* Updated brand name */}
            <span className="text-2xl font-bold text-foreground">{APP_NAME}</span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>Sign in to access your courses and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {(error || unauthorizedError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {unauthorizedError ? "You need to login as a student to access this page" : error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4">
              <Link href="/register">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <UserPlus className="h-4 w-4" />
                  Create New Account
                </Button>
              </Link>
            </div>

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
                Fill Demo Credentials
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Email: {demoCredentials.student.email} | Password: {demoCredentials.student.password}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Admin user?{" "}
              <Link href="/login/admin" className="text-primary hover:underline font-medium">
                Login to Admin Portal
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
