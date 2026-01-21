/**
 * Demo Seed Data Generator
 * Generates comprehensive demo data as per DEMO_SEED_DATA.md
 */


// Demo Organization
export const demoOrganization = {
  id: "org_demo_atlvs",
  name: "Horizon Events Group",
  slug: "horizon-events",
  type: "agency",
  subscriptionTier: "enterprise",
  settings: {
    timezone: "America/New_York",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    fiscalYearStart: 1,
  },
  createdAt: new Date("2023-01-15"),
};

// Demo Users (all 12 role types)
export const demoUsers = [
  { id: "user_owner", email: "sarah.chen@horizon.events", firstName: "Sarah", lastName: "Chen", role: "owner", title: "CEO & Founder", avatar: "/avatars/sarah.jpg" },
  { id: "user_admin", email: "marcus.johnson@horizon.events", firstName: "Marcus", lastName: "Johnson", role: "admin", title: "Operations Director", avatar: "/avatars/marcus.jpg" },
  { id: "user_manager", email: "elena.rodriguez@horizon.events", firstName: "Elena", lastName: "Rodriguez", role: "manager", title: "Project Manager", avatar: "/avatars/elena.jpg" },
  { id: "user_coordinator", email: "james.wilson@horizon.events", firstName: "James", lastName: "Wilson", role: "coordinator", title: "Event Coordinator", avatar: "/avatars/james.jpg" },
  { id: "user_finance", email: "priya.patel@horizon.events", firstName: "Priya", lastName: "Patel", role: "finance", title: "Finance Manager", avatar: "/avatars/priya.jpg" },
  { id: "user_hr", email: "david.kim@horizon.events", firstName: "David", lastName: "Kim", role: "hr", title: "HR Manager", avatar: "/avatars/david.jpg" },
  { id: "user_sales", email: "amanda.foster@horizon.events", firstName: "Amanda", lastName: "Foster", role: "sales", title: "Sales Director", avatar: "/avatars/amanda.jpg" },
  { id: "user_production", email: "michael.brown@horizon.events", firstName: "Michael", lastName: "Brown", role: "production", title: "Production Manager", avatar: "/avatars/michael.jpg" },
  { id: "user_crew", email: "jessica.taylor@horizon.events", firstName: "Jessica", lastName: "Taylor", role: "crew", title: "Stage Manager", avatar: "/avatars/jessica.jpg" },
  { id: "user_talent", email: "alex.rivera@horizon.events", firstName: "Alex", lastName: "Rivera", role: "talent", title: "Talent Coordinator", avatar: "/avatars/alex.jpg" },
  { id: "user_vendor", email: "chris.martinez@soundpro.com", firstName: "Chris", lastName: "Martinez", role: "vendor", title: "Account Manager", avatar: "/avatars/chris.jpg" },
  { id: "user_client", email: "jennifer.lee@techcorp.com", firstName: "Jennifer", lastName: "Lee", role: "client", title: "VP Marketing", avatar: "/avatars/jennifer.jpg" },
];

// Demo Projects
export const demoProjects = [
  {
    id: "proj_summer_fest",
    name: "Summer Music Festival 2024",
    code: "SMF-2024",
    status: "active",
    type: "festival",
    startDate: new Date("2024-07-15"),
    endDate: new Date("2024-07-17"),
    budget: 2500000,
    managerId: "user_manager",
    description: "Three-day outdoor music festival featuring 50+ artists across 4 stages",
    venue: "Riverside Park Amphitheater",
    expectedAttendance: 25000,
  },
  {
    id: "proj_tech_conf",
    name: "TechCorp Annual Conference",
    code: "TC-2024",
    status: "active",
    type: "corporate",
    startDate: new Date("2024-09-10"),
    endDate: new Date("2024-09-12"),
    budget: 850000,
    managerId: "user_manager",
    description: "Corporate technology conference with keynotes, breakouts, and expo",
    venue: "Grand Convention Center",
    expectedAttendance: 3000,
  },
  {
    id: "proj_gala",
    name: "Charity Gala 2024",
    code: "CG-2024",
    status: "planning",
    type: "gala",
    startDate: new Date("2024-11-15"),
    endDate: new Date("2024-11-15"),
    budget: 350000,
    managerId: "user_coordinator",
    description: "Black-tie fundraising gala with live auction and entertainment",
    venue: "The Grand Ballroom",
    expectedAttendance: 500,
  },
  {
    id: "proj_product_launch",
    name: "Product Launch Event",
    code: "PL-2024",
    status: "completed",
    type: "launch",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-20"),
    budget: 175000,
    managerId: "user_manager",
    description: "High-profile product launch with media coverage and VIP guests",
    venue: "Innovation Hub",
    expectedAttendance: 300,
  },
];

// Demo Events (Shows within projects)
export const demoEvents = [
  {
    id: "evt_smf_day1",
    projectId: "proj_summer_fest",
    name: "Summer Fest - Day 1",
    date: new Date("2024-07-15"),
    startTime: "12:00",
    endTime: "23:00",
    status: "confirmed",
    venueId: "venue_riverside",
    doorsOpen: "11:00",
    curfew: "23:30",
  },
  {
    id: "evt_smf_day2",
    projectId: "proj_summer_fest",
    name: "Summer Fest - Day 2",
    date: new Date("2024-07-16"),
    startTime: "12:00",
    endTime: "23:00",
    status: "confirmed",
    venueId: "venue_riverside",
    doorsOpen: "11:00",
    curfew: "23:30",
  },
  {
    id: "evt_smf_day3",
    projectId: "proj_summer_fest",
    name: "Summer Fest - Day 3",
    date: new Date("2024-07-17"),
    startTime: "12:00",
    endTime: "22:00",
    status: "confirmed",
    venueId: "venue_riverside",
    doorsOpen: "11:00",
    curfew: "22:30",
  },
  {
    id: "evt_tc_keynote",
    projectId: "proj_tech_conf",
    name: "TechCorp Keynote",
    date: new Date("2024-09-10"),
    startTime: "09:00",
    endTime: "12:00",
    status: "confirmed",
    venueId: "venue_convention",
    doorsOpen: "08:00",
  },
];

// Demo Tasks
export const demoTasks = [
  { id: "task_1", projectId: "proj_summer_fest", name: "Finalize artist lineup", status: "completed", priority: "high", assigneeId: "user_talent", dueDate: new Date("2024-04-01") },
  { id: "task_2", projectId: "proj_summer_fest", name: "Secure stage equipment rental", status: "completed", priority: "high", assigneeId: "user_production", dueDate: new Date("2024-05-15") },
  { id: "task_3", projectId: "proj_summer_fest", name: "Coordinate vendor logistics", status: "in_progress", priority: "medium", assigneeId: "user_coordinator", dueDate: new Date("2024-06-30") },
  { id: "task_4", projectId: "proj_summer_fest", name: "Finalize security plan", status: "in_progress", priority: "high", assigneeId: "user_production", dueDate: new Date("2024-07-01") },
  { id: "task_5", projectId: "proj_summer_fest", name: "Complete site build", status: "pending", priority: "high", assigneeId: "user_crew", dueDate: new Date("2024-07-14") },
  { id: "task_6", projectId: "proj_tech_conf", name: "Confirm keynote speakers", status: "completed", priority: "high", assigneeId: "user_manager", dueDate: new Date("2024-06-01") },
  { id: "task_7", projectId: "proj_tech_conf", name: "Design expo floor layout", status: "in_progress", priority: "medium", assigneeId: "user_coordinator", dueDate: new Date("2024-07-15") },
  { id: "task_8", projectId: "proj_tech_conf", name: "Setup registration system", status: "pending", priority: "high", assigneeId: "user_coordinator", dueDate: new Date("2024-08-01") },
  { id: "task_9", projectId: "proj_gala", name: "Secure venue contract", status: "completed", priority: "high", assigneeId: "user_manager", dueDate: new Date("2024-05-01") },
  { id: "task_10", projectId: "proj_gala", name: "Curate auction items", status: "in_progress", priority: "medium", assigneeId: "user_coordinator", dueDate: new Date("2024-09-01") },
];

// Demo Assets
export const demoAssets = [
  { id: "asset_1", name: "L-Acoustics K2 Line Array", category: "audio", serialNumber: "LA-K2-001", status: "available", value: 125000, location: "Warehouse A", lastMaintenance: new Date("2024-01-15") },
  { id: "asset_2", name: "L-Acoustics K2 Line Array", category: "audio", serialNumber: "LA-K2-002", status: "available", value: 125000, location: "Warehouse A", lastMaintenance: new Date("2024-01-15") },
  { id: "asset_3", name: "Yamaha CL5 Console", category: "audio", serialNumber: "YM-CL5-001", status: "checked_out", value: 45000, location: "Summer Fest Site", lastMaintenance: new Date("2024-02-20") },
  { id: "asset_4", name: "Martin MAC Aura XB", category: "lighting", serialNumber: "MA-AXB-001", status: "available", value: 8500, location: "Warehouse B", quantity: 24 },
  { id: "asset_5", name: "GrandMA3 Full-Size", category: "lighting", serialNumber: "GM3-FS-001", status: "available", value: 65000, location: "Warehouse B", lastMaintenance: new Date("2024-03-10") },
  { id: "asset_6", name: "ROE Visual CB5 LED Panel", category: "video", serialNumber: "ROE-CB5-001", status: "available", value: 2500, location: "Warehouse C", quantity: 200 },
  { id: "asset_7", name: "Barco UDX-4K32", category: "video", serialNumber: "BA-UDX-001", status: "maintenance", value: 85000, location: "Service Center", lastMaintenance: new Date("2024-04-01") },
  { id: "asset_8", name: "Tyler GT Truss 12x12", category: "staging", serialNumber: "TY-GT-001", status: "available", value: 15000, location: "Warehouse D", quantity: 50 },
  { id: "asset_9", name: "CM Lodestar 1 Ton", category: "rigging", serialNumber: "CM-LS-001", status: "available", value: 3500, location: "Warehouse D", quantity: 40 },
  { id: "asset_10", name: "Shure Axient Digital", category: "audio", serialNumber: "SH-AXD-001", status: "available", value: 12000, location: "Warehouse A", quantity: 16 },
];

// Demo Crew/Workforce
export const demoCrew = [
  { id: "crew_1", userId: "user_crew", name: "Jessica Taylor", role: "Stage Manager", department: "production", hourlyRate: 75, certifications: ["OSHA 30", "First Aid"], availability: "full_time" },
  { id: "crew_2", name: "Robert Chen", role: "Audio Engineer", department: "audio", hourlyRate: 65, certifications: ["Dante Level 3", "L-Acoustics"], availability: "freelance" },
  { id: "crew_3", name: "Maria Santos", role: "Lighting Designer", department: "lighting", hourlyRate: 70, certifications: ["GrandMA Certified", "ETCP Rigging"], availability: "freelance" },
  { id: "crew_4", name: "Kevin O'Brien", role: "Video Engineer", department: "video", hourlyRate: 60, certifications: ["Barco Certified", "Disguise"], availability: "freelance" },
  { id: "crew_5", name: "Lisa Park", role: "Production Coordinator", department: "production", hourlyRate: 55, certifications: ["PMP", "First Aid"], availability: "full_time" },
  { id: "crew_6", name: "Tom Williams", role: "Rigger", department: "rigging", hourlyRate: 50, certifications: ["ETCP Arena", "OSHA 30"], availability: "freelance" },
  { id: "crew_7", name: "Sarah Mitchell", role: "FOH Engineer", department: "audio", hourlyRate: 80, certifications: ["Avid Venue", "DiGiCo"], availability: "freelance" },
  { id: "crew_8", name: "Daniel Lee", role: "Stagehand", department: "staging", hourlyRate: 35, certifications: ["OSHA 10"], availability: "freelance" },
];

// Demo Finance Data
export const demoBudgets = [
  {
    id: "budget_smf",
    projectId: "proj_summer_fest",
    name: "Summer Fest 2024 Budget",
    totalAmount: 2500000,
    categories: [
      { name: "Talent", allocated: 1000000, spent: 850000 },
      { name: "Production", allocated: 600000, spent: 425000 },
      { name: "Venue & Site", allocated: 400000, spent: 380000 },
      { name: "Marketing", allocated: 250000, spent: 175000 },
      { name: "Staffing", allocated: 150000, spent: 95000 },
      { name: "Contingency", allocated: 100000, spent: 15000 },
    ],
  },
  {
    id: "budget_tc",
    projectId: "proj_tech_conf",
    name: "TechCorp Conference Budget",
    totalAmount: 850000,
    categories: [
      { name: "Venue", allocated: 250000, spent: 250000 },
      { name: "AV Production", allocated: 200000, spent: 150000 },
      { name: "Catering", allocated: 150000, spent: 75000 },
      { name: "Speakers", allocated: 100000, spent: 85000 },
      { name: "Marketing", allocated: 100000, spent: 60000 },
      { name: "Contingency", allocated: 50000, spent: 0 },
    ],
  },
];

export const demoInvoices = [
  { id: "inv_1", number: "INV-2024-001", projectId: "proj_summer_fest", clientId: "client_1", amount: 125000, status: "paid", dueDate: new Date("2024-04-15"), paidDate: new Date("2024-04-10"), description: "Sponsorship Package - Gold" },
  { id: "inv_2", number: "INV-2024-002", projectId: "proj_summer_fest", clientId: "client_2", amount: 75000, status: "paid", dueDate: new Date("2024-05-01"), paidDate: new Date("2024-04-28"), description: "Sponsorship Package - Silver" },
  { id: "inv_3", number: "INV-2024-003", projectId: "proj_tech_conf", clientId: "client_3", amount: 450000, status: "sent", dueDate: new Date("2024-08-15"), description: "Conference Production Services" },
  { id: "inv_4", number: "INV-2024-004", projectId: "proj_gala", clientId: "client_4", amount: 175000, status: "draft", dueDate: new Date("2024-10-01"), description: "Gala Event Management" },
];

export const demoExpenses = [
  { id: "exp_1", projectId: "proj_summer_fest", category: "equipment_rental", vendor: "SoundPro Audio", amount: 45000, status: "approved", date: new Date("2024-06-01"), description: "PA System Rental" },
  { id: "exp_2", projectId: "proj_summer_fest", category: "talent", vendor: "Artist Agency", amount: 250000, status: "approved", date: new Date("2024-05-15"), description: "Headliner Deposit" },
  { id: "exp_3", projectId: "proj_summer_fest", category: "venue", vendor: "Riverside Park", amount: 150000, status: "approved", date: new Date("2024-04-01"), description: "Venue Rental Fee" },
  { id: "exp_4", projectId: "proj_tech_conf", category: "venue", vendor: "Grand Convention Center", amount: 125000, status: "approved", date: new Date("2024-06-15"), description: "Venue Deposit" },
  { id: "exp_5", projectId: "proj_tech_conf", category: "catering", vendor: "Elite Catering", amount: 35000, status: "pending", date: new Date("2024-07-01"), description: "Catering Deposit" },
];

// Demo CRM Data
export const demoContacts = [
  { id: "contact_1", firstName: "Jennifer", lastName: "Lee", email: "jennifer.lee@techcorp.com", phone: "+1-555-0101", company: "TechCorp Inc.", title: "VP Marketing", type: "client" },
  { id: "contact_2", firstName: "Michael", lastName: "Chang", email: "mchang@mediabrand.com", phone: "+1-555-0102", company: "MediaBrand", title: "Brand Director", type: "sponsor" },
  { id: "contact_3", firstName: "Sarah", lastName: "Johnson", email: "sjohnson@soundpro.com", phone: "+1-555-0103", company: "SoundPro Audio", title: "Account Manager", type: "vendor" },
  { id: "contact_4", firstName: "David", lastName: "Williams", email: "dwilliams@lightworks.com", phone: "+1-555-0104", company: "LightWorks", title: "Sales Director", type: "vendor" },
  { id: "contact_5", firstName: "Emily", lastName: "Brown", email: "ebrown@charityfound.org", phone: "+1-555-0105", company: "Charity Foundation", title: "Executive Director", type: "client" },
];

export const demoDeals = [
  { id: "deal_1", name: "TechCorp 2025 Conference", contactId: "contact_1", stage: "proposal", value: 950000, probability: 75, expectedClose: new Date("2024-10-15"), assigneeId: "user_sales" },
  { id: "deal_2", name: "MediaBrand Festival Sponsorship", contactId: "contact_2", stage: "negotiation", value: 200000, probability: 60, expectedClose: new Date("2024-08-01"), assigneeId: "user_sales" },
  { id: "deal_3", name: "Charity Gala 2025", contactId: "contact_5", stage: "qualified", value: 400000, probability: 40, expectedClose: new Date("2024-12-01"), assigneeId: "user_sales" },
  { id: "deal_4", name: "Corporate Holiday Party", contactId: "contact_1", stage: "discovery", value: 125000, probability: 25, expectedClose: new Date("2024-09-15"), assigneeId: "user_sales" },
];

// Demo Talent
export const demoTalent = [
  { id: "talent_1", name: "The Midnight Echo", type: "band", genre: "Indie Rock", fee: 75000, agent: "Creative Artists Agency", rating: 4.8 },
  { id: "talent_2", name: "DJ Pulse", type: "dj", genre: "Electronic", fee: 25000, agent: "Independent", rating: 4.5 },
  { id: "talent_3", name: "Sarah Mitchell", type: "speaker", expertise: "Technology", fee: 15000, agent: "Speaker Bureau", rating: 4.9 },
  { id: "talent_4", name: "The Jazz Collective", type: "band", genre: "Jazz", fee: 8000, agent: "Independent", rating: 4.7 },
  { id: "talent_5", name: "Comedy Hour", type: "comedian", genre: "Stand-up", fee: 12000, agent: "Laugh Factory", rating: 4.6 },
];

export const demoBookings = [
  { id: "booking_1", talentId: "talent_1", eventId: "evt_smf_day2", status: "confirmed", fee: 75000, performanceTime: "21:00", duration: 90, stage: "Main Stage" },
  { id: "booking_2", talentId: "talent_2", eventId: "evt_smf_day1", status: "confirmed", fee: 25000, performanceTime: "18:00", duration: 120, stage: "Electronic Stage" },
  { id: "booking_3", talentId: "talent_3", eventId: "evt_tc_keynote", status: "confirmed", fee: 15000, performanceTime: "09:30", duration: 45, stage: "Main Hall" },
  { id: "booking_4", talentId: "talent_4", eventId: "proj_gala", status: "pending", fee: 8000, performanceTime: "19:00", duration: 180, stage: "Ballroom" },
];

// Demo Venues
export const demoVenues = [
  {
    id: "venue_riverside",
    name: "Riverside Park Amphitheater",
    type: "outdoor",
    capacity: 30000,
    address: "1500 Riverside Drive, Austin, TX 78701",
    spaces: [
      { name: "Main Stage", capacity: 20000, type: "stage" },
      { name: "Electronic Stage", capacity: 5000, type: "stage" },
      { name: "Acoustic Stage", capacity: 2000, type: "stage" },
      { name: "VIP Area", capacity: 500, type: "hospitality" },
    ],
  },
  {
    id: "venue_convention",
    name: "Grand Convention Center",
    type: "indoor",
    capacity: 5000,
    address: "500 Convention Blvd, Austin, TX 78702",
    spaces: [
      { name: "Main Hall", capacity: 3000, type: "ballroom" },
      { name: "Expo Hall", capacity: 10000, sqft: 50000, type: "expo" },
      { name: "Breakout Room A", capacity: 200, type: "meeting" },
      { name: "Breakout Room B", capacity: 200, type: "meeting" },
      { name: "VIP Lounge", capacity: 100, type: "hospitality" },
    ],
  },
  {
    id: "venue_ballroom",
    name: "The Grand Ballroom",
    type: "indoor",
    capacity: 600,
    address: "200 Luxury Lane, Austin, TX 78703",
    spaces: [
      { name: "Main Ballroom", capacity: 500, type: "ballroom" },
      { name: "Cocktail Terrace", capacity: 200, type: "outdoor" },
      { name: "Green Room", capacity: 20, type: "backstage" },
    ],
  },
];

// Demo Tickets
export const demoTicketTypes = [
  { id: "ticket_ga", eventId: "proj_summer_fest", name: "General Admission", price: 150, quantity: 20000, sold: 15420 },
  { id: "ticket_vip", eventId: "proj_summer_fest", name: "VIP Pass", price: 450, quantity: 2000, sold: 1850 },
  { id: "ticket_platinum", eventId: "proj_summer_fest", name: "Platinum Experience", price: 1200, quantity: 200, sold: 175 },
  { id: "ticket_conf_full", eventId: "proj_tech_conf", name: "Full Conference", price: 899, quantity: 2500, sold: 1890 },
  { id: "ticket_conf_day", eventId: "proj_tech_conf", name: "Day Pass", price: 399, quantity: 500, sold: 320 },
  { id: "ticket_gala", eventId: "proj_gala", name: "Gala Ticket", price: 500, quantity: 400, sold: 0 },
  { id: "ticket_gala_table", eventId: "proj_gala", name: "Table of 10", price: 5000, quantity: 30, sold: 0 },
];

// Helper function to generate IDs for new records
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

// Export all demo data as a single object
export const demoData = {
  organization: demoOrganization,
  users: demoUsers,
  projects: demoProjects,
  events: demoEvents,
  tasks: demoTasks,
  assets: demoAssets,
  crew: demoCrew,
  budgets: demoBudgets,
  invoices: demoInvoices,
  expenses: demoExpenses,
  contacts: demoContacts,
  deals: demoDeals,
  talent: demoTalent,
  bookings: demoBookings,
  venues: demoVenues,
  ticketTypes: demoTicketTypes,
};

// Summary statistics
export const demoStats = {
  totalUsers: demoUsers.length,
  totalProjects: demoProjects.length,
  totalEvents: demoEvents.length,
  totalTasks: demoTasks.length,
  totalAssets: demoAssets.length,
  totalCrew: demoCrew.length,
  totalContacts: demoContacts.length,
  totalDeals: demoDeals.length,
  totalTalent: demoTalent.length,
  totalVenues: demoVenues.length,
  totalTicketsSold: demoTicketTypes.reduce((sum, t) => sum + t.sold, 0),
  totalRevenue: demoInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
  pipelineValue: demoDeals.reduce((sum, d) => sum + d.value, 0),
};
