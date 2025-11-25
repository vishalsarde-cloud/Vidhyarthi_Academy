"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getStudentByEmail } from "@/lib/auth-data"
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"

const APP_NAME = "Vidyarthi Academy"

const validationSchema = Yup.object({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .test("unique", "Email already registered", (value) => !getStudentByEmail(value || "")),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Must contain lowercase letter")
    .matches(/[A-Z]/, "Must contain uppercase letter")
    .matches(/[0-9]/, "Must contain number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  phone: Yup.string()
    .matches(/^[+]?[\d\s-]{10,}$/, "Invalid phone number")
    .required("Phone number is required"),
  address: Yup.string().min(10, "Address must be at least 10 characters").required("Address is required"),
  dateOfBirth: Yup.date()
    .max(new Date(Date.now() - 16 * 365 * 24 * 60 * 60 * 1000), "Must be at least 16 years old")
    .required("Date of birth is required"),
  gender: Yup.string().oneOf(["male", "female", "other"]).required("Gender is required"),
  education: Yup.string().required("Education qualification is required"),
  occupation: Yup.string().required("Occupation is required"),
  emergencyContact: Yup.string()
    .matches(/^[+]?[\d\s-]{10,}$/, "Invalid phone number")
    .required("Emergency contact is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  linkedIn: Yup.string().url("Invalid URL").nullable(),
  github: Yup.string().url("Invalid URL").nullable(),
})

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const { register, isLoading } = useAuth()
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "" as "male" | "female" | "other",
      education: "",
      occupation: "",
      emergencyContact: "",
      bio: "",
      linkedIn: "",
      github: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        address: values.address,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        education: values.education,
        occupation: values.occupation,
        emergencyContact: values.emergencyContact,
        bio: values.bio || undefined,
        linkedIn: values.linkedIn || undefined,
        github: values.github || undefined,
      })

      if (result.success) {
        router.push("/courses")
      } else {
        setError(result.error || "Registration failed")
      }
    },
  })

  const step1Fields = ["name", "email", "password", "confirmPassword"]
  const step2Fields = ["phone", "address", "dateOfBirth", "gender"]
  const step3Fields = ["education", "occupation", "emergencyContact", "bio"]

  const isStep1Valid = step1Fields.every(
    (field) =>
      !formik.errors[field as keyof typeof formik.values] && formik.values[field as keyof typeof formik.values],
  )
  const isStep2Valid = step2Fields.every(
    (field) =>
      !formik.errors[field as keyof typeof formik.values] && formik.values[field as keyof typeof formik.values],
  )

  const handleNextStep = () => {
    step1Fields.forEach((field) => formik.setFieldTouched(field, true))
    if (step === 1 && isStep1Valid) {
      setStep(2)
    } else if (step === 2) {
      step2Fields.forEach((field) => formik.setFieldTouched(field, true))
      if (isStep2Valid) {
        setStep(3)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 py-8">
      <div className="w-full max-w-2xl">
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
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Student Account</CardTitle>
            {/* Updated description */}
            <CardDescription>Fill in your details to get started with {APP_NAME}</CardDescription>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 mx-1 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-2 text-xs text-muted-foreground">
              <span>Account</span>
              <span>Personal</span>
              <span>Additional</span>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Step 1: Account Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...formik.getFieldProps("name")}
                      className={formik.touched.name && formik.errors.name ? "border-destructive" : ""}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-destructive">{formik.errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
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
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...formik.getFieldProps("password")}
                        className={
                          formik.touched.password && formik.errors.password ? "border-destructive pr-10" : "pr-10"
                        }
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...formik.getFieldProps("confirmPassword")}
                        className={
                          formik.touched.confirmPassword && formik.errors.confirmPassword
                            ? "border-destructive pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{formik.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+1 234 567 8900"
                        {...formik.getFieldProps("phone")}
                        className={formik.touched.phone && formik.errors.phone ? "border-destructive" : ""}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="text-sm text-destructive">{formik.errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...formik.getFieldProps("dateOfBirth")}
                        className={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? "border-destructive" : ""}
                      />
                      {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                        <p className="text-sm text-destructive">{formik.errors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formik.values.gender}
                      onValueChange={(value) => formik.setFieldValue("gender", value)}
                    >
                      <SelectTrigger
                        className={formik.touched.gender && formik.errors.gender ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <p className="text-sm text-destructive">{formik.errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
                      {...formik.getFieldProps("address")}
                      className={formik.touched.address && formik.errors.address ? "border-destructive" : ""}
                      rows={3}
                    />
                    {formik.touched.address && formik.errors.address && (
                      <p className="text-sm text-destructive">{formik.errors.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Highest Education *</Label>
                      <Input
                        id="education"
                        placeholder="e.g., Bachelor's in Computer Science"
                        {...formik.getFieldProps("education")}
                        className={formik.touched.education && formik.errors.education ? "border-destructive" : ""}
                      />
                      {formik.touched.education && formik.errors.education && (
                        <p className="text-sm text-destructive">{formik.errors.education}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Current Occupation *</Label>
                      <Input
                        id="occupation"
                        placeholder="e.g., Software Developer"
                        {...formik.getFieldProps("occupation")}
                        className={formik.touched.occupation && formik.errors.occupation ? "border-destructive" : ""}
                      />
                      {formik.touched.occupation && formik.errors.occupation && (
                        <p className="text-sm text-destructive">{formik.errors.occupation}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="+1 234 567 8901"
                      {...formik.getFieldProps("emergencyContact")}
                      className={
                        formik.touched.emergencyContact && formik.errors.emergencyContact ? "border-destructive" : ""
                      }
                    />
                    {formik.touched.emergencyContact && formik.errors.emergencyContact && (
                      <p className="text-sm text-destructive">{formik.errors.emergencyContact}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About You (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself, your goals, and interests..."
                      {...formik.getFieldProps("bio")}
                      className={formik.touched.bio && formik.errors.bio ? "border-destructive" : ""}
                      rows={3}
                    />
                    {formik.touched.bio && formik.errors.bio && (
                      <p className="text-sm text-destructive">{formik.errors.bio}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                      <Input
                        id="linkedIn"
                        placeholder="https://linkedin.com/in/username"
                        {...formik.getFieldProps("linkedIn")}
                        className={formik.touched.linkedIn && formik.errors.linkedIn ? "border-destructive" : ""}
                      />
                      {formik.touched.linkedIn && formik.errors.linkedIn && (
                        <p className="text-sm text-destructive">{formik.errors.linkedIn}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Profile (Optional)</Label>
                      <Input
                        id="github"
                        placeholder="https://github.com/username"
                        {...formik.getFieldProps("github")}
                        className={formik.touched.github && formik.errors.github ? "border-destructive" : ""}
                      />
                      {formik.touched.github && formik.errors.github && (
                        <p className="text-sm text-destructive">{formik.errors.github}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}

                {step < 3 ? (
                  <Button type="button" className="flex-1 gap-2" onClick={handleNextStep}>
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
