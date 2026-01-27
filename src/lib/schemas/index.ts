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

// Projects module exports
export { sprintSchema } from './sprint';
export { backlogSchema } from './backlog';
export { boardSchema } from './board';
export { roadmapSchema } from './roadmap';
export { teamSchema } from './team';

// Production module exports
export { showSchema } from './show';
export { runsheetSchema } from './runsheet';
export { departmentSchema } from './department';
export { advancingSchema } from './advancing';
export { techSpecSchema } from './techSpec';
export { riderSchema } from './rider';

// Operations module exports
export { floorPlanSchema } from './floorPlan';
export { zoneSchema } from './zone';
export { checkpointSchema } from './checkpoint';
export { incidentSchema } from './incident';
export { radioChannelSchema } from './radioChannel';

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
export { invoiceSchema } from './invoice';
export { expenseSchema } from './expense';
export { paymentSchema } from './payment';
export { settlementSchema } from './settlement';
export { accountSchema } from './account';

// Business module exports
export { contactSchema } from './contact';
export { companySchema } from './company';
export { leadSchema } from './lead';
export { dealSchema } from './deal';
export { proposalSchema } from './proposal';
export { contractSchema } from './contract';
export { pipelineSchema } from './pipeline';

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
import { departmentSchema } from './department';
import { advancingSchema } from './advancing';
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
import { invoiceSchema } from './invoice';
import { expenseSchema } from './expense';
import { paymentSchema } from './payment';
import { settlementSchema } from './settlement';
import { accountSchema } from './account';
import { contactSchema } from './contact';
import { companySchema } from './company';
import { leadSchema } from './lead';
import { dealSchema } from './deal';
import { proposalSchema } from './proposal';
import { contractSchema } from './contract';
import { pipelineSchema } from './pipeline';

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
    department: departmentSchema,
    departments: departmentSchema,
    advancing: advancingSchema,
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
    invoice: invoiceSchema,
    invoices: invoiceSchema,
    expense: expenseSchema,
    expenses: expenseSchema,
    payment: paymentSchema,
    payments: paymentSchema,
    settlement: settlementSchema,
    settlements: settlementSchema,
    account: accountSchema,
    accounts: accountSchema,
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
