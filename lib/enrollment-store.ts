// Global enrollment and payment store that persists across all pages

export interface EnrolledStudent {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  courseId: string
  courseName: string
  courseFees: number
  selectedInstallments: number
  schedule: any[]
  status: string
  enrollmentDate: string
  notes: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OfflinePayment {
  id: string
  receiptId: string
  studentId: string
  studentName: string
  enrollmentId: string
  courseId: string
  courseName: string
  courseFees: number
  amount: number
  installmentNo: number
  paymentDate: string
  paymentMethod: string
  status: string
  notes: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Load from localStorage or use default
function loadEnrollmentsFromStorage(): EnrolledStudent[] {
  if (typeof window === "undefined") {
    return []
  }
  
  try {
    const stored = localStorage.getItem("vidhyarthi_enrollments")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Failed to load enrollments from storage:", e)
  }
  
  return []
}

function loadPaymentsFromStorage(): OfflinePayment[] {
  if (typeof window === "undefined") {
    return []
  }
  
  try {
    const stored = localStorage.getItem("vidhyarthi_payments")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Failed to load payments from storage:", e)
  }
  
  return []
}

function saveEnrollmentsToStorage() {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("vidhyarthi_enrollments", JSON.stringify(enrolledStudentsStore))
  } catch (e) {
    console.error("Failed to save enrollments to storage:", e)
  }
}

function savePaymentsToStorage() {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("vidhyarthi_payments", JSON.stringify(offlinePaymentsStore))
  } catch (e) {
    console.error("Failed to save payments to storage:", e)
  }
}

// Global storage
let enrolledStudentsStore: EnrolledStudent[] = loadEnrollmentsFromStorage()
let offlinePaymentsStore: OfflinePayment[] = loadPaymentsFromStorage()

// Enrollment functions
export function addEnrollment(enrollment: Omit<EnrolledStudent, 'id' | 'createdAt' | 'updatedAt'>) {
  const newEnrollment: EnrolledStudent = {
    id: `ENROLL-${Date.now()}`,
    ...enrollment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  enrolledStudentsStore.push(newEnrollment)
  saveEnrollmentsToStorage()
  return newEnrollment
}

export function updateEnrollment(enrollmentId: string, updates: Partial<EnrolledStudent>) {
  const index = enrolledStudentsStore.findIndex(e => e.id === enrollmentId)
  if (index !== -1) {
    enrolledStudentsStore[index] = {
      ...enrolledStudentsStore[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveEnrollmentsToStorage()
    return enrolledStudentsStore[index]
  }
  return null
}

export function deleteEnrollment(enrollmentId: string) {
  enrolledStudentsStore = enrolledStudentsStore.filter(e => e.id !== enrollmentId)
  // Also delete related payments
  offlinePaymentsStore = offlinePaymentsStore.filter(p => p.enrollmentId !== enrollmentId)
  saveEnrollmentsToStorage()
  savePaymentsToStorage()
}

export function getAllEnrollments(): EnrolledStudent[] {
  return [...enrolledStudentsStore]
}

export function getEnrollmentsByStudentId(studentId: string): EnrolledStudent[] {
  return enrolledStudentsStore.filter(e => e.studentId === studentId)
}

export function getEnrollmentById(enrollmentId: string): EnrolledStudent | undefined {
  return enrolledStudentsStore.find(e => e.id === enrollmentId)
}

export function getUniqueEnrolledStudents() {
  const uniqueStudents = new Map()
  enrolledStudentsStore.forEach(enrollment => {
    if (!uniqueStudents.has(enrollment.studentId)) {
      uniqueStudents.set(enrollment.studentId, {
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        studentEmail: enrollment.studentEmail,
        studentPhone: enrollment.studentPhone,
        enrollments: [],
      })
    }
    uniqueStudents.get(enrollment.studentId).enrollments.push(enrollment)
  })
  return Array.from(uniqueStudents.values())
}

// Payment functions
export function addPayment(payment: Omit<OfflinePayment, 'id' | 'receiptId' | 'createdAt' | 'updatedAt'>) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const receiptId = `RCP-${timestamp}-${random}`
  
  const newPayment: OfflinePayment = {
    id: `PAY-${timestamp}`,
    receiptId,
    ...payment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  offlinePaymentsStore.push(newPayment)
  savePaymentsToStorage()
  return newPayment
}

export function updatePayment(paymentId: string, updates: Partial<OfflinePayment>) {
  const index = offlinePaymentsStore.findIndex(p => p.id === paymentId)
  if (index !== -1) {
    offlinePaymentsStore[index] = {
      ...offlinePaymentsStore[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    savePaymentsToStorage()
    return offlinePaymentsStore[index]
  }
  return null
}

export function deletePayment(paymentId: string) {
  offlinePaymentsStore = offlinePaymentsStore.filter(p => p.id !== paymentId)
  savePaymentsToStorage()
}

export function getAllPayments(): OfflinePayment[] {
  return [...offlinePaymentsStore]
}

export function getPaymentsByStudentId(studentId: string): OfflinePayment[] {
  return offlinePaymentsStore.filter(p => p.studentId === studentId)
}

export function getPaymentsByEnrollmentId(enrollmentId: string): OfflinePayment[] {
  return offlinePaymentsStore.filter(p => p.enrollmentId === enrollmentId)
}

export function getPaymentStatistics() {
  const total = offlinePaymentsStore.length
  const completed = offlinePaymentsStore.filter(p => p.status === "completed").length
  const pending = offlinePaymentsStore.filter(p => p.status === "pending").length
  const failed = offlinePaymentsStore.filter(p => p.status === "failed").length
  const refunded = offlinePaymentsStore.filter(p => p.status === "refunded").length
  const totalAmount = offlinePaymentsStore
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  return { total, completed, pending, failed, refunded, totalAmount }
}

export function getPaymentSummaryForEnrollment(enrollmentId: string, totalFees: number, totalInstallments: number) {
  const payments = getPaymentsByEnrollmentId(enrollmentId)
  const totalPaid = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  const remainingFee = Math.max(0, totalFees - totalPaid)
  const paidInstallments = payments.filter(p => p.status === "completed").length
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments)
  const isComplete = remainingFee === 0

  return {
    totalFees,
    totalPaid,
    remainingFee,
    totalInstallments,
    paidInstallments,
    remainingInstallments,
    isComplete,
    paymentStatus: isComplete ? "Complete" : `${remainingInstallments} remaining`,
    percentagePaid: Math.round((totalPaid / totalFees) * 100),
  }
}

export function searchEnrollments(query: string): EnrolledStudent[] {
  const lowerQuery = query.toLowerCase()
  return enrolledStudentsStore.filter(e =>
    e.studentName.toLowerCase().includes(lowerQuery) ||
    e.studentEmail.toLowerCase().includes(lowerQuery) ||
    e.studentId.includes(lowerQuery) ||
    e.courseName.toLowerCase().includes(lowerQuery)
  )
}

export function searchPayments(query: string): OfflinePayment[] {
  const lowerQuery = query.toLowerCase()
  return offlinePaymentsStore.filter(p =>
    p.studentName.toLowerCase().includes(lowerQuery) ||
    p.courseName.toLowerCase().includes(lowerQuery) ||
    p.studentId.includes(lowerQuery)
  )
}

export function clearAllData() {
  enrolledStudentsStore = []
  offlinePaymentsStore = []
}

// Convert online payment from data.ts Payment format to OfflinePayment format
export function convertOnlinePaymentToOfflineFormat(payment: any, enrollment: EnrolledStudent): OfflinePayment {
  return {
    id: payment.id,
    receiptId: payment.receiptId || `RCP-${payment.id}`,
    studentId: enrollment.studentId,
    studentName: enrollment.studentName,
    enrollmentId: payment.enrollmentId,
    courseId: enrollment.courseId,
    courseName: enrollment.courseName,
    courseFees: enrollment.courseFees,
    amount: payment.amount,
    installmentNo: payment.installmentNo,
    paymentDate: payment.paidAt,
    paymentMethod: payment.method || "online",
    status: payment.status === "success" ? "completed" : payment.status,
    notes: "",
    createdAt: payment.paidAt,
    updatedAt: payment.paidAt,
    createdBy: "student",
  }
}

// Get all payments for a student (both online and offline)
export function getAllPaymentsForStudent(studentId: string, enrollments: EnrolledStudent[], onlinePayments: any[] = []): OfflinePayment[] {
  const offlinePayments = offlinePaymentsStore.filter(p => p.studentId === studentId)
  
  // Convert online payments to offline format
  const convertedOnlinePayments = onlinePayments
    .filter(p => {
      const enrollment = enrollments.find(e => e.id === p.enrollmentId)
      return enrollment && enrollment.studentId === studentId
    })
    .map(p => {
      const enrollment = enrollments.find(e => e.id === p.enrollmentId)!
      return convertOnlinePaymentToOfflineFormat(p, enrollment)
    })
  
  // Combine and sort by date
  return [...offlinePayments, ...convertedOnlinePayments].sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )
}
