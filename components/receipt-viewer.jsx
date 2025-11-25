"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { formatCurrency, formatDate } from "@/lib/data"
import { Printer, GraduationCap, CheckCircle2, FileText, Download } from "lucide-react"
import jsPDF from "jspdf"

const APP_NAME = "Vidyarthi Academy"

export function ReceiptViewer({ isOpen, onClose, payment, enrollment, course, student }) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.txnRef}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .logo { width: 40px; height: 40px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
            .brand { font-size: 24px; font-weight: bold; }
            .success-badge { display: inline-flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 9999px; font-weight: 500; }
            .section { margin: 24px 0; }
            .section-title { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.05em; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .label { font-size: 14px; color: #6b7280; }
            .value { font-weight: 500; }
            .amount-box { background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; }
            .amount { font-size: 36px; font-weight: bold; }
            .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
            .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, pageWidth, 40, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    // Updated brand name in PDF
    doc.text(APP_NAME.toUpperCase(), 20, 25)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Course Enrollment Platform", 20, 33)

    // Receipt Title
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 55, { align: "center" })

    // Success Badge
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(pageWidth / 2 - 25, 60, 50, 10, 5, 5, "F")
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(10)
    doc.text("PAID", pageWidth / 2, 67, { align: "center" })

    // Amount Box
    doc.setFillColor(243, 244, 246)
    doc.roundedRect(20, 80, pageWidth - 40, 35, 3, 3, "F")
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text("Amount Paid", pageWidth / 2, 92, { align: "center" })
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.text(formatCurrency(payment.amount), pageWidth / 2, 107, { align: "center" })

    // Transaction Details
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text("TRANSACTION DETAILS", 20, 130)

    doc.setDrawColor(229, 231, 235)
    doc.line(20, 133, pageWidth - 20, 133)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)

    const detailsStartY = 145
    const lineHeight = 12

    // Left column
    doc.setTextColor(107, 114, 128)
    doc.text("Receipt ID:", 20, detailsStartY)
    doc.text("Date:", 20, detailsStartY + lineHeight)
    doc.text("Payment Method:", 20, detailsStartY + lineHeight * 2)
    doc.text("Installment:", 20, detailsStartY + lineHeight * 3)

    // Left column values
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text(payment.txnRef, 70, detailsStartY)
    doc.text(formatDate(payment.paidAt), 70, detailsStartY + lineHeight)
    doc.text(payment.method.toUpperCase(), 70, detailsStartY + lineHeight * 2)
    doc.text(`#${payment.installmentNo} of ${enrollment.selectedInstallments}`, 70, detailsStartY + lineHeight * 3)

    // Student Details
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(10)
    doc.text("STUDENT INFORMATION", 20, detailsStartY + lineHeight * 5)

    doc.setDrawColor(229, 231, 235)
    doc.line(20, detailsStartY + lineHeight * 5 + 3, pageWidth - 20, detailsStartY + lineHeight * 5 + 3)

    doc.setFontSize(11)
    doc.setTextColor(107, 114, 128)
    doc.text("Name:", 20, detailsStartY + lineHeight * 6)
    doc.text("Email:", 20, detailsStartY + lineHeight * 7)
    doc.text("Phone:", 20, detailsStartY + lineHeight * 8)

    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text(student.name, 50, detailsStartY + lineHeight * 6)
    doc.text(student.email, 50, detailsStartY + lineHeight * 7)
    doc.text(student.phone || "N/A", 50, detailsStartY + lineHeight * 8)

    // Course Details
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(10)
    doc.text("COURSE INFORMATION", 20, detailsStartY + lineHeight * 10)

    doc.setDrawColor(229, 231, 235)
    doc.line(20, detailsStartY + lineHeight * 10 + 3, pageWidth - 20, detailsStartY + lineHeight * 10 + 3)

    doc.setFontSize(11)
    doc.text("Course:", 20, detailsStartY + lineHeight * 11)
    doc.text("Duration:", 20, detailsStartY + lineHeight * 12)
    doc.text("Instructor:", 20, detailsStartY + lineHeight * 13)
    doc.text("Total Fee:", 20, detailsStartY + lineHeight * 14)

    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text(course.title.substring(0, 40), 55, detailsStartY + lineHeight * 11)
    doc.text(course.duration, 55, detailsStartY + lineHeight * 12)
    doc.text(course.instructor, 55, detailsStartY + lineHeight * 13)
    doc.text(formatCurrency(enrollment.totalAmount), 55, detailsStartY + lineHeight * 14)

    // Footer
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(156, 163, 175)
    doc.text(
      "Thank you for your payment. This receipt serves as confirmation of your transaction.",
      pageWidth / 2,
      280,
      {
        align: "center",
      },
    )
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 287, { align: "center" })

    // Save the PDF
    doc.save(`receipt-${payment.txnRef}.pdf`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div ref={receiptRef} className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                {/* Updated brand name */}
                <span className="text-xl font-bold">{APP_NAME}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Paid
              </div>
            </div>

            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
              <p className="text-4xl font-bold text-foreground">{formatCurrency(payment.amount)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Transaction Details</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Receipt ID</p>
                    <p className="font-medium font-mono">{payment.txnRef}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(payment.paidAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{payment.method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Installment</p>
                    <p className="font-medium">
                      #{payment.installmentNo} of {enrollment.selectedInstallments}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Student Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  {student.phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                  )}
                  {student.address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{student.address}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Course Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium">{course.title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Fee</p>
                    <p className="font-medium">{formatCurrency(enrollment.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{course.category}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Thank you for your payment. This receipt serves as official confirmation of your transaction.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
