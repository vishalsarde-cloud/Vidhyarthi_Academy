import { NextResponse } from 'next/server'

export async function GET() {
  const sampleData = {
    students: [
      {
        id: "STU-1001",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "9876543210",
        enrollments: [
          {
            id: "ENR-1001",
            studentId: "STU-1001",
            studentName: "Rajesh Kumar",
            studentEmail: "rajesh.kumar@example.com",
            studentPhone: "9876543210",
            courseId: "COURSE-101",
            courseName: "Advanced JavaScript",
            courseFees: 15000,
            installmentNo: 3,
            enrollmentDate: "2024-11-01"
          },
          {
            id: "ENR-1002",
            studentId: "STU-1001",
            studentName: "Rajesh Kumar",
            studentEmail: "rajesh.kumar@example.com",
            studentPhone: "9876543210",
            courseId: "COURSE-102",
            courseName: "React Mastery",
            courseFees: 20000,
            installmentNo: 4,
            enrollmentDate: "2024-11-05"
          }
        ]
      },
      {
        id: "STU-1002",
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "9876543211",
        enrollments: [
          {
            id: "ENR-1003",
            studentId: "STU-1002",
            studentName: "Priya Sharma",
            studentEmail: "priya.sharma@example.com",
            studentPhone: "9876543211",
            courseId: "COURSE-103",
            courseName: "Python for Data Science",
            courseFees: 18000,
            installmentNo: 3,
            enrollmentDate: "2024-11-02"
          }
        ]
      },
      {
        id: "STU-1003",
        name: "Amit Patel",
        email: "amit.patel@example.com",
        phone: "9876543212",
        enrollments: [
          {
            id: "ENR-1004",
            studentId: "STU-1003",
            studentName: "Amit Patel",
            studentEmail: "amit.patel@example.com",
            studentPhone: "9876543212",
            courseId: "COURSE-104",
            courseName: "Web Development Bootcamp",
            courseFees: 25000,
            installmentNo: 5,
            enrollmentDate: "2024-11-03"
          },
          {
            id: "ENR-1005",
            studentId: "STU-1003",
            studentName: "Amit Patel",
            studentEmail: "amit.patel@example.com",
            studentPhone: "9876543212",
            courseId: "COURSE-105",
            courseName: "Mobile App Development",
            courseFees: 22000,
            installmentNo: 4,
            enrollmentDate: "2024-11-04"
          }
        ]
      },
      {
        id: "STU-1004",
        name: "Neha Singh",
        email: "neha.singh@example.com",
        phone: "9876543213",
        enrollments: [
          {
            id: "ENR-1006",
            studentId: "STU-1004",
            studentName: "Neha Singh",
            studentEmail: "neha.singh@example.com",
            studentPhone: "9876543213",
            courseId: "COURSE-106",
            courseName: "Cloud Computing with AWS",
            courseFees: 28000,
            installmentNo: 4,
            enrollmentDate: "2024-11-06"
          }
        ]
      }
    ],
    payments: [
      {
        id: "PAY-1001",
        studentId: "STU-1001",
        studentName: "Rajesh Kumar",
        enrollmentId: "ENR-1001",
        courseId: "COURSE-101",
        courseName: "Advanced JavaScript",
        courseFees: 15000,
        amount: 5000,
        paymentDate: "2024-11-10",
        paymentMethod: "Bank Transfer",
        status: "completed",
        notes: "First installment paid",
        receiptId: "REC-001",
        createdAt: "2024-11-10T10:30:00Z"
      },
      {
        id: "PAY-1002",
        studentId: "STU-1001",
        studentName: "Rajesh Kumar",
        enrollmentId: "ENR-1001",
        courseId: "COURSE-101",
        courseName: "Advanced JavaScript",
        courseFees: 15000,
        amount: 5000,
        paymentDate: "2024-11-15",
        paymentMethod: "Credit Card",
        status: "completed",
        notes: "Second installment paid",
        receiptId: "REC-002",
        createdAt: "2024-11-15T14:20:00Z"
      },
      {
        id: "PAY-1003",
        studentId: "STU-1001",
        studentName: "Rajesh Kumar",
        enrollmentId: "ENR-1002",
        courseId: "COURSE-102",
        courseName: "React Mastery",
        courseFees: 20000,
        amount: 5000,
        paymentDate: "2024-11-12",
        paymentMethod: "Bank Transfer",
        status: "completed",
        notes: "First installment paid",
        receiptId: "REC-003",
        createdAt: "2024-11-12T09:15:00Z"
      },
      {
        id: "PAY-1004",
        studentId: "STU-1002",
        studentName: "Priya Sharma",
        enrollmentId: "ENR-1003",
        courseId: "COURSE-103",
        courseName: "Python for Data Science",
        courseFees: 18000,
        amount: 6000,
        paymentDate: "2024-11-11",
        paymentMethod: "UPI",
        status: "completed",
        notes: "First installment paid",
        receiptId: "REC-004",
        createdAt: "2024-11-11T11:45:00Z"
      },
      {
        id: "PAY-1005",
        studentId: "STU-1003",
        studentName: "Amit Patel",
        enrollmentId: "ENR-1004",
        courseId: "COURSE-104",
        courseName: "Web Development Bootcamp",
        courseFees: 25000,
        amount: 5000,
        paymentDate: "2024-11-13",
        paymentMethod: "Bank Transfer",
        status: "completed",
        notes: "First installment paid",
        receiptId: "REC-005",
        createdAt: "2024-11-13T13:30:00Z"
      },
      {
        id: "PAY-1006",
        studentId: "STU-1003",
        studentName: "Amit Patel",
        enrollmentId: "ENR-1004",
        courseId: "COURSE-104",
        courseName: "Web Development Bootcamp",
        courseFees: 25000,
        amount: 5000,
        paymentDate: "2024-11-18",
        paymentMethod: "Credit Card",
        status: "completed",
        notes: "Second installment paid",
        receiptId: "REC-006",
        createdAt: "2024-11-18T15:45:00Z"
      },
      {
        id: "PAY-1007",
        studentId: "STU-1004",
        studentName: "Neha Singh",
        enrollmentId: "ENR-1006",
        courseId: "COURSE-106",
        courseName: "Cloud Computing with AWS",
        courseFees: 28000,
        amount: 7000,
        paymentDate: "2024-11-14",
        paymentMethod: "Bank Transfer",
        status: "completed",
        notes: "First installment paid",
        receiptId: "REC-007",
        createdAt: "2024-11-14T10:00:00Z"
      }
    ]
  }

  return NextResponse.json(sampleData, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
