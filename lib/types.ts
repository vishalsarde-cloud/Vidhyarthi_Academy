export interface Course {
  id: string
  title: string
  description: string
  price: number
  startDate: string
  endDate: string
  maxInstallments: number
  active: boolean
  image?: string
  category: string
  instructor: string
  duration: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  education?: string
  occupation?: string
  emergencyContact?: string
  profileImage?: string
  bio?: string
  skills?: string[]
  linkedIn?: string
  github?: string
  createdAt: string
  password?: string
}

export interface Installment {
  no: number
  amount: number
  dueDate: string
  paidAmount: number
  paid: boolean
  status: "pending" | "overdue" | "paid"
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  course?: Course
  student?: Student
  totalAmount: number
  selectedInstallments: number
  status: "active" | "completed" | "cancelled"
  schedule: Installment[]
  createdAt: string
}

export interface Payment {
  id: string
  enrollmentId: string
  installmentNo: number
  amount: number
  paidAt: string
  method: string
  txnRef: string
  status: "success" | "failed" | "refunded"
  processedBy?: string
  receiptGenerated?: boolean
  receiptId?: string
}

export interface AuditLog {
  id: string
  actorId: string
  actorType: "student" | "admin" | "system"
  action: string
  entity: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  createdAt: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "finance" | "support"
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "student"
  avatar?: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  education?: string
  occupation?: string
  emergencyContact?: string
  bio?: string
  skills?: string[]
  linkedIn?: string
  github?: string
  createdAt?: string
}

export interface Credentials {
  email: string
  password: string
}

export interface RegistrationData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  address: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  education: string
  occupation: string
  emergencyContact: string
  bio?: string
  linkedIn?: string
  github?: string
}
