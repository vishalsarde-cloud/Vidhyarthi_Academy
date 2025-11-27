# Quick Test Guide - Vidhyarthi Academy

## 🎯 Quick Testing Scenarios

### Scenario 1: Self-Registered Student Flow
**Time: 5 minutes**

1. **Register Student**
   - Go to `http://localhost:3000/register`
   - Fill in details:
     - Name: "Test Student"
     - Email: "test@example.com"
     - Password: "password123"
     - Phone: "+91 9876543210"
   - Click Register

2. **Verify in Admin Portal**
   - Go to `http://localhost:3000/admin/offline-payments`
   - Search for "Test Student"
   - ✅ Should appear in student list

3. **Log in as Student**
   - Go to `http://localhost:3000/login`
   - Email: "test@example.com"
   - Password: "password123"
   - ✅ Should log in successfully

---

### Scenario 2: Admin Enrollment Flow
**Time: 5 minutes**

1. **Admin Login**
   - Go to `http://localhost:3000/login/admin`
   - Email: "admin@gmail.com"
   - Password: "admin123"

2. **Enroll Student**
   - Go to `/admin/enroll-student`
   - Fill in:
     - Name: "Admin Student"
     - Email: "adminstudent@example.com"
     - Phone: "+91 9876543211"
     - Course: "Full-Stack Web Development Bootcamp"
     - Installments: "3"
     - Password: "adminpass123"
   - Click Enroll

3. **Verify Enrollment**
   - Check "Recent Enrollments" table
   - ✅ Should show:
     - Student name: "Admin Student"
     - Course: "Full-Stack Web Development Bootcamp"
     - Total Fees: ₹25,000 (NOT $25000)
     - Installments: 3

4. **Verify in Offline Payments**
   - Go to `/admin/offline-payments`
   - Search for "Admin Student"
   - ✅ Should appear in list

---

### Scenario 3: Online Payment Flow
**Time: 5 minutes**

1. **Log in as Student**
   - Use credentials from Scenario 1 or 2
   - Go to `/my-enrollments`

2. **Make Online Payment**
   - Click "Pay Now" on an enrollment
   - Fill in payment details:
     - Amount: ₹5,000 (or any amount)
     - Method: "Card" (or UPI/NetBanking)
     - Card details: 4111111111111111 / 12/25 / 123
   - Click "Process Payment"
   - ✅ Should show success

3. **Verify in Admin Portal**
   - Log in as admin
   - Go to `/admin/offline-payments`
   - Click on student name to view details
   - ✅ Should see payment with:
     - Method: "online"
     - Amount: ₹5,000
     - Status: "completed"

---

### Scenario 4: Offline Payment Recording
**Time: 5 minutes**

1. **Admin Login**
   - Go to `/admin/offline-payments`

2. **Record Offline Payment**
   - Click "Manage" tab
   - Select an enrollment
   - ✅ Verify shows correct:
     - Total Installments (e.g., 3)
     - Per Installment Amount (e.g., ₹8,333)
     - Next Installment (e.g., #1)
   - Enter payment amount: ₹8,333
   - Click "Record Payment"

3. **Verify Payment**
   - Payment should appear in list
   - ✅ Method should show "offline"
   - ✅ Amount in ₹

---

### Scenario 5: Currency Consistency Check
**Time: 3 minutes**

Visit these pages and verify all amounts show in ₹ (NOT $):

1. ✅ `/admin/enroll-student` - Recent Enrollments table
2. ✅ `/admin/offline-payments` - Payment amounts
3. ✅ `/admin/offline-payments/[studentId]` - Student payments
4. ✅ `/my-enrollments` - Enrollment amounts
5. ✅ `/admin/dashboard` - All amounts

---

### Scenario 6: Data Persistence Check
**Time: 3 minutes**

1. **Create/Modify Data**
   - Enroll a student
   - Record a payment
   - Make an online payment

2. **Refresh Page**
   - Press F5 or Ctrl+R
   - ✅ All data should still be there

3. **Close & Reopen Browser**
   - Close the browser completely
   - Reopen and go to `http://localhost:3000`
   - ✅ All data should still be there

---

### Scenario 7: Password Management
**Time: 3 minutes**

1. **Admin Enrolls Student with Password**
   - Go to `/admin/enroll-student`
   - Enroll with password: "newpass123"

2. **Student Logs In**
   - Go to `/login`
   - Use the password: "newpass123"
   - ✅ Should log in successfully

3. **Admin Updates Password**
   - (Feature available via API)
   - Student should be able to log in with new password

---

### Scenario 8: Last Installment Lock
**Time: 3 minutes**

1. **Make Payments**
   - Log in as student
   - Go to `/my-enrollments`
   - Make payments for installments 1 and 2

2. **Last Installment Payment**
   - Click "Pay Now" on last installment
   - ✅ Should see:
     - "Last Installment" badge
     - Amount field disabled/grayed out
     - Message: "Last installment amount is auto-calculated and cannot be modified"
   - Amount should be auto-filled with remaining balance

---

## 📊 Test Checklist

### Basic Functionality
- [ ] Self-registered student appears in admin portal
- [ ] Admin-enrolled student appears in admin portal
- [ ] Students can log in
- [ ] Students can make online payments
- [ ] Admin can record offline payments

### Currency
- [ ] All amounts show ₹ (not $)
- [ ] Recent Enrollments shows ₹
- [ ] Payment records show ₹
- [ ] My Enrollments shows ₹

### Payment Tracking
- [ ] Online payments show "online" method
- [ ] Offline payments show "offline" method
- [ ] Both types visible in admin portal
- [ ] Student detail page shows all payments

### Installments
- [ ] Correct total installments shown
- [ ] Correct per-installment amount
- [ ] Last installment locked
- [ ] Last installment auto-filled

### Data Persistence
- [ ] Data survives page refresh
- [ ] Data survives browser close/reopen
- [ ] All student data persists
- [ ] All payment data persists

---

## 🔍 Debugging Tips

### If student doesn't appear in admin portal:
1. Check email is correct
2. Verify enrollment was created
3. Check localStorage in browser DevTools
4. Refresh page

### If payment method shows wrong:
1. Check payment was made from student login
2. Verify session storage has payment method
3. Check data.ts has correct payment method

### If currency shows $:
1. Check formatCurrency() is imported
2. Verify lib/data.ts has INR locale
3. Check component uses formatCurrency()

### If installment count wrong:
1. Check using `selectedInstallments` not `installmentNo`
2. Verify enrollment has correct installment count
3. Check calculation: courseFees / selectedInstallments

---

## 📱 Browser DevTools Checks

### Check localStorage:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('vidhyarthi_students'))
JSON.parse(localStorage.getItem('vidhyarthi_enrollments'))
JSON.parse(localStorage.getItem('vidhyarthi_payments'))
```

### Check session storage:
```javascript
// In browser console:
sessionStorage.getItem('lastPaymentMethod')
```

---

## ✅ All Tests Pass When:

- ✅ All students (self-registered and admin-enrolled) visible to admin
- ✅ All payments (online and offline) visible to admin
- ✅ All amounts in ₹ (INR)
- ✅ Payment methods correctly identified
- ✅ Installment counts accurate
- ✅ Data persists across sessions
- ✅ No errors in browser console

---

**Estimated Total Testing Time: 30 minutes**

**Status: Ready for Production** ✅
