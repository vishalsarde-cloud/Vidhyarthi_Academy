import type { Course, Enrollment, Payment, AuditLog, Student } from "./types"

export const courses: Course[] = [
  {
    id: "1",
    title: "Full-Stack Web Development Bootcamp",
    description:
      "Master modern web development with React, Node.js, and databases. Build real-world projects and deploy to the cloud.",
    price: 25000,
    startDate: "2025-01-15",
    endDate: "2025-06-15",
    maxInstallments: 5,
    active: true,
    category: "Development",
    instructor: "Sarah Johnson",
    duration: "5 months",
  },
  {
    id: "2",
    title: "Data Science & Machine Learning",
    description:
      "Learn Python, statistics, and machine learning algorithms. Work with real datasets and build predictive models.",
    price: 30000,
    startDate: "2025-02-01",
    endDate: "2025-08-01",
    maxInstallments: 6,
    active: true,
    category: "Data Science",
    instructor: "Dr. Michael Chen",
    duration: "6 months",
  },
  {
    id: "3",
    title: "UI/UX Design Masterclass",
    description:
      "Design beautiful interfaces and create seamless user experiences. Master Figma, prototyping, and design systems.",
    price: 18000,
    startDate: "2025-01-20",
    endDate: "2025-04-20",
    maxInstallments: 4,
    active: true,
    category: "Design",
    instructor: "Emily Rodriguez",
    duration: "3 months",
  },
  {
    id: "4",
    title: "Cloud Architecture & DevOps",
    description:
      "Master AWS, Docker, Kubernetes, and CI/CD pipelines. Learn to build scalable and reliable cloud infrastructure.",
    price: 28000,
    startDate: "2025-03-01",
    endDate: "2025-07-01",
    maxInstallments: 5,
    active: true,
    category: "Cloud",
    instructor: "Alex Thompson",
    duration: "4 months",
  },
  {
    id: "5",
    title: "Mobile App Development with React Native",
    description:
      "Build cross-platform mobile apps for iOS and Android. Learn React Native, navigation, and native modules.",
    price: 22000,
    startDate: "2025-02-15",
    endDate: "2025-06-15",
    maxInstallments: 4,
    active: true,
    category: "Mobile",
    instructor: "Jessica Park",
    duration: "4 months",
  },
  {
    id: "6",
    title: "Cybersecurity Fundamentals",
    description: "Learn ethical hacking, network security, and threat detection. Prepare for security certifications.",
    price: 24000,
    startDate: "2025-04-01",
    endDate: "2025-08-01",
    maxInstallments: 4,
    active: true,
    category: "Security",
    instructor: "Robert Williams",
    duration: "4 months",
  },
]

export const students: Student[] = [
  {
    id: "student-001",
    name: "John Doe",
    email: "student@windsurf.com",
    phone: "+1 234 567 8900",
    address: "123 Main St, New York, NY 10001",
    dateOfBirth: "1995-05-15",
    gender: "male",
    education: "Bachelor's in Computer Science",
    occupation: "Software Developer",
    emergencyContact: "+1 234 567 8901",
    bio: "Passionate about learning new technologies.",
    skills: ["JavaScript", "React", "Node.js"],
    createdAt: "2025-01-01",
  },
]

let _enrollments: Enrollment[] = [
  {
    id: "1",
    studentId: "student-001",
    courseId: "1",
    totalAmount: 25000,
    selectedInstallments: 3,
    status: "active",
    schedule: [
      { no: 1, amount: 9000, dueDate: "2025-01-15", paidAmount: 9000, paid: true, status: "paid" },
      { no: 2, amount: 8000, dueDate: "2025-03-15", paidAmount: 0, paid: false, status: "pending" },
      { no: 3, amount: 8000, dueDate: "2025-05-15", paidAmount: 0, paid: false, status: "pending" },
    ],
    createdAt: "2025-01-10",
  },
]

let _payments: Payment[] = [
  {
    id: "1",
    enrollmentId: "1",
    installmentNo: 1,
    amount: 9000,
    paidAt: "2025-01-15",
    method: "online",
    txnRef: "TXN001234",
    status: "success",
  },
]

export function getEnrollments(): Enrollment[] {
  return [..._enrollments]
}

export function getPayments(): Payment[] {
  return [..._payments]
}

// Export as getters to ensure fresh data
export const enrollments = _enrollments
export const payments = _payments

// Add functions to get fresh copies
export function getEnrollmentsSnapshot(): Enrollment[] {
  return [..._enrollments]
}

export function getPaymentsSnapshot(): Payment[] {
  return [..._payments]
}

export const auditLogs: AuditLog[] = [
  {
    id: "1",
    actorId: "1",
    actorType: "student",
    action: "enrollment_created",
    entity: "Enrollment",
    entityId: "1",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "2",
    actorId: "1",
    actorType: "student",
    action: "payment_completed",
    entity: "Payment",
    entityId: "1",
    createdAt: "2025-01-15T14:30:00Z",
  },
]

export function addEnrollment(enrollment: Enrollment) {
  _enrollments = [..._enrollments, enrollment]
}

export function updateEnrollment(id: string, updates: Partial<Enrollment>) {
  _enrollments = _enrollments.map((e) => (e.id === id ? { ...e, ...updates } : e))
}

export function addPayment(payment: Payment) {
  _payments = [..._payments, payment]
}

export function getEnrollmentsByStudentId(studentId: string): Enrollment[] {
  return _enrollments.filter((e) => e.studentId === studentId)
}

export function getPaymentsByEnrollmentId(enrollmentId: string): Payment[] {
  return _payments.filter((p) => p.enrollmentId === enrollmentId)
}

export function getAllPayments(): Payment[] {
  return _payments
}

export function getAllEnrollments(): Enrollment[] {
  return _enrollments
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}
