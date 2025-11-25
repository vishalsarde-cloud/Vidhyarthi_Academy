"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Installment, Course } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { CreditCard, Building2, Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  installment: Installment
  course: Course
  onPaymentSuccess: (paymentId: string) => void
}

type PaymentMethod = "card" | "netbanking" | "upi"

export function PaymentModal({ isOpen, onClose, installment, course, onPaymentSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"details" | "processing" | "success" | "error">("details")
  const [paymentId, setPaymentId] = useState<string>("")

  const amountDue = installment.amount - installment.paidAmount

  const validationSchema = Yup.object({
    amount: Yup.number()
      .min(1, "Amount must be at least $1")
      .max(amountDue, `Amount cannot exceed ${formatCurrency(amountDue)}`)
      .required("Amount is required"),
    method: Yup.string().oneOf(["card", "netbanking", "upi"]).required("Payment method is required"),
    cardNumber: Yup.string().when("method", {
      is: "card",
      then: (schema) => schema.required("Card number is required").matches(/^\d{16}$/, "Invalid card number"),
    }),
    cardExpiry: Yup.string().when("method", {
      is: "card",
      then: (schema) => schema.required("Expiry is required").matches(/^\d{2}\/\d{2}$/, "Use MM/YY format"),
    }),
    cardCvv: Yup.string().when("method", {
      is: "card",
      then: (schema) => schema.required("CVV is required").matches(/^\d{3,4}$/, "Invalid CVV"),
    }),
    upiId: Yup.string().when("method", {
      is: "upi",
      then: (schema) => schema.required("UPI ID is required").matches(/^[\w.-]+@[\w]+$/, "Invalid UPI ID"),
    }),
  })

  const formik = useFormik({
    initialValues: {
      amount: amountDue,
      method: "card" as PaymentMethod,
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      upiId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setStep("processing")

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        const newPaymentId = `TXN${Date.now().toString().slice(-8)}`
        setPaymentId(newPaymentId)
        setStep("success")
        setTimeout(() => {
          onPaymentSuccess(newPaymentId)
        }, 1500)
      } else {
        setStep("error")
      }
    },
  })

  const handleClose = () => {
    setStep("details")
    formik.resetForm()
    onClose()
  }

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", icon: Building2 },
    { id: "upi", label: "UPI", icon: Smartphone },
  ]

  if (step === "processing") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold text-foreground">Processing Payment</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we process your payment of {formatCurrency(formik.values.amount)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your payment of {formatCurrency(formik.values.amount)} has been processed successfully.
            </p>
            <p className="text-xs text-muted-foreground font-mono">Transaction ID: {paymentId}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === "error") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Payment Failed</h3>
            <p className="text-sm text-muted-foreground text-center">
              We couldn't process your payment. Please try again or use a different payment method.
            </p>
            <Button onClick={() => setStep("details")}>Try Again</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Pay for Installment #{installment.no} - {course.title}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <form id="payment-form" onSubmit={formik.handleSubmit} className="space-y-6 pb-6">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Installment Amount</span>
                <span className="font-medium">{formatCurrency(installment.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Already Paid</span>
                <span className="font-medium text-success">{formatCurrency(installment.paidAmount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount Due</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(amountDue)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  {...formik.getFieldProps("amount")}
                  className={`pl-7 ${formik.errors.amount && formik.touched.amount ? "border-destructive" : ""}`}
                  min={1}
                  max={amountDue}
                  step={0.01}
                />
              </div>
              {formik.errors.amount && formik.touched.amount && (
                <p className="text-sm text-destructive">{formik.errors.amount}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={formik.values.method}
                onValueChange={(value) => formik.setFieldValue("method", value)}
                className="grid grid-cols-3 gap-3"
              >
                {paymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formik.values.method === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <method.icon
                      className={`h-5 w-5 ${formik.values.method === method.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-xs text-center font-medium">{method.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {formik.values.method === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...formik.getFieldProps("cardNumber")}
                    maxLength={16}
                    className={formik.errors.cardNumber && formik.touched.cardNumber ? "border-destructive" : ""}
                  />
                  {formik.errors.cardNumber && formik.touched.cardNumber && (
                    <p className="text-sm text-destructive">{formik.errors.cardNumber}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      {...formik.getFieldProps("cardExpiry")}
                      maxLength={5}
                      className={formik.errors.cardExpiry && formik.touched.cardExpiry ? "border-destructive" : ""}
                    />
                    {formik.errors.cardExpiry && formik.touched.cardExpiry && (
                      <p className="text-sm text-destructive">{formik.errors.cardExpiry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      type="password"
                      placeholder="123"
                      {...formik.getFieldProps("cardCvv")}
                      maxLength={4}
                      className={formik.errors.cardCvv && formik.touched.cardCvv ? "border-destructive" : ""}
                    />
                    {formik.errors.cardCvv && formik.touched.cardCvv && (
                      <p className="text-sm text-destructive">{formik.errors.cardCvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {formik.values.method === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  {...formik.getFieldProps("upiId")}
                  className={formik.errors.upiId && formik.touched.upiId ? "border-destructive" : ""}
                />
                {formik.errors.upiId && formik.touched.upiId && (
                  <p className="text-sm text-destructive">{formik.errors.upiId}</p>
                )}
              </div>
            )}

            {formik.values.method === "netbanking" && (
              <Alert>
                <Building2 className="h-4 w-4" />
                <AlertDescription>
                  You will be redirected to your bank's secure payment page to complete this transaction.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background shrink-0">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Pay {formatCurrency(formik.values.amount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
