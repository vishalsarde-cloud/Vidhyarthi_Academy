import { NextResponse } from 'next/server'
import { getAllEnrollments, getAllPayments } from '@/lib/enrollment-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    const allEnrollments = getAllEnrollments()
    const allPayments = getAllPayments()

    // Filter enrollments based on query parameters
    let filteredEnrollments = allEnrollments

    if (studentId) {
      filteredEnrollments = filteredEnrollments.filter(
        (e: any) => e.studentId === studentId
      )
    }

    if (courseId) {
      filteredEnrollments = filteredEnrollments.filter(
        (e: any) => e.courseId === courseId
      )
    }

    // Enrich enrollments with payment information
    const enrichedEnrollments = filteredEnrollments.map((enrollment: any) => {
      const enrollmentPayments = allPayments.filter(
        (p: any) => p.enrollmentId === enrollment.id
      )

      const totalPaid = enrollmentPayments.reduce(
        (sum: number, p: any) => sum + p.amount,
        0
      )

      const remaining = Math.max(0, enrollment.courseFees - totalPaid)

      const installmentAmount = enrollment.courseFees / (enrollment.installmentNo || 1)
      const completedInstallments = Math.floor(totalPaid / installmentAmount)
      const currentInstallment = completedInstallments + 1

      return {
        ...enrollment,
        paymentInfo: {
          totalPaid,
          remaining,
          paymentPercentage: Math.round((totalPaid / enrollment.courseFees) * 100),
          installmentAmount,
          completedInstallments,
          currentInstallment,
          totalInstallments: enrollment.installmentNo || 1,
          paymentCount: enrollmentPayments.length,
          paymentsByStatus: {
            completed: enrollmentPayments.filter((p: any) => p.status === 'completed').length,
            pending: enrollmentPayments.filter((p: any) => p.status === 'pending').length,
            failed: enrollmentPayments.filter((p: any) => p.status === 'failed').length,
            refunded: enrollmentPayments.filter((p: any) => p.status === 'refunded').length,
          },
        },
      }
    })

    // Calculate overall statistics
    const statistics = {
      totalEnrollments: filteredEnrollments.length,
      totalCourseFees: enrichedEnrollments.reduce(
        (sum: number, e: any) => sum + e.courseFees,
        0
      ),
      totalPaid: enrichedEnrollments.reduce(
        (sum: number, e: any) => sum + e.paymentInfo.totalPaid,
        0
      ),
      totalRemaining: enrichedEnrollments.reduce(
        (sum: number, e: any) => sum + e.paymentInfo.remaining,
        0
      ),
      averagePaymentPercentage: Math.round(
        enrichedEnrollments.reduce(
          (sum: number, e: any) => sum + e.paymentInfo.paymentPercentage,
          0
        ) / (enrichedEnrollments.length || 1)
      ),
      fullyPaid: enrichedEnrollments.filter(
        (e: any) => e.paymentInfo.remaining === 0
      ).length,
      partiallyPaid: enrichedEnrollments.filter(
        (e: any) => e.paymentInfo.totalPaid > 0 && e.paymentInfo.remaining > 0
      ).length,
      notPaid: enrichedEnrollments.filter(
        (e: any) => e.paymentInfo.totalPaid === 0
      ).length,
    }

    return NextResponse.json(
      {
        success: true,
        count: filteredEnrollments.length,
        statistics,
        data: enrichedEnrollments,
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
        error: 'Failed to fetch enrollments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
