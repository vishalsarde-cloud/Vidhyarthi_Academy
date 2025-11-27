import { NextResponse } from 'next/server'
import { getAllEnrollments, getAllPayments, getAllPaymentsForStudent } from '@/lib/enrollment-store'
import { getPayments } from '@/lib/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required',
        },
        { status: 400 }
      )
    }

    const enrollments = getAllEnrollments()
    const offlinePayments = getAllPayments()
    const onlinePayments = getPayments()

    // Find student enrollments
    const studentEnrollments = enrollments.filter(
      (e: any) => e.studentId === studentId
    )

    if (studentEnrollments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        },
        { status: 404 }
      )
    }

    // Get student info from first enrollment
    const firstEnrollment = studentEnrollments[0]
    const student = {
      id: studentId,
      name: firstEnrollment.studentName,
      email: firstEnrollment.studentEmail,
      phone: firstEnrollment.studentPhone,
      enrollments: studentEnrollments.map((enrollment: any) => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseName: enrollment.courseName,
        courseFees: enrollment.courseFees,
        selectedInstallments: enrollment.selectedInstallments || 1,
        enrollmentDate: enrollment.enrollmentDate,
      })),
      payments: getAllPaymentsForStudent(studentId, enrollments, onlinePayments)
        .map((payment: any) => ({
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
        })),
      statistics: {
        totalEnrollments: studentEnrollments.length,
        totalCourseFees: 0,
        totalPaid: 0,
        totalRemaining: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        paymentBreakdown: [] as any[],
      },
    }

    // Calculate statistics
    const studentPayments = getAllPaymentsForStudent(studentId, enrollments, onlinePayments)

    student.enrollments.forEach((enrollment: any) => {
      student.statistics.totalCourseFees += enrollment.courseFees

      const enrollmentPayments = studentPayments.filter(
        (p: any) => p.enrollmentId === enrollment.id
      )

      const totalPaid = enrollmentPayments.reduce(
        (sum: number, p: any) => sum + p.amount,
        0
      )

      const remaining = Math.max(0, enrollment.courseFees - totalPaid)

      student.statistics.totalPaid += totalPaid
      student.statistics.totalRemaining += remaining

      // Calculate installment progress
      const installmentAmount = enrollment.courseFees / enrollment.selectedInstallments
      const completedInstallments = Math.floor(totalPaid / installmentAmount)
      const currentInstallment = completedInstallments + 1

      student.statistics.paymentBreakdown.push({
        courseId: enrollment.courseId,
        courseName: enrollment.courseName,
        courseFees: enrollment.courseFees,
        totalInstallments: enrollment.selectedInstallments,
        completedInstallments,
        currentInstallment,
        perInstallmentAmount: installmentAmount,
        totalPaid,
        remaining,
        paymentPercentage: Math.round((totalPaid / enrollment.courseFees) * 100),
      })
    })

    student.statistics.completedPayments = studentPayments.filter(
      (p: any) => p.status === 'completed'
    ).length

    student.statistics.pendingPayments = studentPayments.filter(
      (p: any) => p.status === 'pending'
    ).length

    student.statistics.failedPayments = studentPayments.filter(
      (p: any) => p.status === 'failed'
    ).length

    student.statistics.refundedPayments = studentPayments.filter(
      (p: any) => p.status === 'refunded'
    ).length

    return NextResponse.json(
      {
        success: true,
        data: student,
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
        error: 'Failed to fetch student details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
