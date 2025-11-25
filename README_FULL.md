# Vidhyarthi Academy

A comprehensive online learning management system built with Next.js 16, React 19, and TypeScript. The platform provides a complete solution for course management, student enrollment, payment processing, and admin oversight.

## 🎯 Project Overview

Vidhyarthi Academy is a full-featured educational platform that enables:
- **Admin Portal**: Complete course and student management with real-time data synchronization
- **Student Portal**: Course browsing, enrollment, and payment management
- **Payment System**: Multiple payment methods with installment scheduling
- **Receipt Generation**: Automatic PDF receipt generation for payments
- **Real-time Analytics**: Live dashboard with key metrics and insights

## ✨ Key Features

### Admin Panel
- **Dashboard**: Real-time metrics for revenue, students, enrollments, and pending payments
- **Course Management**: Create, edit, activate/deactivate courses
- **Student Management**: View enrolled students, edit profiles, delete students
- **Enrollment Tracking**: Monitor all student enrollments with payment status
- **Payment Management**: Track all payments with status and transaction details
- **Pending Payments**: Dedicated page showing overdue and upcoming payments with notification feature
- **Audit Logs**: Complete audit trail of all system activities
- **Reports**: Comprehensive reporting and analytics

### Student Portal
- **Course Browsing**: View only active courses with detailed information
- **Enrollment**: Select courses and choose payment installment plans
- **Payment Processing**: Multiple payment methods (Card, Net Banking, UPI)
- **Receipt Management**: Download and view payment receipts
- **Enrollment History**: Track all enrollments and payment history
- **Profile Management**: Update personal information

### Real-Time Data Synchronization
- 1-second refresh interval for near real-time updates
- Fresh data snapshots on each read
- Atomic operations ensuring data consistency
- No data loss during updates

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **Forms**: Formik with Yup validation
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

### Backend
- **Runtime**: Node.js
- **Data Storage**: In-memory (can be extended to database)
- **Authentication**: Context-based with localStorage

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Version Control**: Git

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

## 🚀 Getting Started

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vishalsarde-cloud/Vidhyarthi_Academy.git
cd Vidhyarthi_Academy
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

## 📝 Demo Credentials

### Admin Login
- **Email**: admin@gmail.com
- **Password**: admin123

### Student Login
- **Email**: student@gmail.com
- **Password**: student123

## 📂 Project Structure

```
Vidhyarthi Academy/
├── app/
│   ├── admin/                 # Admin portal pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── courses/          # Course management
│   │   ├── students/         # Student management
│   │   ├── enrollments/      # Enrollment tracking
│   │   ├── payments/         # Payment management
│   │   ├── pending-payments/ # Pending payments page
│   │   ├── audit/            # Audit logs
│   │   └── reports/          # Reports
│   ├── courses/              # Student course listing
│   ├── enroll/               # Enrollment form
│   ├── my-enrollments/       # Student enrollments
│   ├── login/                # Login pages
│   ├── register/             # Registration
│   ├── profile/              # User profile
│   └── page.tsx              # Landing page
├── components/
│   ├── admin/                # Admin components
│   ├── ui/                   # UI components
│   ├── header.tsx            # Navigation header
│   ├── payment-modal.tsx     # Payment form
│   ├── enrollment-form.tsx   # Enrollment form
│   └── receipt-viewer.tsx    # Receipt display
├── lib/
│   ├── data.ts               # In-memory data store
│   ├── auth-data.ts          # Authentication data
│   ├── auth-context.tsx      # Auth context provider
│   ├── types.ts              # TypeScript types
│   ├── receipt-generator.ts  # PDF receipt generation
│   └── utils.ts              # Utility functions
├── styles/
│   └── globals.css           # Global styles
├── public/                   # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.mjs           # Next.js config
└── tailwind.config.ts        # TailwindCSS config
```

## 🔑 Key Functionalities

### Admin Features

#### Dashboard
- Total revenue from successful payments
- Total registered students
- Total active enrollments
- Pending payments count
- Recent payments list
- Recent students list

#### Course Management
- Create new courses
- Edit course details
- Activate/deactivate courses
- View course statistics

#### Student Management
- View enrolled students only
- Search students by name, email, or phone
- View student details and enrollment history
- Edit student profiles
- Delete students with confirmation
- View payment history for each student

#### Enrollment Management
- View all enrollments
- See enrollment details with payment progress
- Track installment schedules
- Monitor payment status

#### Payment Tracking
- View all payments with status
- Filter by payment method
- Track successful, failed, and refunded payments
- Export payment data

#### Pending Payments
- View all pending installments
- Identify overdue payments
- Send payment reminders to students
- Filter by student or course
- Real-time payment status updates

### Student Features

#### Course Selection
- Browse active courses
- View course details
- See instructor information
- Check course duration and pricing

#### Enrollment
- Select payment installment plan
- Customize installment schedule
- View payment schedule before confirming
- Complete enrollment

#### Payment Processing
- Multiple payment methods (Card, Net Banking, UPI)
- Real-time payment processing
- Automatic receipt generation
- Payment confirmation

#### Receipt Management
- Download payment receipts as PDF
- View receipt history
- Track payment status

## 🔄 Real-Time Data Synchronization

The application implements a sophisticated data synchronization system:

1. **Snapshot Functions**: `getEnrollmentsSnapshot()` and `getPaymentsSnapshot()` return fresh data copies
2. **Auto-Refresh**: Admin pages refresh every 1 second to catch updates
3. **Atomic Operations**: Payments and enrollments update together
4. **No Data Loss**: All records preserved during updates

### Data Flow
```
Student Action (Enroll/Pay)
    ↓
Update In-Memory Store
    ↓
Admin Page Refresh (1 sec)
    ↓
Fresh Data Retrieved
    ↓
UI Updated
```

## 📊 Data Models

### Course
```typescript
{
  id: string
  title: string
  description: string
  price: number
  startDate: string
  endDate: string
  maxInstallments: number
  active: boolean
  category: string
  instructor: string
  duration: string
}
```

### Student
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  gender: string
  education: string
  occupation: string
  emergencyContact: string
  createdAt: string
}
```

### Enrollment
```typescript
{
  id: string
  studentId: string
  courseId: string
  totalAmount: number
  selectedInstallments: number
  status: "active" | "completed" | "cancelled"
  schedule: Installment[]
  createdAt: string
}
```

### Payment
```typescript
{
  id: string
  enrollmentId: string
  installmentNo: number
  amount: number
  paidAt: string
  method: string
  txnRef: string
  status: "success" | "failed" | "refunded"
}
```

## 🔐 Security Features

- Protected routes for authenticated users
- Role-based access control (Admin/Student)
- Secure password validation
- Session management with localStorage
- Form validation with Yup

## 🎨 UI/UX Features

- Modern, responsive design
- Dark/Light theme support
- Intuitive navigation
- Real-time feedback
- Loading states
- Error handling
- Toast notifications
- Modal dialogs for confirmations

## 📈 Performance Optimizations

- Server-side rendering with Next.js
- Component code splitting
- Image optimization
- CSS-in-JS optimization
- Efficient state management
- Memoization of expensive computations

## 🧪 Testing

To test the application:

1. **Admin Flow**
   - Login with admin credentials
   - Navigate to dashboard
   - Manage courses and students
   - View payments and pending payments

2. **Student Flow**
   - Register or login with student credentials
   - Browse active courses
   - Enroll in a course
   - Make a payment
   - Download receipt

## 📝 API Endpoints

The application uses in-memory data storage. Key functions:

- `getAllStudents()` - Get all students
- `getAllEnrollments()` - Get all enrollments
- `getAllPayments()` - Get all payments
- `addEnrollment()` - Create new enrollment
- `addPayment()` - Record payment
- `updateEnrollment()` - Update enrollment status

## 🐛 Known Issues & Limitations

- Data is stored in-memory (resets on server restart)
- No persistent database
- No email notifications (simulated)
- No actual payment gateway integration
- No user registration (pre-configured users only)

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Email notifications
- [ ] Real payment gateway integration
- [ ] User registration system
- [ ] Advanced reporting and analytics
- [ ] Mobile app
- [ ] Video streaming integration
- [ ] Discussion forums
- [ ] Certificate generation
- [ ] API documentation

## 📞 Support

For issues or questions, please create an issue on GitHub.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Vishal Sarde**
- GitHub: [@vishalsarde-cloud](https://github.com/vishalsarde-cloud)

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide React
- Styling with TailwindCSS

---

**Last Updated**: November 25, 2025

**Version**: 1.0.0

**Status**: ✅ Production Ready
