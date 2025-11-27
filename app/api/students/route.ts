import { NextResponse } from 'next/server'
import { getAllEnrollments, getAllPayments, getAllPaymentsForStudent } from '@/lib/enrollment-store'
import { getPayments } from '@/lib/data'

export async function GET() {
  try {
    const enrollments = getAllEnrollments()
    const offlinePayments = getAllPayments()
    const onlinePayments = getPayments()

    // Group enrollments by student
    const studentsMap = new Map()

    enrollments.forEach((enrollment: any) => {
      if (!studentsMap.has(enrollment.studentId)) {
        studentsMap.set(enrollment.studentId, {
          id: enrollment.studentId,
          name: enrollment.studentName,
          email: enrollment.studentEmail,
          phone: enrollment.studentPhone,
          enrollments: [],
          payments: [],
          statistics: {
            totalEnrollments: 0,
            totalCourseFees: 0,
            totalPaid: 0,
            totalRemaining: 0,
            completedPayments: 0,
            pendingPayments: 0,
            failedPayments: 0,
            refundedPayments: 0,
          }
        })
      }

      const student = studentsMap.get(enrollment.studentId)
      student.enrollments.push({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseName: enrollment.courseName,
        courseFees: enrollment.courseFees,
        selectedInstallments: enrollment.selectedInstallments || 1,
        enrollmentDate: enrollment.enrollmentDate,
      })
    })

    // Add payments to students (both offline and online)
    const allPayments = [
      ...offlinePayments,
      ...onlinePayments.map((p: any) => {
        const enrollment = enrollments.find(e => e.id === p.enrollmentId)
        if (enrollment) {
          return {
            id: p.id,
            receiptId: p.receiptId || `RCP-${p.id}`,
            studentId: enrollment.studentId,
            studentName: enrollment.studentName,
            enrollmentId: p.enrollmentId,
            courseId: enrollment.courseId,
            courseName: enrollment.courseName,
            courseFees: enrollment.courseFees,
            amount: p.amount,
            installmentNo: p.installmentNo,
            paymentDate: p.paidAt,
            paymentMethod: p.method || "online",
            status: p.status === "success" ? "completed" : p.status,
            notes: "",
            createdAt: p.paidAt,
            updatedAt: p.paidAt,
            createdBy: "student",
          }
        }
        return null
      }).filter(Boolean)
    ]
    
    allPayments.forEach((payment: any) => {
      if (studentsMap.has(payment.studentId)) {
        const student = studentsMap.get(payment.studentId)
        student.payments.push({
          id: payment.id,
          enrollmentId: payment.enrollmentId,
          courseId: payment.courseId,
          courseName: payment.courseName,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          notes: payment.notes,
          receiptId: payment.receiptId,
          createdAt: payment.createdAt,
        })
      }
    })

    // Calculate statistics for each student
    studentsMap.forEach((student: any) => {
      student.statistics.totalEnrollments = student.enrollments.length

      student.enrollments.forEach((enrollment: any) => {
        student.statistics.totalCourseFees += enrollment.courseFees

        const enrollmentPayments = student.payments.filter(
          (p: any) => p.enrollmentId === enrollment.id
        )

        const totalPaid = enrollmentPayments.reduce(
          (sum: number, p: any) => sum + p.amount,
          0
        )

        student.statistics.totalPaid += totalPaid
        student.statistics.totalRemaining += Math.max(0, enrollment.courseFees - totalPaid)
      })

      student.statistics.completedPayments = student.payments.filter(
        (p: any) => p.status === 'completed'
      ).length

      student.statistics.pendingPayments = student.payments.filter(
        (p: any) => p.status === 'pending'
      ).length

      student.statistics.failedPayments = student.payments.filter(
        (p: any) => p.status === 'failed'
      ).length

      student.statistics.refundedPayments = student.payments.filter(
        (p: any) => p.status === 'refunded'
      ).length
    })

    // Convert map to array
    const students = Array.from(studentsMap.values())

    return NextResponse.json(
      {
        success: true,
        count: students.length,
        data: students,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch students',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
