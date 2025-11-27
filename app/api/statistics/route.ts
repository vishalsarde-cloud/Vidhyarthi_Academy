import { NextResponse } from 'next/server'
import { getAllEnrollments, getAllPayments, getUniqueEnrolledStudents } from '@/lib/enrollment-store'
import { getPayments } from '@/lib/data'

export async function GET() {
  try {
    const enrollments = getAllEnrollments()
    const offlinePayments = getAllPayments()
    const onlinePayments = getPayments()
    const students = getUniqueEnrolledStudents()

    // Combine offline and online payments
    const payments = [
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

    // Calculate comprehensive statistics
    const statistics = {
      overview: {
        totalStudents: students.length,
        totalEnrollments: enrollments.length,
        totalCourses: new Set(enrollments.map((e: any) => e.courseId)).size,
        totalPayments: payments.length,
      },
      financial: {
        totalCourseFees: enrollments.reduce((sum: number, e: any) => sum + e.courseFees, 0),
        totalPaid: payments
          .filter((p: any) => p.status === 'completed')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        totalPending: payments
          .filter((p: any) => p.status === 'pending')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        totalFailed: payments
          .filter((p: any) => p.status === 'failed')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        totalRefunded: payments
          .filter((p: any) => p.status === 'refunded')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
      },
      paymentStatus: {
        completed: payments.filter((p: any) => p.status === 'completed').length,
        pending: payments.filter((p: any) => p.status === 'pending').length,
        failed: payments.filter((p: any) => p.status === 'failed').length,
        refunded: payments.filter((p: any) => p.status === 'refunded').length,
      },
      paymentMethods: {
        online: payments.filter((p: any) => p.paymentMethod === 'online').length,
        offline: payments.filter((p: any) => p.paymentMethod === 'offline').length,
        bankTransfer: payments.filter((p: any) => p.paymentMethod === 'Bank Transfer').length,
        creditCard: payments.filter((p: any) => p.paymentMethod === 'Credit Card').length,
        upi: payments.filter((p: any) => p.paymentMethod === 'UPI').length,
        other: payments.filter(
          (p: any) =>
            !['online', 'offline', 'Bank Transfer', 'Credit Card', 'UPI'].includes(p.paymentMethod)
        ).length,
      },
      enrollmentStatus: {
        fullyPaid: 0,
        partiallyPaid: 0,
        notPaid: 0,
      },
      topStudents: [] as any[],
      topCourses: [] as any[],
    }

    // Calculate enrollment payment status
    enrollments.forEach((enrollment: any) => {
      const enrollmentPayments = payments.filter(
        (p: any) => p.enrollmentId === enrollment.id && p.status === 'completed'
      )
      const totalPaid = enrollmentPayments.reduce(
        (sum: number, p: any) => sum + p.amount,
        0
      )

      if (totalPaid >= enrollment.courseFees) {
        statistics.enrollmentStatus.fullyPaid++
      } else if (totalPaid > 0) {
        statistics.enrollmentStatus.partiallyPaid++
      } else {
        statistics.enrollmentStatus.notPaid++
      }
    })

    // Calculate top students by amount paid
    const studentPayments = new Map()
    payments.forEach((payment: any) => {
      if (payment.status === 'completed') {
        if (!studentPayments.has(payment.studentId)) {
          studentPayments.set(payment.studentId, {
            studentId: payment.studentId,
            studentName: payment.studentName,
            totalPaid: 0,
            paymentCount: 0,
          })
        }
        const student = studentPayments.get(payment.studentId)
        student.totalPaid += payment.amount
        student.paymentCount += 1
      }
    })

    statistics.topStudents = Array.from(studentPayments.values())
      .sort((a: any, b: any) => b.totalPaid - a.totalPaid)
      .slice(0, 5)

    // Calculate top courses by enrollment
    const courseEnrollments = new Map()
    enrollments.forEach((enrollment: any) => {
      if (!courseEnrollments.has(enrollment.courseId)) {
        courseEnrollments.set(enrollment.courseId, {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          enrollmentCount: 0,
          totalFees: 0,
          totalPaid: 0,
        })
      }
      const course = courseEnrollments.get(enrollment.courseId)
      course.enrollmentCount += 1
      course.totalFees += enrollment.courseFees

      const coursePayments = payments.filter(
        (p: any) => p.courseId === enrollment.courseId && p.status === 'completed'
      )
      course.totalPaid += coursePayments.reduce(
        (sum: number, p: any) => sum + p.amount,
        0
      )
    })

    statistics.topCourses = Array.from(courseEnrollments.values())
      .sort((a: any, b: any) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5)
      .map((course: any) => ({
        ...course,
        paymentPercentage: Math.round((course.totalPaid / course.totalFees) * 100),
      }))

    // Calculate collection rate
    const collectionRate = statistics.financial.totalCourseFees > 0
      ? Math.round((statistics.financial.totalPaid / statistics.financial.totalCourseFees) * 100)
      : 0

    return NextResponse.json(
      {
        success: true,
        data: {
          ...statistics,
          collectionRate,
          generatedAt: new Date().toISOString(),
        },
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
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
