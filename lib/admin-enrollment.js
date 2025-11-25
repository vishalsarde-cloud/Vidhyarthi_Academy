/**
 * Admin Enrollment Management Module
 * Allows admins to enroll students offline with full control over all fields
 */

/**
 * @typedef {Object} AdminEnrollmentData
 * @property {string} studentId - Student ID
 * @property {string} studentName - Student name
 * @property {string} studentEmail - Student email
 * @property {string} studentPhone - Student phone
 * @property {string} courseId - Course ID
 * @property {string} courseName - Course name
 * @property {number} courseFees - Course fees
 * @property {number} selectedInstallments - Number of installments
 * @property {Array} schedule - Payment schedule
 * @property {string} enrollmentStatus - Enrollment status
 * @property {string} enrollmentDate - Enrollment date
 * @property {string} notes - Admin notes
 */

// In-memory storage for admin enrollments
let _adminEnrollments = []

/**
 * Create a new admin enrollment
 * @param {AdminEnrollmentData} enrollmentData - Enrollment information
 * @returns {Object} Created enrollment
 */
export function createAdminEnrollment(enrollmentData) {
  const enrollment = {
    id: `ADMIN-ENR-${Date.now()}`,
    ...enrollmentData,
    status: enrollmentData.enrollmentStatus || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: enrollmentData.createdBy || 'admin',
  }
  _adminEnrollments.push(enrollment)
  return enrollment
}

/**
 * Update an admin enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {Partial<AdminEnrollmentData>} updates - Fields to update
 * @returns {Object|null} Updated enrollment or null if not found
 */
export function updateAdminEnrollment(enrollmentId, updates) {
  const index = _adminEnrollments.findIndex(e => e.id === enrollmentId)
  if (index === -1) return null

  _adminEnrollments[index] = {
    ..._adminEnrollments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return _adminEnrollments[index]
}

/**
 * Delete an admin enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteAdminEnrollment(enrollmentId) {
  const index = _adminEnrollments.findIndex(e => e.id === enrollmentId)
  if (index === -1) return false
  _adminEnrollments.splice(index, 1)
  return true
}

/**
 * Get all admin enrollments
 * @returns {Object[]} Array of all admin enrollments
 */
export function getAllAdminEnrollments() {
  return [..._adminEnrollments]
}

/**
 * Get admin enrollments by student ID
 * @param {string} studentId - Student ID
 * @returns {Object[]} Array of enrollments for the student
 */
export function getAdminEnrollmentsByStudentId(studentId) {
  return _adminEnrollments.filter(e => e.studentId === studentId)
}

/**
 * Get admin enrollments by course ID
 * @param {string} courseId - Course ID
 * @returns {Object[]} Array of enrollments for the course
 */
export function getAdminEnrollmentsByCourseId(courseId) {
  return _adminEnrollments.filter(e => e.courseId === courseId)
}

/**
 * Get a specific admin enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Object|null} Enrollment details or null if not found
 */
export function getAdminEnrollmentDetails(enrollmentId) {
  return _adminEnrollments.find(e => e.id === enrollmentId) || null
}

/**
 * Search admin enrollments by multiple criteria
 * @param {Object} criteria - Search criteria
 * @returns {Object[]} Matching enrollments
 */
export function searchAdminEnrollments(criteria) {
  return _adminEnrollments.filter(enrollment => {
    if (criteria.studentId && enrollment.studentId !== criteria.studentId) return false
    if (criteria.studentName && !enrollment.studentName.toLowerCase().includes(criteria.studentName.toLowerCase())) return false
    if (criteria.studentEmail && !enrollment.studentEmail.toLowerCase().includes(criteria.studentEmail.toLowerCase())) return false
    if (criteria.courseName && !enrollment.courseName.toLowerCase().includes(criteria.courseName.toLowerCase())) return false
    if (criteria.status && enrollment.status !== criteria.status) return false
    return true
  })
}

/**
 * Update specific fields in an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} fieldName - Field name to update
 * @param {any} fieldValue - New field value
 * @returns {Object|null} Updated enrollment or null if not found
 */
export function updateEnrollmentField(enrollmentId, fieldName, fieldValue) {
  const enrollment = getAdminEnrollmentDetails(enrollmentId)
  if (!enrollment) return null

  return updateAdminEnrollment(enrollmentId, {
    [fieldName]: fieldValue,
  })
}

/**
 * Update payment schedule for an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {Array} newSchedule - New payment schedule
 * @returns {Object|null} Updated enrollment or null if not found
 */
export function updatePaymentSchedule(enrollmentId, newSchedule) {
  return updateAdminEnrollment(enrollmentId, {
    schedule: newSchedule,
  })
}

/**
 * Get enrollment statistics
 * @returns {Object} Enrollment statistics
 */
export function getEnrollmentStatistics() {
  const total = _adminEnrollments.length
  const active = _adminEnrollments.filter(e => e.status === 'active').completed
  const completed = _adminEnrollments.filter(e => e.status === 'completed').length
  const cancelled = _adminEnrollments.filter(e => e.status === 'cancelled').length

  const totalFees = _adminEnrollments.reduce((sum, e) => sum + e.courseFees, 0)

  return {
    total,
    active,
    completed,
    cancelled,
    totalFees,
    averageFees: total > 0 ? totalFees / total : 0,
  }
}

/**
 * Get enrollments by status
 * @param {string} status - Enrollment status
 * @returns {Object[]} Enrollments with the specified status
 */
export function getEnrollmentsByStatus(status) {
  return _adminEnrollments.filter(e => e.status === status)
}

/**
 * Bulk update enrollments
 * @param {string[]} enrollmentIds - Array of enrollment IDs
 * @param {Object} updates - Fields to update
 * @returns {Object[]} Updated enrollments
 */
export function bulkUpdateEnrollments(enrollmentIds, updates) {
  return enrollmentIds
    .map(id => updateAdminEnrollment(id, updates))
    .filter(e => e !== null)
}

/**
 * Export enrollments data (for backup/reporting)
 * @returns {Object[]} All enrollments
 */
export function exportEnrollmentsData() {
  return JSON.parse(JSON.stringify(_adminEnrollments))
}

/**
 * Import enrollments data (for restore/migration)
 * @param {Object[]} data - Enrollments data to import
 */
export function importEnrollmentsData(data) {
  _adminEnrollments = JSON.parse(JSON.stringify(data))
}

/**
 * Clear all enrollments (use with caution)
 */
export function clearAllEnrollments() {
  _adminEnrollments = []
}

/**
 * Get enrollment with full details
 * @param {string} enrollmentId - Enrollment ID
 * @returns {Object|null} Full enrollment details
 */
export function getFullEnrollmentDetails(enrollmentId) {
  const enrollment = getAdminEnrollmentDetails(enrollmentId)
  if (!enrollment) return null

  return {
    ...enrollment,
    createdDate: new Date(enrollment.createdAt).toLocaleDateString(),
    updatedDate: new Date(enrollment.updatedAt).toLocaleDateString(),
  }
}

export default {
  createAdminEnrollment,
  updateAdminEnrollment,
  deleteAdminEnrollment,
  getAllAdminEnrollments,
  getAdminEnrollmentsByStudentId,
  getAdminEnrollmentsByCourseId,
  getAdminEnrollmentDetails,
  searchAdminEnrollments,
  updateEnrollmentField,
  updatePaymentSchedule,
  getEnrollmentStatistics,
  getEnrollmentsByStatus,
  bulkUpdateEnrollments,
  exportEnrollmentsData,
  importEnrollmentsData,
  clearAllEnrollments,
  getFullEnrollmentDetails,
}
