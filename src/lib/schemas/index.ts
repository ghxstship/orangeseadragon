// /lib/schemas/index.ts

// Schema registry - single source of truth for all entity schemas

// Core schemas
import { eventSchema } from './production/event';
import { projectSchema } from './project';
import { peopleSchema } from './people/people';
import { taskSchema } from './core/task';
import { venueSchema } from './production/venue';
import { assetSchema } from './assets/asset';
import { opportunitySchema } from './crm/opportunity';
import { discussionSchema } from './core/discussion';
import { challengeSchema } from './network/challenge';
import { connectionSchema } from './crm/connection';
import { showcaseSchema } from './crm/showcase';
import { marketplaceSchema } from './crm/marketplace';
import { calendarSchema } from './calendar';
import { documentSchema } from './core/document';
import { workflowSchema } from './workflows/workflow';
import { taskListSchema } from './core/taskList';
import { workflowRunSchema } from './workflows/workflowRun';
import { folderSchema } from './core/folder';

// Core exports
export { eventSchema } from './production/event';
export { projectSchema } from './project';
export { peopleSchema } from './people/people';
export { taskSchema } from './core/task';
export { venueSchema } from './production/venue';
export { assetSchema } from './assets/asset';
export { opportunitySchema } from './crm/opportunity';
export { discussionSchema } from './core/discussion';
export { challengeSchema } from './network/challenge';
export { connectionSchema } from './crm/connection';
export { showcaseSchema } from './crm/showcase';
export { marketplaceSchema } from './crm/marketplace';
export { calendarSchema } from './calendar';
export { documentSchema } from './core/document';
export { workflowSchema } from './workflows/workflow';
export { taskListSchema } from './core/taskList';
export { workflowRunSchema } from './workflows/workflowRun';
export { folderSchema } from './core/folder';

// Network module enhancement exports
export { messageSchema } from './core/message';
export { conversationSchema } from './core/conversation';
export { reactionSchema } from './core/reaction';
export { discussionReplySchema } from './core/discussionReply';
export { activityFeedSchema } from './core/activityFeed';
export { userFollowSchema } from './core/userFollow';
export { challengeParticipantSchema } from './network/challengeParticipant';
export { challengeSubmissionSchema } from './network/challengeSubmission';
export { challengeMilestoneSchema } from './network/challengeMilestone';
export { userPointsSchema, badgeSchema, userBadgeSchema } from './network/gamification';

// Projects module exports
export { sprintSchema } from './sprint';
export { backlogSchema } from './backlog';
export { boardSchema } from './board';
export { roadmapSchema } from './roadmap';
export { teamSchema } from './core/team';

// Platform catalog exports
export { platformCatalogDivisionSchema, platformCatalogCategorySchema, platformCatalogItemSchema } from './catalog';

// Production module exports
export { showSchema } from './production/show';
export { runsheetSchema } from './production/runsheet';
export { runsheetCueSchema } from './production/runsheetCue';
export { departmentSchema } from './core/department';
export { productionAdvanceSchema, advanceItemSchema, advanceItemFulfillmentSchema, vendorRatingSchema } from './advancing';
export { publicProfileSchema } from './core/publicProfile';
export { techSpecSchema } from './production/techSpec';
export { riderSchema } from './production/rider';

// Operations module exports
export { floorPlanSchema } from './production/floorPlan';
export { zoneSchema } from './assets/zone';
export { checkpointSchema } from './operations/checkpoint';
export { incidentSchema } from './incident';
export { radioChannelSchema } from './production/radioChannel';
export { crewCheckinSchema } from './production/crewCheckin';
export { escalationChainSchema } from './workflows/escalationChain';
export { equipmentTrackingSchema, equipmentScanSchema } from './assets/equipmentTracking';
export { vendorPortalAccessSchema, vendorDocumentSchema } from './vendorPortal';

// Workforce module exports
export { scheduleSchema } from './operations/schedule';
export { shiftSchema } from './operations/shift';
export { timesheetSchema } from './people/timesheet';
export { credentialSchema } from './people/credential';
export { certificationSchema } from './people/certification';
export { positionSchema } from './people/position';

// Assets module exports
export { kitSchema } from './assets/kit';
export { reservationSchema } from './assets/reservation';
export { maintenanceSchema } from './assets/maintenance';
export { checkInOutSchema } from './operations/checkInOut';
export { vendorSchema } from './vendor';

// Finance module exports
export { budgetSchema } from './finance/budget';
export { budgetPhaseSchema } from './finance/budgetPhase';
export { budgetTemplateSchema } from './finance/budgetTemplate';
export { paymentMilestoneSchema } from './finance/paymentMilestone';
export { invoiceSchema } from './finance/invoice';
export { invoiceLineItemSchema } from './finance/invoiceLineItem';
export { expenseSchema } from './finance/expense';
export { paymentSchema } from './finance/payment';
export { settlementSchema } from './finance/settlement';
export { accountSchema } from './account';
export { recurringInvoiceSchema } from './finance/recurringInvoice';
export { quoteSchema } from './finance/quote';
export { reminderTemplateSchema } from './workflows/reminderTemplate';
export { bankConnectionSchema } from './finance/bankConnection';
export { receiptScanSchema } from './finance/receiptScan';

// Time & Labor module exports
export { timerSessionSchema } from './people/timerSession';
export { laborRuleSetSchema } from './operations/laborRuleSet';

// Operations module exports
export { resourceBookingSchema } from './operations/resourceBooking';
export { automationRuleSchema } from './workflows/automationRule';
export { projectTemplateSchema } from './projectTemplate';
export { customFieldDefinitionSchema } from './core/customFieldDefinition';

// Analytics module exports
export { reportDefinitionSchema } from './reportDefinition';
export { dashboardSchema } from './core/dashboard';

// Phase 3 module exports
export { crewRateCardSchema } from './production/crewRateCard';

// Phase 5 module exports
export { crewGigRatingSchema } from './production/crewGigRating';
export { projectPostMortemSchema } from './projectPostMortem';
export { rfpResponseSchema } from './rfpResponse';

// Phase 6 module exports
export { mediaAssetSchema } from './production/mediaAsset';

// Productive.io gap closure exports
export { fiscalYearSchema } from './finance/fiscalYear';

// Ecosystem module exports
export { clientPortalAccessSchema } from './clientPortalAccess';
export { webhookEndpointSchema } from './workflows/webhookEndpoint';
export { oauthConnectionSchema } from './oauthConnection';

// Business module exports
export { contactSchema } from './crm/contact';
export { companySchema } from './crm/company';
export { leadSchema } from './crm/lead';
export { dealSchema } from './crm/deal';
export { proposalSchema } from './proposal';
export { contractSchema } from './contract';
export { pipelineSchema } from './crm/pipeline';
export { leadScoreSchema } from './crm/leadScore';
export { campaignSchema } from './crm/campaign';

// New Phase 1-3 schemas
export { registrationSchema } from './network/registration';
export { ticketTypeSchema } from './network/ticketType';
export { talentSchema } from './people/talent';
export { partnerSchema } from './crm/partner';
export { issuedCredentialSchema } from './people/issuedCredential';
export { chartOfAccountsSchema } from './finance/chartOfAccounts';
export { journalEntrySchema } from './finance/journalEntry';
export { bankAccountSchema } from './finance/bankAccount';
export { onboardingTemplateSchema } from './people/onboardingTemplate';
export { leaveRequestSchema } from './people/leaveRequest';
export { purchaseOrderSchema } from './operations/purchaseOrder';
export { supportTicketSchema } from './operations/supportTicket';

// ClickUp SSOT schema exports
export { productionSchema } from './production/production';
export { shipmentSchema } from './operations/shipment';
export { workOrderSchema } from './operations/workOrder';
export { permitSchema } from './operations/permit';
export { inspectionSchema } from './assets/inspection';
export { punchItemSchema } from './operations/punchItem';
export { dailySiteReportSchema } from './production/dailySiteReport';
export { travelRequestSchema } from './operations/travelRequest';
export { candidateSchema } from './people/candidate';
export { vehicleSchema } from './assets/vehicle';

// Additional schema exports
export { eventSessionSchema } from './production/eventSession';
export { offboardingTemplateSchema } from './people/offboardingTemplate';
export { emailSequenceSchema } from './crm/emailSequence';
export { compliancePolicySchema } from './compliancePolicy';
export { formTemplateSchema } from './core/formTemplate';
export { hospitalityRequestSchema } from './operations/hospitalityRequest';
export { performanceReviewSchema } from './people/performanceReview';
export { trainingCourseSchema } from './people/trainingCourse';
export { landingPageSchema } from './crm/landingPage';
export { subscriberSchema } from './crm/subscriber';
export { payrollRunSchema } from './finance/payrollRun';
export { projectResourceSchema } from './projectResource';
export { timeEntrySchema } from './people/timeEntry';
export { exhibitorSchema } from './crm/exhibitor';
export { networkingSessionSchema } from './network/networkingSession';
export { serviceTicketSchema } from './operations/serviceTicket';

// Navigation v6 schema exports
export { checklistSchema } from './operations/checklist';
export { notificationSchema } from './core/notification';
export { approvalSchema } from './approval';
export { documentTemplateSchema } from './core/documentTemplate';
export { workflowTriggerSchema } from './workflows/workflowTrigger';
export { stageSchema } from './crm/stage';
export { insuranceSchema } from './insurance';
export { certificateOfInsuranceSchema } from './certificateOfInsurance';
export { cateringSchema } from './operations/catering';
export { guestListSchema } from './production/guestList';
export { crewCallSchema } from './production/crewCall';
export { talentBookingSchema } from './people/talentBooking';
export { punchListSchema } from './operations/punchList';
export { dailyReportSchema } from './production/dailyReport';
export { flightSchema } from './operations/flight';
export { groundTransportSchema } from './operations/groundTransport';
export { accommodationSchema } from './operations/accommodation';
export { feedbackSchema } from './network/feedback';
export { storageBinSchema } from './assets/storageBin';
export { assetTransferSchema } from './assets/assetTransfer';
export { serviceHistorySchema } from './operations/serviceHistory';
export { priceListSchema } from './finance/priceList';
export { servicePackageSchema } from './operations/servicePackage';
export { activitySchema } from './core/activity';
export { emailTemplateSchema } from './crm/emailTemplate';
export { brandAssetSchema } from './brandAsset';
export { creditNoteSchema } from './finance/creditNote';

// Gap analysis remediation schema exports
export { productSchema } from './product';
export { budgetLineItemSchema } from './finance/budgetLineItem';
export { payrollDeductionSchema } from './finance/payrollDeduction';
export { payrollRateSchema } from './finance/payrollRate';
export { payStubSchema } from './finance/payStub';
export { weatherAlertSchema } from './production/weatherAlert';

// EntitySchema type from schema-engine
export type { EntitySchema } from '@/lib/schema-engine/types';

// Schema registry type
type SchemaRegistry = Record<string, typeof eventSchema>;

// Import new schemas for registry
import { sprintSchema } from './sprint';
import { backlogSchema } from './backlog';
import { boardSchema } from './board';
import { roadmapSchema } from './roadmap';
import { teamSchema } from './core/team';
import { platformCatalogDivisionSchema, platformCatalogCategorySchema, platformCatalogItemSchema } from './catalog';
import { showSchema } from './production/show';
import { runsheetSchema } from './production/runsheet';
import { runsheetCueSchema } from './production/runsheetCue';
import { departmentSchema } from './core/department';
import { productionAdvanceSchema, advanceItemSchema, advanceItemFulfillmentSchema, vendorRatingSchema } from './advancing';
import { publicProfileSchema } from './core/publicProfile';
import { techSpecSchema } from './production/techSpec';
import { riderSchema } from './production/rider';
import { floorPlanSchema } from './production/floorPlan';
import { zoneSchema } from './assets/zone';
import { checkpointSchema } from './operations/checkpoint';
import { incidentSchema } from './incident';
import { radioChannelSchema } from './production/radioChannel';
import { scheduleSchema } from './operations/schedule';
import { shiftSchema } from './operations/shift';
import { timesheetSchema } from './people/timesheet';
import { credentialSchema } from './people/credential';
import { certificationSchema } from './people/certification';
import { positionSchema } from './people/position';
import { kitSchema } from './assets/kit';
import { reservationSchema } from './assets/reservation';
import { maintenanceSchema } from './assets/maintenance';
import { checkInOutSchema } from './operations/checkInOut';
import { vendorSchema } from './vendor';
import { budgetSchema } from './finance/budget';
import { budgetPhaseSchema } from './finance/budgetPhase';
import { budgetTemplateSchema } from './finance/budgetTemplate';
import { paymentMilestoneSchema } from './finance/paymentMilestone';
import { invoiceSchema } from './finance/invoice';
import { invoiceLineItemSchema } from './finance/invoiceLineItem';
import { expenseSchema } from './finance/expense';
import { paymentSchema } from './finance/payment';
import { settlementSchema } from './finance/settlement';
import { accountSchema } from './account';
import { recurringInvoiceSchema } from './finance/recurringInvoice';
import { quoteSchema } from './finance/quote';
import { reminderTemplateSchema } from './workflows/reminderTemplate';
import { bankConnectionSchema } from './finance/bankConnection';
import { receiptScanSchema } from './finance/receiptScan';
import { timerSessionSchema } from './people/timerSession';
import { laborRuleSetSchema } from './operations/laborRuleSet';
import { resourceBookingSchema } from './operations/resourceBooking';
import { automationRuleSchema } from './workflows/automationRule';
import { projectTemplateSchema } from './projectTemplate';
import { customFieldDefinitionSchema } from './core/customFieldDefinition';
import { reportDefinitionSchema } from './reportDefinition';
import { dashboardSchema } from './core/dashboard';
import { contactSchema } from './crm/contact';
import { companySchema } from './crm/company';
import { leadSchema } from './crm/lead';
import { dealSchema } from './crm/deal';
import { proposalSchema } from './proposal';
import { contractSchema } from './contract';
import { pipelineSchema } from './crm/pipeline';

// Import new Phase 1-3 schemas
import { registrationSchema } from './network/registration';
import { ticketTypeSchema } from './network/ticketType';
import { talentSchema } from './people/talent';
import { partnerSchema } from './crm/partner';
import { issuedCredentialSchema } from './people/issuedCredential';
import { chartOfAccountsSchema } from './finance/chartOfAccounts';
import { journalEntrySchema } from './finance/journalEntry';
import { bankAccountSchema } from './finance/bankAccount';
import { onboardingTemplateSchema } from './people/onboardingTemplate';
import { leaveRequestSchema } from './people/leaveRequest';
import { purchaseOrderSchema } from './operations/purchaseOrder';
import { supportTicketSchema } from './operations/supportTicket';
import { leadScoreSchema } from './crm/leadScore';
import { campaignSchema } from './crm/campaign';

// Import ClickUp SSOT schemas
import { productionSchema } from './production/production';
import { shipmentSchema } from './operations/shipment';
import { workOrderSchema } from './operations/workOrder';
import { permitSchema } from './operations/permit';
import { inspectionSchema } from './assets/inspection';
import { punchItemSchema } from './operations/punchItem';
import { dailySiteReportSchema } from './production/dailySiteReport';
import { travelRequestSchema } from './operations/travelRequest';
import { candidateSchema } from './people/candidate';
import { vehicleSchema } from './assets/vehicle';

// Import additional schemas
import { eventSessionSchema } from './production/eventSession';
import { offboardingTemplateSchema } from './people/offboardingTemplate';
import { emailSequenceSchema } from './crm/emailSequence';
import { compliancePolicySchema } from './compliancePolicy';
import { formTemplateSchema } from './core/formTemplate';
import { hospitalityRequestSchema } from './operations/hospitalityRequest';
import { performanceReviewSchema } from './people/performanceReview';
import { trainingCourseSchema } from './people/trainingCourse';
import { landingPageSchema } from './crm/landingPage';
import { subscriberSchema } from './crm/subscriber';
import { payrollRunSchema } from './finance/payrollRun';
import { projectResourceSchema } from './projectResource';
import { timeEntrySchema } from './people/timeEntry';
import { exhibitorSchema } from './crm/exhibitor';
import { networkingSessionSchema } from './network/networkingSession';
import { serviceTicketSchema } from './operations/serviceTicket';

// Import Navigation v6 schemas
import { checklistSchema } from './operations/checklist';
import { notificationSchema } from './core/notification';
import { approvalSchema } from './approval';
import { documentTemplateSchema } from './core/documentTemplate';
import { workflowTriggerSchema } from './workflows/workflowTrigger';
import { stageSchema } from './crm/stage';
import { insuranceSchema } from './insurance';
import { certificateOfInsuranceSchema } from './certificateOfInsurance';
import { cateringSchema } from './operations/catering';
import { guestListSchema } from './production/guestList';
import { crewCallSchema } from './production/crewCall';
import { talentBookingSchema } from './people/talentBooking';
import { punchListSchema } from './operations/punchList';
import { dailyReportSchema } from './production/dailyReport';
import { flightSchema } from './operations/flight';
import { groundTransportSchema } from './operations/groundTransport';
import { accommodationSchema } from './operations/accommodation';
import { feedbackSchema } from './network/feedback';
import { storageBinSchema } from './assets/storageBin';
import { assetTransferSchema } from './assets/assetTransfer';
import { serviceHistorySchema } from './operations/serviceHistory';
import { priceListSchema } from './finance/priceList';
import { servicePackageSchema } from './operations/servicePackage';
import { activitySchema } from './core/activity';
import { emailTemplateSchema } from './crm/emailTemplate';
import { brandAssetSchema } from './brandAsset';
import { creditNoteSchema } from './finance/creditNote';

// Gap analysis remediation schema imports
import { productSchema } from './product';
import { budgetLineItemSchema } from './finance/budgetLineItem';
import { payrollDeductionSchema } from './finance/payrollDeduction';
import { payrollRateSchema } from './finance/payrollRate';
import { payStubSchema } from './finance/payStub';
import { weatherAlertSchema } from './production/weatherAlert';

// Network module enhancement schemas
import { messageSchema } from './core/message';
import { conversationSchema } from './core/conversation';
import { reactionSchema } from './core/reaction';
import { discussionReplySchema } from './core/discussionReply';
import { activityFeedSchema } from './core/activityFeed';
import { userFollowSchema } from './core/userFollow';
import { challengeParticipantSchema } from './network/challengeParticipant';
import { challengeSubmissionSchema } from './network/challengeSubmission';
import { challengeMilestoneSchema } from './network/challengeMilestone';
import { userPointsSchema, badgeSchema, userBadgeSchema } from './network/gamification';
import { crewRateCardSchema } from './production/crewRateCard';
import { crewGigRatingSchema } from './production/crewGigRating';
import { projectPostMortemSchema } from './projectPostMortem';
import { rfpResponseSchema } from './rfpResponse';
import { mediaAssetSchema } from './production/mediaAsset';
import { fiscalYearSchema } from './finance/fiscalYear';
import { clientPortalAccessSchema } from './clientPortalAccess';
import { webhookEndpointSchema } from './workflows/webhookEndpoint';
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
    advanceCategory: platformCatalogCategorySchema,
    'advance-categories': platformCatalogCategorySchema,
    advancingCatalogItem: platformCatalogItemSchema,
    'advancing-catalog': platformCatalogItemSchema,
    platformCatalogDivision: platformCatalogDivisionSchema,
    'platform-catalog-divisions': platformCatalogDivisionSchema,
    platformCatalogCategory: platformCatalogCategorySchema,
    'platform-catalog-categories': platformCatalogCategorySchema,
    platformCatalogItem: platformCatalogItemSchema,
    'platform-catalog-items': platformCatalogItemSchema,
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
    category: platformCatalogCategorySchema,
    categories: platformCatalogCategorySchema,
    'asset_categories': platformCatalogCategorySchema,
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
    // Productive.io gap closure schemas
    fiscalYear: fiscalYearSchema,
    'fiscal-years': fiscalYearSchema,
    fiscal_years: fiscalYearSchema,
    // Gap analysis remediation schemas
    product: productSchema,
    products: productSchema,
    budgetLineItem: budgetLineItemSchema,
    'budget-line-items': budgetLineItemSchema,
    budget_line_items: budgetLineItemSchema,
    payrollDeduction: payrollDeductionSchema,
    'payroll-deductions': payrollDeductionSchema,
    payroll_deductions: payrollDeductionSchema,
    deductions: payrollDeductionSchema,
    payrollRate: payrollRateSchema,
    'payroll-rates': payrollRateSchema,
    payroll_rates: payrollRateSchema,
    'pay-rates': payrollRateSchema,
    payStub: payStubSchema,
    'pay-stubs': payStubSchema,
    pay_stubs: payStubSchema,
    stubs: payStubSchema,
    weatherAlert: weatherAlertSchema,
    'weather-alerts': weatherAlertSchema,
    weather_alerts: weatherAlertSchema,
    weather: weatherAlertSchema,
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
