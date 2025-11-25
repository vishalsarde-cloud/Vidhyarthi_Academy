// Offline Payment Receipt Generator with PDF Download
import jsPDF from "jspdf"

export interface OfflinePaymentReceipt {
  studentId: string
  studentName: string
  studentEmail?: string
  courseId: string
  courseName: string
  courseFees: number
  paymentAmount: number
  paymentDate: string
  paymentMethod: string
  paymentStatus: string
  notes?: string
  receiptId: string
  createdAt: string
}

/**
 * Generate a PDF receipt for an offline payment
 * Uses HTML to PDF conversion approach
 */
export function generatePaymentReceiptPDF(payment: OfflinePaymentReceipt): void {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${payment.receiptId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #3b82f6;
          font-size: 32px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .receipt-number {
          text-align: right;
          margin-bottom: 20px;
          color: #666;
          font-size: 12px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          text-transform: uppercase;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #333;
        }
        .info-label {
          font-weight: 500;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .payment-summary {
          background-color: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .amount-label {
          font-weight: 500;
          color: #333;
        }
        .amount-value {
          font-weight: 600;
          color: #3b82f6;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #999;
          font-size: 12px;
        }
        .footer-note {
          margin-top: 10px;
          font-style: italic;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .receipt-container {
            box-shadow: none;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>Vidhyarthi Academy</h1>
          <p>Payment Receipt</p>
        </div>
        
        <div class="receipt-number">
          Receipt ID: <strong>${payment.receiptId}</strong>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${payment.studentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Student ID:</span>
            <span class="info-value">${payment.studentId}</span>
          </div>
          ${payment.studentEmail ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${payment.studentEmail}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Course Information</div>
          <div class="info-row">
            <span class="info-label">Course:</span>
            <span class="info-value">${payment.courseName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Course ID:</span>
            <span class="info-value">${payment.courseId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Course Fee:</span>
            <span class="info-value">$${payment.courseFees.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="payment-summary">
            <div class="amount-row">
              <span class="amount-label">Payment Amount:</span>
              <span class="amount-value">$${payment.paymentAmount.toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Payment Date:</span>
              <span class="amount-value">${new Date(payment.paymentDate).toLocaleDateString()}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Payment Method:</span>
              <span class="amount-value">${payment.paymentMethod.toUpperCase()}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Status:</span>
              <span class="status-badge status-${payment.paymentStatus.toLowerCase()}">
                ${payment.paymentStatus}
              </span>
            </div>
          </div>
          ${payment.notes ? `
          <div class="info-row">
            <span class="info-label">Notes:</span>
            <span class="info-value">${payment.notes}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is an automatically generated receipt. No signature required.</p>
          <p class="footer-note">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>

      <script>
        // Auto-print on load
        window.print();
      </script>
    </body>
    </html>
  `

  // Create a blob and download
  const blob = new Blob([receiptHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${payment.receiptId}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate a printable receipt (opens in new window)
 */
export function printPaymentReceipt(payment: OfflinePaymentReceipt): void {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${payment.receiptId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #3b82f6;
          font-size: 32px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .receipt-number {
          text-align: right;
          margin-bottom: 20px;
          color: #666;
          font-size: 12px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          text-transform: uppercase;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #333;
        }
        .info-label {
          font-weight: 500;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .payment-summary {
          background-color: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .amount-label {
          font-weight: 500;
          color: #333;
        }
        .amount-value {
          font-weight: 600;
          color: #3b82f6;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #999;
          font-size: 12px;
        }
        .footer-note {
          margin-top: 10px;
          font-style: italic;
        }
        @media print {
          body {
            padding: 0;
          }
          .receipt-container {
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>Vidhyarthi Academy</h1>
          <p>Payment Receipt</p>
        </div>
        
        <div class="receipt-number">
          Receipt ID: <strong>${payment.receiptId}</strong>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${payment.studentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Student ID:</span>
            <span class="info-value">${payment.studentId}</span>
          </div>
          ${payment.studentEmail ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${payment.studentEmail}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Course Information</div>
          <div class="info-row">
            <span class="info-label">Course:</span>
            <span class="info-value">${payment.courseName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Course ID:</span>
            <span class="info-value">${payment.courseId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Course Fee:</span>
            <span class="info-value">$${payment.courseFees.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="payment-summary">
            <div class="amount-row">
              <span class="amount-label">Payment Amount:</span>
              <span class="amount-value">$${payment.paymentAmount.toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Payment Date:</span>
              <span class="amount-value">${new Date(payment.paymentDate).toLocaleDateString()}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Payment Method:</span>
              <span class="amount-value">${payment.paymentMethod.toUpperCase()}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">Status:</span>
              <span class="status-badge status-${payment.paymentStatus.toLowerCase()}">
                ${payment.paymentStatus}
              </span>
            </div>
          </div>
          ${payment.notes ? `
          <div class="info-row">
            <span class="info-label">Notes:</span>
            <span class="info-value">${payment.notes}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is an automatically generated receipt. No signature required.</p>
          <p class="footer-note">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.print()
  }
}

/**
 * Generate receipt ID
 */
export function generateReceiptId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

/**
 * Generate and download receipt as PDF
 */
export function generateDownloadReceipt(payment: OfflinePaymentReceipt): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header with background
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(0, 0, pageWidth, 40, "F")

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Vidhyarthi Academy", 20, 25)

  // Reset text color
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  yPosition = 50

  // Receipt Title
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Payment Receipt", 20, yPosition)
  yPosition += 10

  // Receipt Info
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Receipt ID: ${payment.receiptId}`, 20, yPosition)
  yPosition += 6
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 20, yPosition)
  yPosition += 6
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition)
  yPosition += 12

  // Student Information Section
  doc.setFont("helvetica", "bold")
  doc.text("Student Information", 20, yPosition)
  yPosition += 6
  doc.setFont("helvetica", "normal")
  doc.text(`Name: ${payment.studentName}`, 20, yPosition)
  yPosition += 5
  doc.text(`Student ID: ${payment.studentId}`, 20, yPosition)
  yPosition += 5
  if (payment.studentEmail) {
    doc.text(`Email: ${payment.studentEmail}`, 20, yPosition)
    yPosition += 5
  }
  yPosition += 7

  // Course Information Section
  doc.setFont("helvetica", "bold")
  doc.text("Course Information", 20, yPosition)
  yPosition += 6
  doc.setFont("helvetica", "normal")
  doc.text(`Course: ${payment.courseName}`, 20, yPosition)
  yPosition += 5
  doc.text(`Course ID: ${payment.courseId}`, 20, yPosition)
  yPosition += 5
  doc.text(`Total Course Fee: $${payment.courseFees.toFixed(2)}`, 20, yPosition)
  yPosition += 12

  // Payment Details Section
  doc.setFont("helvetica", "bold")
  doc.text("Payment Details", 20, yPosition)
  yPosition += 6
  doc.setFont("helvetica", "normal")
  doc.text(`Payment Amount: $${payment.paymentAmount.toFixed(2)}`, 20, yPosition)
  yPosition += 5
  doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`, 20, yPosition)
  yPosition += 5
  doc.text(`Status: ${payment.paymentStatus.toUpperCase()}`, 20, yPosition)
  yPosition += 5
  if (payment.notes) {
    doc.text(`Notes: ${payment.notes}`, 20, yPosition)
    yPosition += 5
  }
  yPosition += 12

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text("This is an automatically generated receipt. No signature required.", 20, pageHeight - 15)

  // Save PDF
  doc.save(`receipt-${payment.receiptId}.pdf`)
}
