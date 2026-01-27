// /lib/navigation/redirects.js

/**
 * JavaScript wrapper for redirects.ts
 * Next.js config can only import .js files
 */

const redirects = [
  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/dashboard',
    to: '/',
    permanent: true,
  },
  {
    from: '/dashboard/overview',
    to: '/',
    permanent: true,
  },
  {
    from: '/dashboard/activity',
    to: '/?widget=activity',
    permanent: true,
  },
  {
    from: '/dashboard/analytics',
    to: '/business/analytics',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // EVENT CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/projects/productions',
    to: '/events',
    permanent: true,
  },
  {
    from: '/projects/productions/active',
    to: '/events?subpage=active',
    permanent: true,
  },
  {
    from: '/projects/productions/archived',
    to: '/events?subpage=archived',
    permanent: true,
  },
  {
    from: '/projects/productions/completed',
    to: '/events?subpage=completed',
    permanent: true,
  },
  {
    from: '/projects/productions/new',
    to: '/events/new',
    permanent: true,
  },
  {
    from: '/projects/productions/[id]',
    to: '/events/[id]',
    permanent: true,
  },
  {
    from: '/projects/productions/[id]/edit',
    to: '/events/[id]/edit',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // VENUE CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/locations',
    to: '/venues',
    permanent: true,
  },
  {
    from: '/locations/[id]',
    to: '/venues/[id]',
    permanent: true,
  },
  {
    from: '/locations/new',
    to: '/venues/new',
    permanent: true,
  },
  {
    from: '/locations/[id]/edit',
    to: '/venues/[id]/edit',
    permanent: true,
  },
  {
    from: '/projects/places/venue-management',
    to: '/venues',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PEOPLE CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/people/teams',
    to: '/people?subpage=team',
    permanent: true,
  },
  {
    from: '/people/crew',
    to: '/people?subpage=crew',
    permanent: true,
  },
  {
    from: '/people/contractors',
    to: '/people?subpage=contractors',
    permanent: true,
  },
  {
    from: '/people/directory',
    to: '/people',
    permanent: true,
  },
  {
    from: '/people/talent',
    to: '/people?subpage=talent',
    permanent: true,
  },
  {
    from: '/business/contacts',
    to: '/people?subpage=contacts',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // FINANCE CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/business/invoices',
    to: '/invoices',
    permanent: true,
  },
  {
    from: '/business/invoices/[id]',
    to: '/invoices/[id]',
    permanent: true,
  },
  {
    from: '/business/invoices/new',
    to: '/invoices/new',
    permanent: true,
  },
  {
    from: '/business/invoices/[id]/edit',
    to: '/invoices/[id]/edit',
    permanent: true,
  },
  {
    from: '/business/analytics',
    to: '/business/analytics',
    permanent: true,
  },
  {
    from: '/business/insights',
    to: '/business/analytics',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // CONTENT CONSOLIDATION
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/documents',
    to: '/content?subpage=documents',
    permanent: true,
  },
  {
    from: '/documents/[id]',
    to: '/content/[id]',
    permanent: true,
  },
  {
    from: '/documents/new',
    to: '/content/new',
    permanent: true,
  },
  {
    from: '/documents/[id]/edit',
    to: '/content/[id]/edit',
    permanent: true,
  },
  {
    from: '/media',
    to: '/content?subpage=media',
    permanent: true,
  },
  {
    from: '/media/[id]',
    to: '/content/[id]',
    permanent: true,
  },
  {
    from: '/media/new',
    to: '/content/new',
    permanent: true,
  },
  {
    from: '/media/[id]/edit',
    to: '/content/[id]/edit',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // WORKFLOW PAGES (Redirect to parent with action param)
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/(onboarding)/welcome',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/profile',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/organization_profile',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/billing_setup',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/integrations',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/preferences',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/skills_certifications',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/team_invite',
    to: '/?action=onboarding',
    permanent: true,
  },
  {
    from: '/(onboarding)/complete',
    to: '/',
    permanent: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // MISC REDUNDANCIES
  // ═══════════════════════════════════════════════════════════════
  {
    from: '/overview',
    to: '/',
    permanent: true,
  },
  {
    from: '/home',
    to: '/',
    permanent: true,
  },
  {
    from: '/expenses',
    to: '/invoices',  // Assuming expenses are tracked as invoices
    permanent: true,
  },
  {
    from: '/tickets',
    to: '/events',  // Assuming tickets are event-related
    permanent: true,
  },
];

// Generate Next.js config format
export function generateNextRedirects() {
  return redirects.map(r => ({
    source: r.from,
    destination: r.to,
    permanent: r.permanent,
  }));
}
