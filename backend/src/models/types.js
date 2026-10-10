/**
 * @typedef {'pending' | 'approved' | 'rejected' | 'suspended'} MemberStatus
 * 
 * @typedef {Object} StudentMember
 * @property {string} id - Unique identifier (e.g. mem_12345_678)
 * @property {string} memberId - Human-readable identifier (e.g. ARX-2026-001)
 * @property {string} studentName - Full student name
 * @property {string} [firstName] - First name
 * @property {string} [secondName] - Second/Middle name
 * @property {string} [lastName] - Last name
 * @property {string} class - Grade and section (e.g. 10A, 11B)
 * @property {string} passwordHash - Bcrypt hashed password
 * @property {string} phoneNumber - Normalized Ethiopian phone (+251...)
 * @property {string} [email] - Optional student email address
 * @property {string} telegramUsername - Telegram handle
 * @property {string|number} [telegramUserId] - Telegram numeric user id
 * @property {boolean} [telegramActivated] - Telegram bot linkage verified
 * @property {string} [award] - Submitted prior award or achievement name
 * @property {'member' | 'admin'} role - Account role
 * @property {MemberStatus} status - Application status: 'pending' (default), 'approved', 'rejected'
 * @property {boolean} isApproved - Explicit flag indicating admin review approval
 * @property {string} [rejectionReason] - Optional administrator feedback when status is 'rejected'
 * @property {string} [approvedAt] - ISO timestamp of approval
 * @property {string} [rejectedAt] - ISO timestamp of rejection
 * @property {string} createdAt - Application submission date
 * @property {string} updatedAt - Last update date
 */

export {};