/**
 * Payment Management Module
 * Handles offline and online payment processing, tracking, and management
 * This module is designed to be reusable across different projects
 */

/**
 * @typedef {Object} OfflinePayment
 * @property {string} id - Unique payment ID
 * @property {string} studentId - Student ID
 * @property {string} studentName - Student name
 * @property {string} enrollmentId - Enrollment ID
 * @property {string} courseId - Course ID
 * @property {string} courseName - Course name
 * @property {number} courseFees - Total course fees
 * @property {number} amount - Payment amount
 * @property {number} installmentNo - Installment number
 * @property {string} paymentDate - Payment date (YYYY-MM-DD)
 * @property {string} paymentMethod - Payment method (offline, card, upi, netbanking)
 * @property {string} status - Payment status (pending, completed, failed, refunded)
 * @property {string} notes - Admin notes
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} createdBy - Admin who created the payment
 * @property {string} updatedBy - Admin who updated the payment
 */

// In-memory storage for offline payments
let _offlinePayments = []

/**
 * Add a new offline payment entry
 * @param {OfflinePayment} paymentData - Payment information
 * @returns {OfflinePayment} Created payment
 */
export function addOfflinePayment(paymentData) {
  const payment = {
    id: `PAY-${Date.now()}`,
    ...paymentData,
    status: paymentData.status || 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  _offlinePayments.push(payment)
  return payment
}

/**
 * Update an existing offline payment
 * @param {string} paymentId - Payment ID
 * @param {Partial<OfflinePayment>} updates - Fields to update
 * @returns {OfflinePayment|null} Updated payment or null if not found
 */
export function updateOfflinePayment(paymentId, updates) {
  const index = _offlinePayments.findIndex(p => p.id === paymentId)
  if (index === -1) return null

  _offlinePayments[index] = {
    ..._offlinePayments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return _offlinePayments[index]
}

/**
 * Delete an offline payment
 * @param {string} paymentId - Payment ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteOfflinePayment(paymentId) {
  const index = _offlinePayments.findIndex(p => p.id === paymentId)
  if (index === -1) return false
  _offlinePayments.splice(index, 1)
  return true
}

/**
 * Get all offline payments
 * @returns {OfflinePayment[]} Array of all offline payments
 */
export function getAllOfflinePayments() {
  return [..._offlinePayments]
}

/**
 * Get offline payments by student ID
 * @param {string} studentId - Student ID
 * @returns {OfflinePayment[]} Array of payments for the student
 */
export function getOfflinePaymentsByStudentId(studentId) {
  return _offlinePayments.filter(p => p.studentId === studentId)
}

/**
 * Get offline payments by enrollment ID
 * @param {string} enrollmentId - Enrollment ID
 * @returns {OfflinePayment[]} Array of payments for the enrollment
 */
export function getOfflinePaymentsByEnrollmentId(enrollmentId) {
  return _offlinePayments.filter(p => p.enrollmentId === enrollmentId)
}

/**
 * Get offline payments by course ID
 * @param {string} courseId - Course ID
 * @returns {OfflinePayment[]} Array of payments for the course
 */
export function getOfflinePaymentsByCourseid(courseId) {
  return _offlinePayments.filter(p => p.courseId === courseId)
}

/**
 * Calculate payment summary for an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {number} totalFees - Total course fees
 * @param {number} totalInstallments - Total number of installments
 * @returns {Object} Payment summary
 */
export function getPaymentSummary(enrollmentId, totalFees, totalInstallments) {
  const payments = getOfflinePaymentsByEnrollmentId(enrollmentId)
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const remainingFee = Math.max(0, totalFees - totalPaid)
  const paidInstallments = payments.filter(p => p.status === 'completed').length
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments)
  const isComplete = remainingFee === 0

  return {
    totalFees,
    totalPaid,
    remainingFee,
    totalInstallments,
    paidInstallments,
    remainingInstallments,
    isComplete,
    paymentStatus: isComplete ? 'Complete' : `${remainingInstallments} remaining`,
    percentagePaid: Math.round((totalPaid / totalFees) * 100),
  }
}

/**
 * Get payment details for display
 * @param {string} paymentId - Payment ID
 * @returns {OfflinePayment|null} Payment details or null if not found
 */
export function getPaymentDetails(paymentId) {
  return _offlinePayments.find(p => p.id === paymentId) || null
}

/**
 * Search payments by multiple criteria
 * @param {Object} criteria - Search criteria
 * @returns {OfflinePayment[]} Matching payments
 */
export function searchPayments(criteria) {
  return _offlinePayments.filter(payment => {
    if (criteria.studentId && payment.studentId !== criteria.studentId) return false
    if (criteria.studentName && !payment.studentName.toLowerCase().includes(criteria.studentName.toLowerCase())) return false
    if (criteria.courseName && !payment.courseName.toLowerCase().includes(criteria.courseName.toLowerCase())) return false
    if (criteria.status && payment.status !== criteria.status) return false
    if (criteria.paymentMethod && payment.paymentMethod !== criteria.paymentMethod) return false
    return true
  })
}

/**
 * Get payment statistics
 * @returns {Object} Payment statistics
 */
export function getPaymentStatistics() {
  const total = _offlinePayments.length
  const completed = _offlinePayments.filter(p => p.status === 'completed').length
  const pending = _offlinePayments.filter(p => p.status === 'pending').length
  const failed = _offlinePayments.filter(p => p.status === 'failed').length
  const refunded = _offlinePayments.filter(p => p.status === 'refunded').length

  const totalAmount = _offlinePayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const offlinePayments = _offlinePayments.filter(p => p.paymentMethod === 'offline').length

  return {
    total,
    completed,
    pending,
    failed,
    refunded,
    totalAmount,
    offlinePayments,
    averagePayment: total > 0 ? totalAmount / completed : 0,
  }
}

/**
 * Export payments data (for backup/reporting)
 * @returns {OfflinePayment[]} All payments
 */
export function exportPaymentsData() {
  return JSON.parse(JSON.stringify(_offlinePayments))
}

/**
 * Import payments data (for restore/migration)
 * @param {OfflinePayment[]} data - Payments data to import
 */
export function importPaymentsData(data) {
  _offlinePayments = JSON.parse(JSON.stringify(data))
}

/**
 * Clear all payments (use with caution)
 */
export function clearAllPayments() {
  _offlinePayments = []
}

/**
 * Get payment history for an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @returns {OfflinePayment[]} Payment history sorted by date
 */
export function getPaymentHistory(enrollmentId) {
  return getOfflinePaymentsByEnrollmentId(enrollmentId)
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
}

export default {
  addOfflinePayment,
  updateOfflinePayment,
  deleteOfflinePayment,
  getAllOfflinePayments,
  getOfflinePaymentsByStudentId,
  getOfflinePaymentsByEnrollmentId,
  getOfflinePaymentsByCourseid,
  getPaymentSummary,
  getPaymentDetails,
  searchPayments,
  getPaymentStatistics,
  exportPaymentsData,
  importPaymentsData,
  clearAllPayments,
  getPaymentHistory,
}
