# 🎓 Vidhyarthi Academy - API Documentation

## Sample Data Endpoint

### Endpoint
```
GET /api/sample-data
```

### Base URL
```
http://localhost:3000
```

### Full URL
```
http://localhost:3000/api/sample-data
```

### Description
This endpoint provides sample student data with enrollments and payment records to help understand and test the full functionality of the Vidhyarthi Academy product.

### Response Format
```json
{
  "students": [...],
  "payments": [...]
}
```

### Sample Data Included

#### Students (4 Sample Students)
1. **Rajesh Kumar** (STU-1001)
   - Email: rajesh.kumar@example.com
   - Phone: 9876543210
   - Enrollments: 2 courses
     - Advanced JavaScript (₹15,000 - 3 installments)
     - React Mastery (₹20,000 - 4 installments)

2. **Priya Sharma** (STU-1002)
   - Email: priya.sharma@example.com
   - Phone: 9876543211
   - Enrollments: 1 course
     - Python for Data Science (₹18,000 - 3 installments)

3. **Amit Patel** (STU-1003)
   - Email: amit.patel@example.com
   - Phone: 9876543212
   - Enrollments: 2 courses
     - Web Development Bootcamp (₹25,000 - 5 installments)
     - Mobile App Development (₹22,000 - 4 installments)

4. **Neha Singh** (STU-1004)
   - Email: neha.singh@example.com
   - Phone: 9876543213
   - Enrollments: 1 course
     - Cloud Computing with AWS (₹28,000 - 4 installments)

#### Payments (7 Sample Payments)
- Multiple payments across different students and courses
- All payments marked as "completed"
- Various payment methods (Bank Transfer, Credit Card, UPI)
- Payment dates between 2024-11-10 to 2024-11-18

### How to Use

#### 1. Fetch Sample Data
```bash
curl http://localhost:3000/api/sample-data
```

#### 2. In JavaScript/React
```javascript
const response = await fetch('/api/sample-data')
const data = await response.json()
console.log(data.students)
console.log(data.payments)
```

#### 3. Load into Application
The sample data can be used to:
- Populate the enrollment store
- Test payment recording functionality
- Verify installment tracking
- Test statistics calculations
- Validate UI with real-world data

### Response Example
```json
{
  "students": [
    {
      "id": "STU-1001",
      "name": "Rajesh Kumar",
      "email": "rajesh.kumar@example.com",
      "phone": "9876543210",
      "enrollments": [
        {
          "id": "ENR-1001",
          "studentId": "STU-1001",
          "studentName": "Rajesh Kumar",
          "studentEmail": "rajesh.kumar@example.com",
          "studentPhone": "9876543210",
          "courseId": "COURSE-101",
          "courseName": "Advanced JavaScript",
          "courseFees": 15000,
          "installmentNo": 3,
          "enrollmentDate": "2024-11-01"
        }
      ]
    }
  ],
  "payments": [
    {
      "id": "PAY-1001",
      "studentId": "STU-1001",
      "studentName": "Rajesh Kumar",
      "enrollmentId": "ENR-1001",
      "courseId": "COURSE-101",
      "courseName": "Advanced JavaScript",
      "courseFees": 15000,
      "amount": 5000,
      "paymentDate": "2024-11-10",
      "paymentMethod": "Bank Transfer",
      "status": "completed",
      "notes": "First installment paid",
      "receiptId": "REC-001",
      "createdAt": "2024-11-10T10:30:00Z"
    }
  ]
}
```

### Data Structure

#### Student Object
```typescript
{
  id: string              // Student ID (e.g., "STU-1001")
  name: string            // Full name
  email: string           // Email address
  phone: string           // Phone number
  enrollments: Enrollment[] // Array of enrollments
}
```

#### Enrollment Object
```typescript
{
  id: string              // Enrollment ID (e.g., "ENR-1001")
  studentId: string       // Reference to student
  studentName: string     // Student name
  studentEmail: string    // Student email
  studentPhone: string    // Student phone
  courseId: string        // Course ID
  courseName: string      // Course name
  courseFees: number      // Total course fees in INR
  installmentNo: number   // Number of installments
  enrollmentDate: string  // Enrollment date (YYYY-MM-DD)
}
```

#### Payment Object
```typescript
{
  id: string              // Payment ID (e.g., "PAY-1001")
  studentId: string       // Student ID
  studentName: string     // Student name
  enrollmentId: string    // Enrollment ID
  courseId: string        // Course ID
  courseName: string      // Course name
  courseFees: number      // Course fees
  amount: number          // Payment amount in INR
  paymentDate: string     // Payment date (YYYY-MM-DD)
  paymentMethod: string   // Payment method
  status: string          // Payment status (completed, pending, failed, refunded)
  notes: string           // Payment notes
  receiptId: string       // Receipt ID
  createdAt: string       // Creation timestamp (ISO 8601)
}
```

### Features Demonstrated

✅ **Student Management**
- Multiple students with different enrollments
- Contact information
- Multiple courses per student

✅ **Enrollment Tracking**
- Course enrollment details
- Installment configuration
- Enrollment dates

✅ **Payment Tracking**
- Multiple payments per enrollment
- Payment status management
- Payment methods
- Receipt generation

✅ **Installment Management**
- Per-installment amount calculation
- Completed vs total installments
- Next installment tracking
- Remaining balance calculation

✅ **Currency**
- All amounts in Indian Rupees (₹)
- Proper formatting

### Testing Scenarios

1. **View Student Details**
   - Navigate to `/admin/offline-payments`
   - Select a student to view their payment details
   - Verify installment tracking

2. **Record Payment**
   - Go to "Record Payment" tab
   - Select an enrollment
   - Verify installment number display
   - Record a payment
   - Check if statistics update

3. **Check Statistics**
   - View completed payments count
   - Verify total collected amount
   - Check payment status breakdown

4. **Test Installment Tracking**
   - View student detail page
   - Check installment progress
   - Verify current installment number
   - Confirm per-installment amounts

### Notes

- All sample data is in-memory and will be reset on application restart
- Sample data is read-only from the API
- To persist data, use the offline payments recording feature
- Currency is in Indian Rupees (₹)
- All dates are in YYYY-MM-DD format
- Timestamps are in ISO 8601 format

### Error Handling

The endpoint always returns HTTP 200 with the sample data. No error cases are defined for this endpoint.

### Rate Limiting

No rate limiting is applied to this endpoint.

### CORS

The endpoint supports CORS and can be called from any origin.

---

## Students API Endpoints

### 1. Get All Students

#### Endpoint
```
GET /api/students
```

#### Full URL
```
http://localhost:3000/api/students
```

#### Description
Fetches all students with their complete information including enrollments, payments, and statistics.

#### Response Format
```json
{
  "success": true,
  "count": 4,
  "data": [...]
}
```

#### Response Example
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "STU-1001",
      "name": "Rajesh Kumar",
      "email": "rajesh.kumar@example.com",
      "phone": "9876543210",
      "enrollments": [
        {
          "id": "ENR-1001",
          "courseId": "COURSE-101",
          "courseName": "Advanced JavaScript",
          "courseFees": 15000,
          "installmentNo": 3,
          "enrollmentDate": "2024-11-01"
        }
      ],
      "payments": [
        {
          "id": "PAY-1001",
          "enrollmentId": "ENR-1001",
          "courseId": "COURSE-101",
          "courseName": "Advanced JavaScript",
          "amount": 5000,
          "paymentDate": "2024-11-10",
          "paymentMethod": "Bank Transfer",
          "status": "completed",
          "notes": "First installment paid",
          "receiptId": "REC-001",
          "createdAt": "2024-11-10T10:30:00Z"
        }
      ],
      "statistics": {
        "totalEnrollments": 1,
        "totalCourseFees": 15000,
        "totalPaid": 5000,
        "totalRemaining": 10000,
        "completedPayments": 1,
        "pendingPayments": 0,
        "failedPayments": 0,
        "refundedPayments": 0
      }
    }
  ]
}
```

#### Usage Examples

**JavaScript/React:**
```javascript
const response = await fetch('/api/students')
const data = await response.json()
console.log(data.data) // Array of all students
```

**cURL:**
```bash
curl http://localhost:3000/api/students
```

---

### 2. Get Student by ID

#### Endpoint
```
GET /api/students/[id]
```

#### Full URL
```
http://localhost:3000/api/students/STU-1001
```

#### Parameters
- `id` (required): Student ID (e.g., "STU-1001")

#### Description
Fetches detailed information for a specific student including all enrollments, payments, and comprehensive statistics.

#### Response Format
```json
{
  "success": true,
  "data": {...}
}
```

#### Response Example
```json
{
  "success": true,
  "data": {
    "id": "STU-1001",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "9876543210",
    "enrollments": [
      {
        "id": "ENR-1001",
        "courseId": "COURSE-101",
        "courseName": "Advanced JavaScript",
        "courseFees": 15000,
        "installmentNo": 3,
        "enrollmentDate": "2024-11-01"
      },
      {
        "id": "ENR-1002",
        "courseId": "COURSE-102",
        "courseName": "React Mastery",
        "courseFees": 20000,
        "installmentNo": 4,
        "enrollmentDate": "2024-11-05"
      }
    ],
    "payments": [
      {
        "id": "PAY-1001",
        "enrollmentId": "ENR-1001",
        "courseId": "COURSE-101",
        "courseName": "Advanced JavaScript",
        "amount": 5000,
        "paymentDate": "2024-11-10",
        "paymentMethod": "Bank Transfer",
        "status": "completed",
        "notes": "First installment paid",
        "receiptId": "REC-001",
        "createdAt": "2024-11-10T10:30:00Z"
      }
    ],
    "statistics": {
      "totalEnrollments": 2,
      "totalCourseFees": 35000,
      "totalPaid": 10000,
      "totalRemaining": 25000,
      "completedPayments": 2,
      "pendingPayments": 0,
      "failedPayments": 0,
      "refundedPayments": 0,
      "paymentBreakdown": [
        {
          "courseId": "COURSE-101",
          "courseName": "Advanced JavaScript",
          "courseFees": 15000,
          "totalInstallments": 3,
          "completedInstallments": 1,
          "currentInstallment": 2,
          "perInstallmentAmount": 5000,
          "totalPaid": 5000,
          "remaining": 10000,
          "paymentPercentage": 33
        },
        {
          "courseId": "COURSE-102",
          "courseName": "React Mastery",
          "courseFees": 20000,
          "totalInstallments": 4,
          "completedInstallments": 1,
          "currentInstallment": 2,
          "perInstallmentAmount": 5000,
          "totalPaid": 5000,
          "remaining": 15000,
          "paymentPercentage": 25
        }
      ]
    }
  }
}
```

#### Usage Examples

**JavaScript/React:**
```javascript
const studentId = 'STU-1001'
const response = await fetch(`/api/students/${studentId}`)
const data = await response.json()
console.log(data.data) // Student details
```

**cURL:**
```bash
curl http://localhost:3000/api/students/STU-1001
```

#### Error Responses

**Student Not Found (404):**
```json
{
  "success": false,
  "error": "Student not found"
}
```

**Missing Student ID (400):**
```json
{
  "success": false,
  "error": "Student ID is required"
}
```

---

## API Response Objects

### Student Object
```typescript
{
  id: string                    // Student ID
  name: string                  // Full name
  email: string                 // Email address
  phone: string                 // Phone number
  enrollments: Enrollment[]     // Array of enrollments
  payments: Payment[]           // Array of payments
  statistics: Statistics        // Aggregated statistics
}
```

### Enrollment Object
```typescript
{
  id: string                    // Enrollment ID
  courseId: string              // Course ID
  courseName: string            // Course name
  courseFees: number            // Total course fees (INR)
  installmentNo: number         // Number of installments
  enrollmentDate: string        // Enrollment date (YYYY-MM-DD)
}
```

### Payment Object
```typescript
{
  id: string                    // Payment ID
  enrollmentId: string          // Enrollment ID
  courseId: string              // Course ID
  courseName: string            // Course name
  amount: number                // Payment amount (INR)
  paymentDate: string           // Payment date (YYYY-MM-DD)
  paymentMethod: string         // Payment method
  status: string                // Payment status
  notes: string                 // Payment notes
  receiptId: string             // Receipt ID
  createdAt: string             // Creation timestamp (ISO 8601)
}
```

### Statistics Object
```typescript
{
  totalEnrollments: number      // Total number of enrollments
  totalCourseFees: number       // Total fees across all courses (INR)
  totalPaid: number             // Total amount paid (INR)
  totalRemaining: number        // Total remaining balance (INR)
  completedPayments: number     // Count of completed payments
  pendingPayments: number       // Count of pending payments
  failedPayments: number        // Count of failed payments
  refundedPayments: number      // Count of refunded payments
  paymentBreakdown?: Array      // Detailed breakdown per course (only in /students/[id])
}
```

### Payment Breakdown Object (in /students/[id] only)
```typescript
{
  courseId: string              // Course ID
  courseName: string            // Course name
  courseFees: number            // Total course fees (INR)
  totalInstallments: number     // Total number of installments
  completedInstallments: number // Number of completed installments
  currentInstallment: number    // Current installment number
  perInstallmentAmount: number  // Amount per installment (INR)
  totalPaid: number             // Total paid for this course (INR)
  remaining: number             // Remaining balance (INR)
  paymentPercentage: number     // Payment completion percentage (0-100)
}
```

---

## API Usage Scenarios

### 1. Dashboard Overview
```javascript
// Get all students for dashboard
const response = await fetch('/api/students')
const { data: students } = await response.json()

// Display student list with statistics
students.forEach(student => {
  console.log(`${student.name}: ₹${student.statistics.totalPaid} paid`)
})
```

### 2. Student Profile Page
```javascript
// Get specific student details
const studentId = 'STU-1001'
const response = await fetch(`/api/students/${studentId}`)
const { data: student } = await response.json()

// Display student info and payment breakdown
console.log(student.statistics.paymentBreakdown)
```

### 3. Payment Tracking
```javascript
// Get student and check payment status
const response = await fetch(`/api/students/STU-1001`)
const { data: student } = await response.json()

// Check if all payments are completed
const allPaid = student.statistics.totalRemaining === 0
console.log(allPaid ? 'Fully Paid' : 'Pending')
```

### 4. Installment Progress
```javascript
// Get installment details for a student
const response = await fetch(`/api/students/STU-1001`)
const { data: student } = await response.json()

// Display installment progress per course
student.statistics.paymentBreakdown.forEach(course => {
  console.log(`${course.courseName}:`)
  console.log(`  Installment ${course.currentInstallment}/${course.totalInstallments}`)
  console.log(`  Progress: ${course.paymentPercentage}%`)
})
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Student data returned |
| 400 | Bad Request | Missing required parameter |
| 404 | Not Found | Student ID doesn't exist |
| 500 | Server Error | Internal server error |

---

## Error Handling

### Example Error Response
```json
{
  "success": false,
  "error": "Failed to fetch student details",
  "message": "Error details here"
}
```

### Handling Errors in JavaScript
```javascript
try {
  const response = await fetch(`/api/students/STU-1001`)
  const data = await response.json()
  
  if (!data.success) {
    console.error(data.error)
    return
  }
  
  console.log(data.data)
} catch (error) {
  console.error('API Error:', error)
}
```

---

## Rate Limiting

No rate limiting is currently applied to these endpoints.

## CORS

All endpoints support CORS and can be called from any origin.

## Authentication

No authentication is required for these endpoints (development mode).

---

---

## Payments API Endpoint

### Get All Payments

#### Endpoint
```
GET /api/payments
```

#### Full URL
```
http://localhost:3000/api/payments
```

#### Query Parameters
- `studentId` (optional): Filter by student ID
- `status` (optional): Filter by payment status (completed, pending, failed, refunded)
- `enrollmentId` (optional): Filter by enrollment ID

#### Examples
```
http://localhost:3000/api/payments
http://localhost:3000/api/payments?studentId=STU-1001
http://localhost:3000/api/payments?status=completed
http://localhost:3000/api/payments?enrollmentId=ENR-1001
```

#### Response
```json
{
  "success": true,
  "count": 7,
  "statistics": {
    "totalPayments": 7,
    "totalAmount": 38000,
    "byStatus": {
      "completed": 7,
      "pending": 0,
      "failed": 0,
      "refunded": 0
    },
    "amountByStatus": {
      "completed": 38000,
      "pending": 0,
      "failed": 0,
      "refunded": 0
    }
  },
  "data": [...]
}
```

#### Usage
```javascript
// Get all payments
const response = await fetch('/api/payments')

// Get payments for specific student
const response = await fetch('/api/payments?studentId=STU-1001')

// Get completed payments only
const response = await fetch('/api/payments?status=completed')
```

---

## Enrollments API Endpoint

### Get All Enrollments

#### Endpoint
```
GET /api/enrollments
```

#### Full URL
```
http://localhost:3000/api/enrollments
```

#### Query Parameters
- `studentId` (optional): Filter by student ID
- `courseId` (optional): Filter by course ID

#### Examples
```
http://localhost:3000/api/enrollments
http://localhost:3000/api/enrollments?studentId=STU-1001
http://localhost:3000/api/enrollments?courseId=COURSE-101
```

#### Response
```json
{
  "success": true,
  "count": 5,
  "statistics": {
    "totalEnrollments": 5,
    "totalCourseFees": 100000,
    "totalPaid": 38000,
    "totalRemaining": 62000,
    "averagePaymentPercentage": 38,
    "fullyPaid": 0,
    "partiallyPaid": 5,
    "notPaid": 0
  },
  "data": [...]
}
```

#### Response Data Example
```json
{
  "id": "ENR-1001",
  "studentId": "STU-1001",
  "studentName": "Rajesh Kumar",
  "courseId": "COURSE-101",
  "courseName": "Advanced JavaScript",
  "courseFees": 15000,
  "installmentNo": 3,
  "enrollmentDate": "2024-11-01",
  "paymentInfo": {
    "totalPaid": 5000,
    "remaining": 10000,
    "paymentPercentage": 33,
    "installmentAmount": 5000,
    "completedInstallments": 1,
    "currentInstallment": 2,
    "totalInstallments": 3,
    "paymentCount": 1,
    "paymentsByStatus": {
      "completed": 1,
      "pending": 0,
      "failed": 0,
      "refunded": 0
    }
  }
}
```

#### Usage
```javascript
// Get all enrollments
const response = await fetch('/api/enrollments')

// Get enrollments for specific student
const response = await fetch('/api/enrollments?studentId=STU-1001')

// Get enrollments for specific course
const response = await fetch('/api/enrollments?courseId=COURSE-101')
```

---

## Statistics/Dashboard API Endpoint

### Get Dashboard Statistics

#### Endpoint
```
GET /api/statistics
```

#### Full URL
```
http://localhost:3000/api/statistics
```

#### Description
Comprehensive statistics for dashboard and reporting purposes.

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 4,
      "totalEnrollments": 5,
      "totalCourses": 6,
      "totalPayments": 7
    },
    "financial": {
      "totalCourseFees": 128000,
      "totalPaid": 38000,
      "totalPending": 0,
      "totalFailed": 0,
      "totalRefunded": 0
    },
    "paymentStatus": {
      "completed": 7,
      "pending": 0,
      "failed": 0,
      "refunded": 0
    },
    "paymentMethods": {
      "bankTransfer": 4,
      "creditCard": 2,
      "upi": 1,
      "other": 0
    },
    "enrollmentStatus": {
      "fullyPaid": 0,
      "partiallyPaid": 5,
      "notPaid": 0
    },
    "collectionRate": 30,
    "topStudents": [
      {
        "studentId": "STU-1001",
        "studentName": "Rajesh Kumar",
        "totalPaid": 10000,
        "paymentCount": 2
      }
    ],
    "topCourses": [
      {
        "courseId": "COURSE-104",
        "courseName": "Web Development Bootcamp",
        "enrollmentCount": 1,
        "totalFees": 25000,
        "totalPaid": 5000,
        "paymentPercentage": 20
      }
    ],
    "generatedAt": "2024-11-27T21:55:00Z"
  }
}
```

#### Usage
```javascript
// Get dashboard statistics
const response = await fetch('/api/statistics')
const { data: stats } = await response.json()

// Display key metrics
console.log(`Total Students: ${stats.overview.totalStudents}`)
console.log(`Collection Rate: ${stats.collectionRate}%`)
console.log(`Total Paid: ₹${stats.financial.totalPaid}`)
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Query Params |
|----------|--------|---------|--------------|
| `/api/sample-data` | GET | Get sample data | None |
| `/api/students` | GET | Get all students | None |
| `/api/students/[id]` | GET | Get student details | None |
| `/api/payments` | GET | Get all payments | studentId, status, enrollmentId |
| `/api/enrollments` | GET | Get all enrollments | studentId, courseId |
| `/api/statistics` | GET | Get dashboard statistics | None |

---

## Complete API Usage Guide

### 1. Dashboard Overview
```javascript
// Get statistics
const statsResponse = await fetch('/api/statistics')
const { data: stats } = await statsResponse.json()

// Get all students
const studentsResponse = await fetch('/api/students')
const { data: students } = await studentsResponse.json()

// Display dashboard
console.log(`Total Students: ${stats.overview.totalStudents}`)
console.log(`Collection Rate: ${stats.collectionRate}%`)
```

### 2. Student Management
```javascript
// Get all students
const response = await fetch('/api/students')
const { data: students } = await response.json()

// Get specific student
const studentResponse = await fetch('/api/students/STU-1001')
const { data: student } = await studentResponse.json()

// Display student with payment breakdown
student.statistics.paymentBreakdown.forEach(course => {
  console.log(`${course.courseName}: ${course.paymentPercentage}% paid`)
})
```

### 3. Payment Tracking
```javascript
// Get all payments
const response = await fetch('/api/payments')
const { statistics } = await response.json()

// Get completed payments
const completedResponse = await fetch('/api/payments?status=completed')
const { data: completedPayments } = await completedResponse.json()

// Get student payments
const studentPaymentsResponse = await fetch('/api/payments?studentId=STU-1001')
const { data: studentPayments } = await studentPaymentsResponse.json()
```

### 4. Enrollment Management
```javascript
// Get all enrollments
const response = await fetch('/api/enrollments')
const { statistics } = await response.json()

// Get student enrollments
const studentEnrollmentsResponse = await fetch('/api/enrollments?studentId=STU-1001')
const { data: enrollments } = await studentEnrollmentsResponse.json()

// Display enrollment progress
enrollments.forEach(enrollment => {
  console.log(`${enrollment.courseName}:`)
  console.log(`  Installment: ${enrollment.paymentInfo.currentInstallment}/${enrollment.paymentInfo.totalInstallments}`)
  console.log(`  Progress: ${enrollment.paymentInfo.paymentPercentage}%`)
})
```

---

## Error Handling Best Practices

```javascript
async function fetchAPI(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.success) {
      console.error('API Error:', data.error)
      return null
    }
    
    return data.data
  } catch (error) {
    console.error('Network Error:', error)
    return null
  }
}

// Usage
const students = await fetchAPI('/api/students')
if (students) {
  console.log(`Fetched ${students.length} students`)
}
```

---

**Last Updated:** November 27, 2025  
**API Version:** 3.0  
**Status:** ✅ Active  
**Total Endpoints:** 6
