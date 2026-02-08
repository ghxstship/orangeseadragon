// /lib/schemas/index.ts

// Schema registry - single source of truth for all entity schemas

// Core schemas
import { eventSchema } from './event';
import { projectSchema } from './project';
import { peopleSchema } from './people';
import { taskSchema } from './task';
import { venueSchema } from './venue';
import { assetSchema } from './asset';
import { opportunitySchema } from './opportunity';
import { discussionSchema } from './discussion';
import { challengeSchema } from './challenge';
import { connectionSchema } from './connection';
import { showcaseSchema } from './showcase';
import { marketplaceSchema } from './marketplace';
import { calendarSchema } from './calendar';
import { documentSchema } from './document';
import { workflowSchema } from './workflow';
import { taskListSchema } from './taskList';
import { workflowRunSchema } from './workflowRun';
import { folderSchema } from './folder';

// Core exports
export { eventSchema } from './event';
export { projectSchema } from './project';
export { peopleSchema } from './people';
export { taskSchema } from './task';
export { venueSchema } from './venue';
export { assetSchema } from './asset';
export { opportunitySchema } from './opportunity';
export { discussionSchema } from './discussion';
export { challengeSchema } from './challenge';
export { connectionSchema } from './connection';
export { showcaseSchema } from './showcase';
export { marketplaceSchema } from './marketplace';
export { calendarSchema } from './calendar';
export { documentSchema } from './document';
export { workflowSchema } from './workflow';
export { taskListSchema } from './taskList';
export { workflowRunSchema } from './workflowRun';
export { folderSchema } from './folder';

// Network module enhancement exports
export { messageSchema } from './message';
export { conversationSchema } from './conversation';
export { reactionSchema } from './reaction';
export { discussionReplySchema } from './discussionReply';
export { activityFeedSchema } from './activityFeed';
export { userFollowSchema } from './userFollow';
export { challengeParticipantSchema } from './challengeParticipant';
export { challengeSubmissionSchema } from './challengeSubmission';
export { challengeMilestoneSchema } from './challengeMilestone';
export { userPointsSchema, badgeSchema, userBadgeSchema } from './gamification';

// Projects module exports
export { sprintSchema } from './sprint';
export { backlogSchema } from './backlog';
export { boardSchema } from './board';
export { roadmapSchema } from './roadmap';
export { teamSchema } from './team';

// Production module exports
export { showSchema } from './show';
export { runsheetSchema } from './runsheet';
export { runsheetCueSchema } from './runsheetCue';
export { departmentSchema } from './department';
export { productionAdvanceSchema, advanceItemSchema, advanceItemFulfillmentSchema, vendorRatingSchema, advanceCategorySchema, advancingCatalogItemSchema } from './advancing';
export { publicProfileSchema } from './publicProfile';
export { techSpecSchema } from './techSpec';
export { riderSchema } from './rider';

// Operations module exports
export { floorPlanSchema } from './floorPlan';
export { zoneSchema } from './zone';
export { checkpointSchema } from './checkpoint';
export { incidentSchema } from './incident';
export { radioChannelSchema } from './radioChannel';
export { crewCheckinSchema } from './crewCheckin';
export { escalationChainSchema } from './escalationChain';
export { equipmentTrackingSchema, equipmentScanSchema } from './equipmentTracking';
export { vendorPortalAccessSchema, vendorDocumentSchema } from './vendorPortal';

// Workforce module exports
export { scheduleSchema } from './schedule';
export { shiftSchema } from './shift';
export { timesheetSchema } from './timesheet';
export { credentialSchema } from './credential';
export { certificationSchema } from './certification';
export { positionSchema } from './position';

// Assets module exports
export { categorySchema } from './category';
export { kitSchema } from './kit';
export { reservationSchema } from './reservation';
export { maintenanceSchema } from './maintenance';
export { checkInOutSchema } from './checkInOut';
export { vendorSchema } from './vendor';

// Finance module exports
export { budgetSchema } from './budget';
export { budgetPhaseSchema } from './budgetPhase';
export { budgetTemplateSchema } from './budgetTemplate';
export { paymentMilestoneSchema } from './paymentMilestone';
export { invoiceSchema } from './invoice';
export { invoiceLineItemSchema } from './invoiceLineItem';
export { expenseSchema } from './expense';
export { paymentSchema } from './payment';
export { settlementSchema } from './settlement';
export { accountSchema } from './account';
export { recurringInvoiceSchema } from './recurringInvoice';
export { quoteSchema } from './quote';
export { reminderTemplateSchema } from './reminderTemplate';
export { bankConnectionSchema } from './bankConnection';
export { receiptScanSchema } from './receiptScan';

// Time & Labor module exports
export { timerSessionSchema } from './timerSession';
export { laborRuleSetSchema } from './laborRuleSet';

// Operations module exports
export { resourceBookingSchema } from './resourceBooking';
export { automationRuleSchema } from './automationRule';
export { projectTemplateSchema } from './projectTemplate';
export { customFieldDefinitionSchema } from './customFieldDefinition';

// Analytics module exports
export { reportDefinitionSchema } from './reportDefinition';
export { dashboardSchema } from './dashboard';

// Phase 3 module exports
export { crewRateCardSchema } from './crewRateCard';

// Phase 5 module exports
export { crewGigRatingSchema } from './crewGigRating';
export { projectPostMortemSchema } from './projectPostMortem';
export { rfpResponseSchema } from './rfpResponse';

// Phase 6 module exports
export { mediaAssetSchema } from './mediaAsset';

// Ecosystem module exports
export { clientPortalAccessSchema } from './clientPortalAccess';
export { webhookEndpointSchema } from './webhookEndpoint';
export { oauthConnectionSchema } from './oauthConnection';

// Business module exports
export { contactSchema } from './contact';
export { companySchema } from './company';
export { leadSchema } from './lead';
export { dealSchema } from './deal';
export { proposalSchema } from './proposal';
export { contractSchema } from './contract';
export { pipelineSchema } from './pipeline';
export { leadScoreSchema } from './leadScore';
export { campaignSchema } from './campaign';

// New Phase 1-3 schemas
export { registrationSchema } from './registration';
export { ticketTypeSchema } from './ticketType';
export { talentSchema } from './talent';
export { partnerSchema } from './partner';
export { issuedCredentialSchema } from './issuedCredential';
export { chartOfAccountsSchema } from './chartOfAccounts';
export { journalEntrySchema } from './journalEntry';
export { bankAccountSchema } from './bankAccount';
export { onboardingTemplateSchema } from './onboardingTemplate';
export { leaveRequestSchema } from './leaveRequest';
export { purchaseOrderSchema } from './purchaseOrder';
export { supportTicketSchema } from './supportTicket';

// ClickUp SSOT schema exports
export { productionSchema } from './production';
export { shipmentSchema } from './shipment';
export { workOrderSchema } from './workOrder';
export { permitSchema } from './permit';
export { inspectionSchema } from './inspection';
export { punchItemSchema } from './punchItem';
export { dailySiteReportSchema } from './dailySiteReport';
export { travelRequestSchema } from './travelRequest';
export { candidateSchema } from './candidate';
export { vehicleSchema } from './vehicle';

// Additional schema exports
export { eventSessionSchema } from './eventSession';
export { offboardingTemplateSchema } from './offboardingTemplate';
export { emailSequenceSchema } from './emailSequence';
export { compliancePolicySchema } from './compliancePolicy';
export { formTemplateSchema } from './formTemplate';
export { hospitalityRequestSchema } from './hospitalityRequest';
export { performanceReviewSchema } from './performanceReview';
export { trainingCourseSchema } from './trainingCourse';
export { landingPageSchema } from './landingPage';
export { subscriberSchema } from './subscriber';
export { payrollRunSchema } from './payrollRun';
export { projectResourceSchema } from './projectResource';
export { timeEntrySchema } from './timeEntry';
export { exhibitorSchema } from './exhibitor';
export { networkingSessionSchema } from './networkingSession';
export { serviceTicketSchema } from './serviceTicket';

// Navigation v6 schema exports
export { checklistSchema } from './checklist';
export { notificationSchema } from './notification';
export { approvalSchema } from './approval';
export { documentTemplateSchema } from './documentTemplate';
export { workflowTriggerSchema } from './workflowTrigger';
export { stageSchema } from './stage';
export { insuranceSchema } from './insurance';
export { certificateOfInsuranceSchema } from './certificateOfInsurance';
export { cateringSchema } from './catering';
export { guestListSchema } from './guestList';
export { crewCallSchema } from './crewCall';
export { talentBookingSchema } from './talentBooking';
export { punchListSchema } from './punchList';
export { dailyReportSchema } from './dailyReport';
export { flightSchema } from './flight';
export { groundTransportSchema } from './groundTransport';
export { accommodationSchema } from './accommodation';
export { feedbackSchema } from './feedback';
export { storageBinSchema } from './storageBin';
export { assetTransferSchema } from './assetTransfer';
export { serviceHistorySchema } from './serviceHistory';
export { priceListSchema } from './priceList';
export { servicePackageSchema } from './servicePackage';
export { activitySchema } from './activity';
export { emailTemplateSchema } from './emailTemplate';
export { brandAssetSchema } from './brandAsset';
export { creditNoteSchema } from './creditNote';

// Re-export the canonical EntitySchema type from schema/types
export type { EntitySchema } from '@/lib/schema/types';

// Schema registry type
type SchemaRegistry = Record<string, typeof eventSchema>;

// Import new schemas for registry
import { sprintSchema } from './sprint';
import { backlogSchema } from './backlog';
import { boardSchema } from './board';
import { roadmapSchema } from './roadmap';
import { teamSchema } from './team';
import { showSchema } from './show';
import { runsheetSchema } from './runsheet';
import { runsheetCueSchema } from './runsheetCue';
import { departmentSchema } from './department';
import { productionAdvanceSchema, advanceItemSchema, advanceItemFulfillmentSchema, vendorRatingSchema, advanceCategorySchema, advancingCatalogItemSchema } from './advancing';
import { publicProfileSchema } from './publicProfile';
import { techSpecSchema } from './techSpec';
import { riderSchema } from './rider';
import { floorPlanSchema } from './floorPlan';
import { zoneSchema } from './zone';
import { checkpointSchema } from './checkpoint';
import { incidentSchema } from './incident';
import { radioChannelSchema } from './radioChannel';
import { scheduleSchema } from './schedule';
import { shiftSchema } from './shift';
import { timesheetSchema } from './timesheet';
import { credentialSchema } from './credential';
import { certificationSchema } from './certification';
import { positionSchema } from './position';
import { categorySchema } from './category';
import { kitSchema } from './kit';
import { reservationSchema } from './reservation';
import { maintenanceSchema } from './maintenance';
import { checkInOutSchema } from './checkInOut';
import { vendorSchema } from './vendor';
import { budgetSchema } from './budget';
import { budgetPhaseSchema } from './budgetPhase';
import { budgetTemplateSchema } from './budgetTemplate';
import { paymentMilestoneSchema } from './paymentMilestone';
import { invoiceSchema } from './invoice';
import { invoiceLineItemSchema } from './invoiceLineItem';
import { expenseSchema } from './expense';
import { paymentSchema } from './payment';
import { settlementSchema } from './settlement';
import { accountSchema } from './account';
import { recurringInvoiceSchema } from './recurringInvoice';
import { quoteSchema } from './quote';
import { reminderTemplateSchema } from './reminderTemplate';
import { bankConnectionSchema } from './bankConnection';
import { receiptScanSchema } from './receiptScan';
import { timerSessionSchema } from './timerSession';
import { laborRuleSetSchema } from './laborRuleSet';
import { resourceBookingSchema } from './resourceBooking';
import { automationRuleSchema } from './automationRule';
import { projectTemplateSchema } from './projectTemplate';
import { customFieldDefinitionSchema } from './customFieldDefinition';
import { reportDefinitionSchema } from './reportDefinition';
import { dashboardSchema } from './dashboard';
import { contactSchema } from './contact';
import { companySchema } from './company';
import { leadSchema } from './lead';
import { dealSchema } from './deal';
import { proposalSchema } from './proposal';
import { contractSchema } from './contract';
import { pipelineSchema } from './pipeline';

// Import new Phase 1-3 schemas
import { registrationSchema } from './registration';
import { ticketTypeSchema } from './ticketType';
import { talentSchema } from './talent';
import { partnerSchema } from './partner';
import { issuedCredentialSchema } from './issuedCredential';
import { chartOfAccountsSchema } from './chartOfAccounts';
import { journalEntrySchema } from './journalEntry';
import { bankAccountSchema } from './bankAccount';
import { onboardingTemplateSchema } from './onboardingTemplate';
import { leaveRequestSchema } from './leaveRequest';
import { purchaseOrderSchema } from './purchaseOrder';
import { supportTicketSchema } from './supportTicket';
import { leadScoreSchema } from './leadScore';
import { campaignSchema } from './campaign';

// Import ClickUp SSOT schemas
import { productionSchema } from './production';
import { shipmentSchema } from './shipment';
import { workOrderSchema } from './workOrder';
import { permitSchema } from './permit';
import { inspectionSchema } from './inspection';
import { punchItemSchema } from './punchItem';
import { dailySiteReportSchema } from './dailySiteReport';
import { travelRequestSchema } from './travelRequest';
import { candidateSchema } from './candidate';
import { vehicleSchema } from './vehicle';

// Import additional schemas
import { eventSessionSchema } from './eventSession';
import { offboardingTemplateSchema } from './offboardingTemplate';
import { emailSequenceSchema } from './emailSequence';
import { compliancePolicySchema } from './compliancePolicy';
import { formTemplateSchema } from './formTemplate';
import { hospitalityRequestSchema } from './hospitalityRequest';
import { performanceReviewSchema } from './performanceReview';
import { trainingCourseSchema } from './trainingCourse';
import { landingPageSchema } from './landingPage';
import { subscriberSchema } from './subscriber';
import { payrollRunSchema } from './payrollRun';
import { projectResourceSchema } from './projectResource';
import { timeEntrySchema } from './timeEntry';
import { exhibitorSchema } from './exhibitor';
import { networkingSessionSchema } from './networkingSession';
import { serviceTicketSchema } from './serviceTicket';

// Import Navigation v6 schemas
import { checklistSchema } from './checklist';
import { notificationSchema } from './notification';
import { approvalSchema } from './approval';
import { documentTemplateSchema } from './documentTemplate';
import { workflowTriggerSchema } from './workflowTrigger';
import { stageSchema } from './stage';
import { insuranceSchema } from './insurance';
import { certificateOfInsuranceSchema } from './certificateOfInsurance';
import { cateringSchema } from './catering';
import { guestListSchema } from './guestList';
import { crewCallSchema } from './crewCall';
import { talentBookingSchema } from './talentBooking';
import { punchListSchema } from './punchList';
import { dailyReportSchema } from './dailyReport';
import { flightSchema } from './flight';
import { groundTransportSchema } from './groundTransport';
import { accommodationSchema } from './accommodation';
import { feedbackSchema } from './feedback';
import { storageBinSchema } from './storageBin';
import { assetTransferSchema } from './assetTransfer';
import { serviceHistorySchema } from './serviceHistory';
import { priceListSchema } from './priceList';
import { servicePackageSchema } from './servicePackage';
import { activitySchema } from './activity';
import { emailTemplateSchema } from './emailTemplate';
import { brandAssetSchema } from './brandAsset';
import { creditNoteSchema } from './creditNote';

// Network module enhancement schemas
import { messageSchema } from './message';
import { conversationSchema } from './conversation';
import { reactionSchema } from './reaction';
import { discussionReplySchema } from './discussionReply';
import { activityFeedSchema } from './activityFeed';
import { userFollowSchema } from './userFollow';
import { challengeParticipantSchema } from './challengeParticipant';
import { challengeSubmissionSchema } from './challengeSubmission';
import { challengeMilestoneSchema } from './challengeMilestone';
import { userPointsSchema, badgeSchema, userBadgeSchema } from './gamification';
import { crewRateCardSchema } from './crewRateCard';
import { crewGigRatingSchema } from './crewGigRating';
import { projectPostMortemSchema } from './projectPostMortem';
import { rfpResponseSchema } from './rfpResponse';
import { mediaAssetSchema } from './mediaAsset';
import { clientPortalAccessSchema } from './clientPortalAccess';
import { webhookEndpointSchema } from './webhookEndpoint';
import { oauthConnectionSchema } from './oauthConnection';

// Helper functions for schema operations
export function getSchema(entityName: string) {
  const schemas: SchemaRegistry = {
    // Core entities
    event: eventSchema,
    events: eventSchema,
    project: projectSchema,
    projects: projectSchema,
    people: peopleSchema,
    task: taskSchema,
    tasks: taskSchema,
    venue: venueSchema,
    venues: venueSchema,
    asset: assetSchema,
    assets: assetSchema,
    opportunity: opportunitySchema,
    opportunities: opportunitySchema,
    discussion: discussionSchema,
    discussions: discussionSchema,
    challenge: challengeSchema,
    challenges: challengeSchema,
    connection: connectionSchema,
    connections: connectionSchema,
    showcase: showcaseSchema,
    marketplace: marketplaceSchema,
    calendar: calendarSchema,
    document: documentSchema,
    documents: documentSchema,
    workflow: workflowSchema,
    workflows: workflowSchema,
    'task-list': taskListSchema,
    'task-lists': taskListSchema,
    taskList: taskListSchema,
    'workflow-run': workflowRunSchema,
    'workflow-runs': workflowRunSchema,
    workflowRun: workflowRunSchema,
    folder: folderSchema,
    folders: folderSchema,
    // Projects module
    sprint: sprintSchema,
    sprints: sprintSchema,
    backlog: backlogSchema,
    backlogs: backlogSchema,
    board: boardSchema,
    boards: boardSchema,
    roadmap: roadmapSchema,
    roadmaps: roadmapSchema,
    team: teamSchema,
    teams: teamSchema,
    // Production module
    show: showSchema,
    shows: showSchema,
    'show_calls': showSchema,
    runsheet: runsheetSchema,
    runsheets: runsheetSchema,
    runsheetCue: runsheetCueSchema,
    'runsheet-cues': runsheetCueSchema,
    runsheet_cues: runsheetCueSchema,
    cue: runsheetCueSchema,
    cues: runsheetCueSchema,
    department: departmentSchema,
    departments: departmentSchema,
    advancing: productionAdvanceSchema,
    productionAdvance: productionAdvanceSchema,
    'production-advances': productionAdvanceSchema,
    advanceItem: advanceItemSchema,
    'advance-items': advanceItemSchema,
    advanceItemFulfillment: advanceItemFulfillmentSchema,
    'advance-fulfillment': advanceItemFulfillmentSchema,
    vendorRating: vendorRatingSchema,
    'vendor-ratings': vendorRatingSchema,
    advanceCategory: advanceCategorySchema,
    'advance-categories': advanceCategorySchema,
    advancingCatalogItem: advancingCatalogItemSchema,
    'advancing-catalog': advancingCatalogItemSchema,
    publicProfile: publicProfileSchema,
    'public-profiles': publicProfileSchema,
    profiles: publicProfileSchema,
    techSpec: techSpecSchema,
    'tech-specs': techSpecSchema,
    rider: riderSchema,
    riders: riderSchema,
    // Operations module
    floorPlan: floorPlanSchema,
    'floor-plans': floorPlanSchema,
    zone: zoneSchema,
    zones: zoneSchema,
    'venue_spaces': zoneSchema,
    checkpoint: checkpointSchema,
    checkpoints: checkpointSchema,
    incident: incidentSchema,
    incidents: incidentSchema,
    'incident_reports': incidentSchema,
    radioChannel: radioChannelSchema,
    'radio-channels': radioChannelSchema,
    radio: radioChannelSchema,
    // Workforce module
    schedule: scheduleSchema,
    schedules: scheduleSchema,
    shift: shiftSchema,
    shifts: shiftSchema,
    timesheet: timesheetSchema,
    timesheets: timesheetSchema,
    credential: credentialSchema,
    credentials: credentialSchema,
    certification: certificationSchema,
    certifications: certificationSchema,
    'user_certifications': certificationSchema,
    position: positionSchema,
    positions: positionSchema,
    // Assets module
    category: categorySchema,
    categories: categorySchema,
    'asset_categories': categorySchema,
    kit: kitSchema,
    kits: kitSchema,
    'asset_kits': kitSchema,
    reservation: reservationSchema,
    reservations: reservationSchema,
    'asset_reservations': reservationSchema,
    maintenance: maintenanceSchema,
    'asset_maintenance': maintenanceSchema,
    checkInOut: checkInOutSchema,
    check: checkInOutSchema,
    'asset_check_actions': checkInOutSchema,
    vendor: vendorSchema,
    vendors: vendorSchema,
    'vendor_contacts': vendorSchema,
    // Finance module
    budget: budgetSchema,
    budgets: budgetSchema,
    'budget-phase': budgetPhaseSchema,
    'budget-phases': budgetPhaseSchema,
    budget_phases: budgetPhaseSchema,
    'budget-template': budgetTemplateSchema,
    'budget-templates': budgetTemplateSchema,
    budget_templates: budgetTemplateSchema,
    'payment-milestone': paymentMilestoneSchema,
    'payment-milestones': paymentMilestoneSchema,
    payment_milestones: paymentMilestoneSchema,
    invoice: invoiceSchema,
    invoices: invoiceSchema,
    'invoice-line-item': invoiceLineItemSchema,
    'invoice-line-items': invoiceLineItemSchema,
    invoice_line_items: invoiceLineItemSchema,
    'timer-session': timerSessionSchema,
    'timer-sessions': timerSessionSchema,
    timer_sessions: timerSessionSchema,
    'labor-rule-set': laborRuleSetSchema,
    'labor-rule-sets': laborRuleSetSchema,
    labor_rule_sets: laborRuleSetSchema,
    'resource-booking': resourceBookingSchema,
    'resource-bookings': resourceBookingSchema,
    resource_bookings: resourceBookingSchema,
    'automation-rule': automationRuleSchema,
    'automation-rules': automationRuleSchema,
    automation_rules: automationRuleSchema,
    'project-template': projectTemplateSchema,
    'project-templates': projectTemplateSchema,
    project_templates: projectTemplateSchema,
    'custom-field-definition': customFieldDefinitionSchema,
    'custom-field-definitions': customFieldDefinitionSchema,
    custom_field_definitions: customFieldDefinitionSchema,
    'report-definition': reportDefinitionSchema,
    'report-definitions': reportDefinitionSchema,
    report_definitions: reportDefinitionSchema,
    reports: reportDefinitionSchema,
    dashboard: dashboardSchema,
    dashboards: dashboardSchema,
    'client-portal-access': clientPortalAccessSchema,
    'client-portal': clientPortalAccessSchema,
    client_portal_access: clientPortalAccessSchema,
    'webhook-endpoint': webhookEndpointSchema,
    'webhook-endpoints': webhookEndpointSchema,
    webhook_endpoints: webhookEndpointSchema,
    webhooks: webhookEndpointSchema,
    'oauth-connection': oauthConnectionSchema,
    'oauth-connections': oauthConnectionSchema,
    oauth_connections: oauthConnectionSchema,
    integrations: oauthConnectionSchema,
    'crew-rate-card': crewRateCardSchema,
    'crew-rate-cards': crewRateCardSchema,
    crew_rate_cards: crewRateCardSchema,
    'rate-cards': crewRateCardSchema,
    'crew-gig-rating': crewGigRatingSchema,
    'crew-gig-ratings': crewGigRatingSchema,
    crew_gig_ratings: crewGigRatingSchema,
    'crew-ratings': crewGigRatingSchema,
    'project-post-mortem': projectPostMortemSchema,
    'project-post-mortems': projectPostMortemSchema,
    project_post_mortems: projectPostMortemSchema,
    'post-mortems': projectPostMortemSchema,
    'rfp-response': rfpResponseSchema,
    'rfp-responses': rfpResponseSchema,
    rfp_responses: rfpResponseSchema,
    rfps: rfpResponseSchema,
    'media-asset': mediaAssetSchema,
    'media-assets': mediaAssetSchema,
    media_assets: mediaAssetSchema,
    media: mediaAssetSchema,
    expense: expenseSchema,
    expenses: expenseSchema,
    payment: paymentSchema,
    payments: paymentSchema,
    settlement: settlementSchema,
    settlements: settlementSchema,
    account: accountSchema,
    accounts: accountSchema,
    recurringInvoice: recurringInvoiceSchema,
    'recurring-invoices': recurringInvoiceSchema,
    'recurring-invoice': recurringInvoiceSchema,
    quote: quoteSchema,
    quotes: quoteSchema,
    estimate: quoteSchema,
    estimates: quoteSchema,
    reminderTemplate: reminderTemplateSchema,
    'reminder-templates': reminderTemplateSchema,
    bankConnection: bankConnectionSchema,
    'bank-connections': bankConnectionSchema,
    receiptScan: receiptScanSchema,
    'receipt-scans': receiptScanSchema,
    receipts: receiptScanSchema,
    // Business module
    contact: contactSchema,
    contacts: contactSchema,
    company: companySchema,
    companies: companySchema,
    lead: leadSchema,
    leads: leadSchema,
    deal: dealSchema,
    deals: dealSchema,
    proposal: proposalSchema,
    proposals: proposalSchema,
    contract: contractSchema,
    contracts: contractSchema,
    pipeline: pipelineSchema,
    pipelines: pipelineSchema,
    'pipeline_stages': pipelineSchema,
    // Phase 1-3 new schemas
    registration: registrationSchema,
    registrations: registrationSchema,
    ticketType: ticketTypeSchema,
    'ticket-types': ticketTypeSchema,
    talent: talentSchema,
    partner: partnerSchema,
    partners: partnerSchema,
    'event-partners': partnerSchema,
    issuedCredential: issuedCredentialSchema,
    'issued-credentials': issuedCredentialSchema,
    chartOfAccount: chartOfAccountsSchema,
    'chart-of-accounts': chartOfAccountsSchema,
    'gl-accounts': chartOfAccountsSchema,
    journalEntry: journalEntrySchema,
    'journal-entries': journalEntrySchema,
    journal: journalEntrySchema,
    bankAccount: bankAccountSchema,
    'bank-accounts': bankAccountSchema,
    banking: bankAccountSchema,
    onboardingTemplate: onboardingTemplateSchema,
    'onboarding-templates': onboardingTemplateSchema,
    leaveRequest: leaveRequestSchema,
    'leave-requests': leaveRequestSchema,
    leave: leaveRequestSchema,
    purchaseOrder: purchaseOrderSchema,
    'purchase-orders': purchaseOrderSchema,
    supportTicket: supportTicketSchema,
    'support-tickets': supportTicketSchema,
    support: supportTicketSchema,
    leadScore: leadScoreSchema,
    'lead-scores': leadScoreSchema,
    'lead-scoring': leadScoreSchema,
    campaign: campaignSchema,
    campaigns: campaignSchema,
    // Additional schemas
    eventSession: eventSessionSchema,
    'event-sessions': eventSessionSchema,
    sessions: eventSessionSchema,
    offboardingTemplate: offboardingTemplateSchema,
    'offboarding-templates': offboardingTemplateSchema,
    offboarding: offboardingTemplateSchema,
    emailSequence: emailSequenceSchema,
    'email-sequences': emailSequenceSchema,
    sequences: emailSequenceSchema,
    // Compliance, forms, hospitality
    compliancePolicy: compliancePolicySchema,
    'compliance-policies': compliancePolicySchema,
    formTemplate: formTemplateSchema,
    'form-templates': formTemplateSchema,
    forms: formTemplateSchema,
    hospitalityRequest: hospitalityRequestSchema,
    'hospitality-requests': hospitalityRequestSchema,
    hospitality: hospitalityRequestSchema,
    // Performance, training, landing pages, subscribers
    performanceReview: performanceReviewSchema,
    'performance-reviews': performanceReviewSchema,
    performance: performanceReviewSchema,
    trainingCourse: trainingCourseSchema,
    'training-courses': trainingCourseSchema,
    training: trainingCourseSchema,
    landingPage: landingPageSchema,
    'landing-pages': landingPageSchema,
    subscriber: subscriberSchema,
    subscribers: subscriberSchema,
    // Payroll, resources, time tracking
    payrollRun: payrollRunSchema,
    'payroll-runs': payrollRunSchema,
    payroll: payrollRunSchema,
    projectResource: projectResourceSchema,
    'project-resources': projectResourceSchema,
    resources: projectResourceSchema,
    timeEntry: timeEntrySchema,
    'time-entries': timeEntrySchema,
    time: timeEntrySchema,
    // Exhibitors, networking, service
    exhibitor: exhibitorSchema,
    exhibitors: exhibitorSchema,
    networkingSession: networkingSessionSchema,
    'networking-sessions': networkingSessionSchema,
    networking: networkingSessionSchema,
    serviceTicket: serviceTicketSchema,
    'service-tickets': serviceTicketSchema,
    service: serviceTicketSchema,
    // ClickUp SSOT schemas
    production: productionSchema,
    productions: productionSchema,
    shipment: shipmentSchema,
    shipments: shipmentSchema,
    workOrder: workOrderSchema,
    'work-orders': workOrderSchema,
    work_orders: workOrderSchema,
    permit: permitSchema,
    permits: permitSchema,
    inspection: inspectionSchema,
    inspections: inspectionSchema,
    punchItem: punchItemSchema,
    'punch-items': punchItemSchema,
    punch_items: punchItemSchema,
    dailySiteReport: dailySiteReportSchema,
    'daily-site-reports': dailySiteReportSchema,
    daily_site_reports: dailySiteReportSchema,
    travelRequest: travelRequestSchema,
    'travel-requests': travelRequestSchema,
    travel_requests: travelRequestSchema,
    candidate: candidateSchema,
    candidates: candidateSchema,
    vehicle: vehicleSchema,
    vehicles: vehicleSchema,
    // Navigation v6 schemas
    checklist: checklistSchema,
    checklists: checklistSchema,
    notification: notificationSchema,
    notifications: notificationSchema,
    approval: approvalSchema,
    approvals: approvalSchema,
    documentTemplate: documentTemplateSchema,
    'document-templates': documentTemplateSchema,
    workflowTrigger: workflowTriggerSchema,
    'workflow-triggers': workflowTriggerSchema,
    triggers: workflowTriggerSchema,
    stage: stageSchema,
    stages: stageSchema,
    insurance: insuranceSchema,
    'insurance-policies': insuranceSchema,
    certificate: certificateOfInsuranceSchema,
    certificates: certificateOfInsuranceSchema,
    certificateOfInsurance: certificateOfInsuranceSchema,
    'certificate-of-insurance': certificateOfInsuranceSchema,
    'certificates-of-insurance': certificateOfInsuranceSchema,
    certificates_of_insurance: certificateOfInsuranceSchema,
    catering: cateringSchema,
    'catering-orders': cateringSchema,
    guestList: guestListSchema,
    'guest-lists': guestListSchema,
    crewCall: crewCallSchema,
    'crew-calls': crewCallSchema,
    talentBooking: talentBookingSchema,
    'talent-bookings': talentBookingSchema,
    punchList: punchListSchema,
    'punch-lists': punchListSchema,
    dailyReport: dailyReportSchema,
    'daily-reports': dailyReportSchema,
    flight: flightSchema,
    flights: flightSchema,
    groundTransport: groundTransportSchema,
    'ground-transport': groundTransportSchema,
    accommodation: accommodationSchema,
    accommodations: accommodationSchema,
    feedback: feedbackSchema,
    storageBin: storageBinSchema,
    'storage-bins': storageBinSchema,
    bins: storageBinSchema,
    assetTransfer: assetTransferSchema,
    'asset-transfers': assetTransferSchema,
    transfers: assetTransferSchema,
    serviceHistory: serviceHistorySchema,
    'service-history': serviceHistorySchema,
    priceList: priceListSchema,
    'price-lists': priceListSchema,
    pricing: priceListSchema,
    servicePackage: servicePackageSchema,
    'service-packages': servicePackageSchema,
    packages: servicePackageSchema,
    activity: activitySchema,
    activities: activitySchema,
    emailTemplate: emailTemplateSchema,
    'email-templates': emailTemplateSchema,
    templates: emailTemplateSchema,
    brandAsset: brandAssetSchema,
    'brand-assets': brandAssetSchema,
    creditNote: creditNoteSchema,
    'credit-notes': creditNoteSchema,
    // Network module enhancement schemas
    message: messageSchema,
    messages: messageSchema,
    conversation: conversationSchema,
    conversations: conversationSchema,
    reaction: reactionSchema,
    reactions: reactionSchema,
    discussionReply: discussionReplySchema,
    'discussion-replies': discussionReplySchema,
    replies: discussionReplySchema,
    activityFeed: activityFeedSchema,
    'activity-feed': activityFeedSchema,
    feed: activityFeedSchema,
    userFollow: userFollowSchema,
    'user-follows': userFollowSchema,
    follows: userFollowSchema,
    challengeParticipant: challengeParticipantSchema,
    'challenge-participants': challengeParticipantSchema,
    participants: challengeParticipantSchema,
    challengeSubmission: challengeSubmissionSchema,
    'challenge-submissions': challengeSubmissionSchema,
    submissions: challengeSubmissionSchema,
    challengeMilestone: challengeMilestoneSchema,
    'challenge-milestones': challengeMilestoneSchema,
    milestones: challengeMilestoneSchema,
    userPoints: userPointsSchema,
    'user-points': userPointsSchema,
    points: userPointsSchema,
    badge: badgeSchema,
    badges: badgeSchema,
    userBadge: userBadgeSchema,
    'user-badges': userBadgeSchema,
    'earned-badges': userBadgeSchema,
  };

  return schemas[entityName] || null;
}

export function getAllSchemas() {
  return {
    event: eventSchema,
    project: projectSchema,
    people: peopleSchema,
    task: taskSchema,
    venue: venueSchema,
    asset: assetSchema,
    opportunity: opportunitySchema,
    discussion: discussionSchema,
    challenge: challengeSchema,
    connection: connectionSchema,
    showcase: showcaseSchema,
    marketplace: marketplaceSchema,
    calendar: calendarSchema,
    document: documentSchema,
    workflow: workflowSchema,
    taskList: taskListSchema,
    workflowRun: workflowRunSchema,
    folder: folderSchema,
  };
}
