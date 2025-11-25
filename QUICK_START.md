# 🚀 QUICK START GUIDE - VIDHYARTHI ACADEMY

**Status**: ✅ RUNNING NOW  
**URL**: http://localhost:3000  
**Server**: Next.js Development Server  

---

## 🎯 WHAT YOU CAN DO NOW

### **1. Enroll Students**
1. Go to **Admin** → **Students** → **Enroll Student**
2. Fill in student details:
   - Student Name
   - Email Address
   - Phone Number
   - Select Course
   - Number of Installments
3. Click **"Enroll Student"**
4. ✅ Student enrolled successfully!

### **2. Record Payments**
1. Go to **Admin** → **Payments** → **Offline Payments**
2. Click **"Manage Payments"** tab
3. Select enrollment from dropdown
4. Enter payment details:
   - Payment Amount
   - Payment Date
   - Notes (optional)
5. Click **"Record Offline Payment"**
6. ✅ Payment recorded with Receipt ID!

### **3. View Payments**
1. Go to **Admin** → **Payments** → **Offline Payments**
2. Click **"View Payments"** tab
3. See all enrolled students
4. Click on a student to view their payments
5. See payment records with:
   - Amount
   - Date
   - Status
   - Receipt ID

### **4. Download Receipt**
1. In **"View Payments"** tab
2. Find a payment record
3. Click **Download** icon (⬇️)
4. ✅ Receipt downloads as PDF!

### **5. Print Receipt**
1. In **"View Payments"** tab
2. Find a payment record
3. Click **Print** icon (🖨️)
4. ✅ Receipt opens in new window!

---

## 📊 FEATURES OVERVIEW

### **Admin Dashboard**
- ✅ Clean, organized interface
- ✅ Easy navigation
- ✅ Real-time statistics

### **Student Management**
- ✅ Enroll students
- ✅ Auto-calculate payment schedule
- ✅ Auto-calculate last installment
- ✅ View enrolled students
- ✅ Delete enrollments

### **Payment Management**
- ✅ Record offline payments
- ✅ View all payments
- ✅ Edit payments
- ✅ Delete payments
- ✅ Change payment status
- ✅ Filter by status
- ✅ Search payments

### **Receipt System**
- ✅ Unique receipt ID for each payment
- ✅ Professional PDF receipts
- ✅ Print receipts
- ✅ Download receipts
- ✅ Complete payment information

---

## 🔢 EXAMPLE WORKFLOW

### **Step 1: Enroll a Student**
```
Name: John Doe
Email: john@example.com
Phone: 9876543210
Course: Web Development ($1000)
Installments: 3
```

**Auto-Calculated Schedule**:
- Installment 1: $333
- Installment 2: $333
- Installment 3: $334 (remaining)

### **Step 2: Record Payment**
```
Select: John Doe - Web Development
Amount: $333
Date: 2025-11-26
Notes: First installment payment
```

**System generates**: Receipt ID (e.g., RCP-1732592400000-ABC123)

### **Step 3: Download Receipt**
```
Click Download button
↓
Receipt downloads as: receipt-RCP-1732592400000-ABC123.pdf
↓
Contains:
- Receipt ID
- Student info
- Course info
- Payment details
- Payment status
```

---

## 🎨 NAVIGATION STRUCTURE

```
Admin Portal
├── Dashboard
├── Courses
├── Students
│   ├── View Students
│   └── Enroll Student ← Start here!
├── Enrollments
├── Payments
│   ├── View Payments
│   └── Offline Payments ← Main feature!
│       ├── View Payments (tab)
│       └── Manage Payments (tab)
├── Reports
├── Audit Logs
├── Notifications
└── Settings
```

---

## 💡 TIPS

### **For Enrollments**
- ✅ Last installment is auto-calculated
- ✅ No need to calculate manually
- ✅ System handles the remainder

### **For Payments**
- ✅ Each payment gets unique Receipt ID
- ✅ Receipts are professional PDFs
- ✅ Can print or download anytime

### **For Receipts**
- ✅ Contains all payment information
- ✅ Professional formatting
- ✅ Ready to send to students
- ✅ Downloadable as PDF

---

## 🔍 TESTING SCENARIOS

### **Scenario 1: Basic Enrollment**
1. Enroll student with 2 installments for $500 course
2. Expected: $250 + $250
3. ✅ Verify in "View Payments"

### **Scenario 2: Odd Amount**
1. Enroll student with 3 installments for $1000 course
2. Expected: $333 + $333 + $334
3. ✅ Last installment auto-calculated correctly

### **Scenario 3: Receipt Download**
1. Record a payment
2. Click download button
3. Expected: PDF file downloads
4. ✅ Open and verify content

### **Scenario 4: Receipt Print**
1. Record a payment
2. Click print button
3. Expected: Opens in new window
4. ✅ Print from browser

---

## 🚀 KEYBOARD SHORTCUTS

- **Tab**: Navigate between fields
- **Enter**: Submit forms
- **Escape**: Close dialogs
- **Ctrl+P**: Print (when receipt is open)

---

## 📞 TROUBLESHOOTING

### **Server Not Running?**
```bash
npm run dev
```

### **Port 3000 Already in Use?**
```bash
# Kill process on port 3000
# Then run: npm run dev
```

### **PDF Not Downloading?**
- Check browser download settings
- Allow pop-ups for localhost
- Check browser console for errors

### **Data Not Showing?**
- Refresh the page
- Check browser console
- Verify enrollment was created

---

## 📚 DOCUMENTATION

For more details, see:
- `README.md` - Main documentation
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `GLOBAL_ENROLLMENT_STORE.md` - Data management
- `PAYMENT_RECEIPTS_AND_CLEANUP.md` - Receipt system

---

## ✅ CHECKLIST

- ✅ Server running on http://localhost:3000
- ✅ Admin portal accessible
- ✅ All features working
- ✅ Ready to use
- ✅ Ready for production

---

**Start using Vidhyarthi Academy now!** 🎉

**URL**: http://localhost:3000
