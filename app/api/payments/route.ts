import { NextResponse } from 'next/server'
import { getAllPayments, getAllEnrollments } from '@/lib/enrollment-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const enrollmentId = searchParams.get('enrollmentId')

    const allPayments = getAllPayments()
    const enrollments = getAllEnrollments()

    // Filter payments based on query parameters
    let filteredPayments = allPayments

    if (studentId) {
      filteredPayments = filteredPayments.filter(
        (p: any) => p.studentId === studentId
      )
    }

    if (status) {
      filteredPayments = filteredPayments.filter(
        (p: any) => p.status === status
      )
    }

    if (enrollmentId) {
      filteredPayments = filteredPayments.filter(
        (p: any) => p.enrollmentId === enrollmentId
      )
    }

    // Calculate statistics
    const statistics = {
      totalPayments: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
      byStatus: {
        completed: filteredPayments.filter((p: any) => p.status === 'completed').length,
        pending: filteredPayments.filter((p: any) => p.status === 'pending').length,
        failed: filteredPayments.filter((p: any) => p.status === 'failed').length,
        refunded: filteredPayments.filter((p: any) => p.status === 'refunded').length,
      },
      amountByStatus: {
        completed: filteredPayments
          .filter((p: any) => p.status === 'completed')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        pending: filteredPayments
          .filter((p: any) => p.status === 'pending')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        failed: filteredPayments
          .filter((p: any) => p.status === 'failed')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        refunded: filteredPayments
          .filter((p: any) => p.status === 'refunded')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
      },
    }

    // Format payments with enrollment info
    const formattedPayments = filteredPayments.map((payment: any) => {
      const enrollment = enrollments.find(
        (e: any) => e.id === payment.enrollmentId
      )
      return {
        ...payment,
        enrollmentDetails: enrollment || null,
      }
    })

    return NextResponse.json(
      {
        success: true,
        count: filteredPayments.length,
        statistics,
        data: formattedPayments,
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
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
