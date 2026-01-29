/**
 * API Services Index
 * Exports all consolidated API services for new tables
 */

export { trainingServices, trainingProgramService, trainingAssignmentService, trainingSessionService, trainingSessionAttendeeService } from './training';
export { performanceServices, performanceReviewService, performanceReviewCompetencyService } from './performance';
export { employeeProfileService } from './employee-profiles';
export { catalogItemService } from './catalog';
export { addressService } from './addresses';
export type { Address, AddressType, AddressInsert, AddressUpdate } from './addresses';
