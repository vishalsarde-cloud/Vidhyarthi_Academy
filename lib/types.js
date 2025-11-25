/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} maxInstallments
 * @property {boolean} active
 * @property {string} [image]
 * @property {string} category
 * @property {string} instructor
 * @property {string} duration
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} [address]
 * @property {string} [dateOfBirth]
 * @property {string} [gender]
 * @property {string} [education]
 * @property {string} [occupation]
 * @property {string} [emergencyContact]
 * @property {string} [profileImage]
 * @property {string} [bio]
 * @property {string[]} [skills]
 * @property {string} [linkedIn]
 * @property {string} [github]
 * @property {string} createdAt
 * @property {string} [password]
 */

/**
 * @typedef {Object} Installment
 * @property {number} no
 * @property {number} amount
 * @property {string} dueDate
 * @property {number} paidAmount
 * @property {boolean} paid
 * @property {string} status
 */

/**
 * @typedef {Object} Enrollment
 * @property {string} id
 * @property {string} studentId
 * @property {string} courseId
 * @property {Course} [course]
 * @property {Student} [student]
 * @property {number} totalAmount
 * @property {number} selectedInstallments
 * @property {string} status
 * @property {Installment[]} schedule
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} enrollmentId
 * @property {number} installmentNo
 * @property {number} amount
 * @property {string} paidAt
 * @property {string} method
 * @property {string} txnRef
 * @property {string} status
 * @property {string} [processedBy]
 * @property {boolean} [receiptGenerated]
 * @property {string} [receiptId]
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string} actorId
 * @property {string} actorType
 * @property {string} action
 * @property {string} entity
 * @property {string} entityId
 * @property {Object} [before]
 * @property {Object} [after]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} [avatar]
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} [dateOfBirth]
 * @property {string} [gender]
 * @property {string} [education]
 * @property {string} [occupation]
 * @property {string} [emergencyContact]
 * @property {string} [bio]
 * @property {string[]} [skills]
 * @property {string} [linkedIn]
 * @property {string} [github]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Credentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegistrationData
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} confirmPassword
 * @property {string} phone
 * @property {string} address
 * @property {string} dateOfBirth
 * @property {string} gender
 * @property {string} education
 * @property {string} occupation
 * @property {string} emergencyContact
 * @property {string} [bio]
 * @property {string} [linkedIn]
 * @property {string} [github]
 */

// Export for module usage
module.exports = {}
