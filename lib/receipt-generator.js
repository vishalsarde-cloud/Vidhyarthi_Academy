import jsPDF from "jspdf"

export 

export function generateReceiptPDF(data): string {
  const { payment, enrollment, course, student } = data

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  doc.setFillColor(59, 130, 246) // Primary blue color
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text("Vidhyarthi Academy", 20, 25)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  yPosition = 50

  // Receipt Title
  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.text("Payment Receipt", 20, yPosition)
  yPosition += 10

  // Receipt Info
  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.text(`Receipt ID: ${payment.receiptId || payment.id}`, 20, yPosition)
  yPosition += 6
  doc.text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 20, yPosition)
  yPosition += 6
  doc.text(`Transaction Ref: ${payment.txnRef}`, 20, yPosition)
  yPosition += 12

  // Student Information
  doc.setFont(undefined, "bold")
  doc.text("Student Information", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Name: ${student.name}`, 20, yPosition)
  yPosition += 5
  doc.text(`Email: ${student.email}`, 20, yPosition)
  yPosition += 5
  doc.text(`Phone: ${student.phone || "N/A"}`, 20, yPosition)
  yPosition += 12

  // Course Information
  doc.setFont(undefined, "bold")
  doc.text("Course Information", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Course: ${course.title}`, 20, yPosition)
  yPosition += 5
  doc.text(`Category: ${course.category}`, 20, yPosition)
  yPosition += 5
  doc.text(`Instructor: ${course.instructor}`, 20, yPosition)
  yPosition += 12

  // Payment Details
  doc.setFont(undefined, "bold")
  doc.text("Payment Details", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Installment: #${payment.installmentNo}`, 20, yPosition)
  yPosition += 5
  doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Payment Method: ${payment.method.toUpperCase()}`, 20, yPosition)
  yPosition += 5
  doc.text(`Status: ${payment.status.toUpperCase()}`, 20, yPosition)
  yPosition += 12

  // Enrollment Summary
  doc.setFont(undefined, "bold")
  doc.text("Enrollment Summary", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")

  const paidInstallments = enrollment.schedule.filter((i) => i.paid).length
  const totalInstallments = enrollment.selectedInstallments
  const totalPaid = enrollment.schedule.reduce((sum, i) => sum + i.paidAmount, 0)

  doc.text(`Total Course Fee: $${enrollment.totalAmount.toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Total Paid: $${totalPaid.toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Remaining: $${(enrollment.totalAmount - totalPaid).toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Installments Paid: ${paidInstallments}/${totalInstallments}`, 20, yPosition)
  yPosition += 15

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text("This is an automatically generated receipt. No signature required.", 20, pageHeight - 20)
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    20,
    pageHeight - 15,
  )

  return doc.output("dataurlstring")
}

export function downloadReceiptPDF(data): void {
  const { payment, student, course } = data
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Header
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text("Vidhyarthi Academy", 20, 25)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  yPosition = 50

  // Receipt Title
  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.text("Payment Receipt", 20, yPosition)
  yPosition += 10

  // Receipt Info
  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.text(`Receipt ID: ${payment.receiptId || payment.id}`, 20, yPosition)
  yPosition += 6
  doc.text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 20, yPosition)
  yPosition += 6
  doc.text(`Transaction Ref: ${payment.txnRef}`, 20, yPosition)
  yPosition += 12

  // Student Information
  doc.setFont(undefined, "bold")
  doc.text("Student Information", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Name: ${student.name}`, 20, yPosition)
  yPosition += 5
  doc.text(`Email: ${student.email}`, 20, yPosition)
  yPosition += 5
  doc.text(`Phone: ${student.phone || "N/A"}`, 20, yPosition)
  yPosition += 12

  // Course Information
  doc.setFont(undefined, "bold")
  doc.text("Course Information", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Course: ${course.title}`, 20, yPosition)
  yPosition += 5
  doc.text(`Category: ${course.category}`, 20, yPosition)
  yPosition += 5
  doc.text(`Instructor: ${course.instructor}`, 20, yPosition)
  yPosition += 12

  // Payment Details
  doc.setFont(undefined, "bold")
  doc.text("Payment Details", 20, yPosition)
  yPosition += 6
  doc.setFont(undefined, "normal")
  doc.text(`Installment: #${payment.installmentNo}`, 20, yPosition)
  yPosition += 5
  doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Payment Method: ${payment.method.toUpperCase()}`, 20, yPosition)
  yPosition += 5
  doc.text(`Status: ${payment.status.toUpperCase()}`, 20, yPosition)

  // Download the PDF
  doc.save(`receipt-${payment.id}.pdf`)
}
