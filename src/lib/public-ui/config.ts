/**
 * Public UI Configuration (GVTEWAY)
 * Configuration for public-facing pages
 */

import {
  PublicPage,
  SEOConfig,
  HeroSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  ContactSection,
  NewsletterSection,
} from "./types";

export const defaultSEO: SEOConfig = {
  title: "Unified Operations Platform",
  description: "Streamline your event management with our comprehensive platform",
  keywords: ["event management", "operations", "booking", "scheduling"],
  ogType: "website",
  twitterCard: "summary_large_image",
};

export const landingPageSections = {
  hero: {
    type: "hero" as const,
    headline: "Streamline Your Event Operations",
    subheadline: "The all-in-one platform for managing events, bookings, and resources",
    backgroundImage: "/images/hero-bg.jpg",
    overlay: true,
    overlayOpacity: 0.6,
    cta: [
      { label: "Get Started", url: "/signup", variant: "primary" as const },
      { label: "Learn More", url: "#features", variant: "outline" as const },
    ],
    alignment: "center" as const,
    height: "full" as const,
  } satisfies HeroSection,

  features: {
    type: "features" as const,
    layout: "grid" as const,
    columns: 3,
    features: [
      {
        icon: "calendar",
        title: "Event Management",
        description: "Create and manage events with ease. Handle scheduling, venues, and attendees all in one place.",
      },
      {
        icon: "users",
        title: "Team Collaboration",
        description: "Work together seamlessly with real-time updates, task assignments, and communication tools.",
      },
      {
        icon: "bar-chart",
        title: "Analytics & Insights",
        description: "Make data-driven decisions with comprehensive reporting and analytics dashboards.",
      },
      {
        icon: "credit-card",
        title: "Payments & Billing",
        description: "Process payments, manage invoices, and track financial performance effortlessly.",
      },
      {
        icon: "shield",
        title: "Security & Compliance",
        description: "Enterprise-grade security with GDPR compliance and role-based access control.",
      },
      {
        icon: "zap",
        title: "Automation",
        description: "Automate repetitive tasks with powerful workflow automation and integrations.",
      },
    ],
  } satisfies FeaturesSection,

  testimonials: {
    type: "testimonials" as const,
    layout: "carousel" as const,
    testimonials: [
      {
        quote: "This platform has transformed how we manage our events. The automation features alone have saved us countless hours.",
        author: "Sarah Chen",
        role: "Event Director",
        company: "Festival Productions",
        rating: 5,
      },
      {
        quote: "The best investment we have made for our event management business. Customer support is exceptional.",
        author: "Mike Johnson",
        role: "CEO",
        company: "Elite Events Co",
        rating: 5,
      },
      {
        quote: "Easy to use and packed with features. Our team was up and running within days.",
        author: "Emily Watson",
        role: "Operations Manager",
        company: "Corporate Events Inc",
        rating: 5,
      },
    ],
  } satisfies TestimonialsSection,

  pricing: {
    type: "pricing" as const,
    layout: "cards" as const,
    showComparison: true,
    plans: [
      {
        name: "Starter",
        description: "Perfect for small teams",
        price: 29,
        currency: "USD",
        period: "monthly" as const,
        features: [
          "Up to 5 team members",
          "10 events per month",
          "Basic analytics",
          "Email support",
        ],
        cta: { label: "Start Free Trial", url: "/signup?plan=starter", variant: "secondary" as const },
      },
      {
        name: "Professional",
        description: "For growing businesses",
        price: 99,
        currency: "USD",
        period: "monthly" as const,
        features: [
          "Up to 25 team members",
          "Unlimited events",
          "Advanced analytics",
          "Priority support",
          "Custom branding",
          "API access",
        ],
        highlighted: true,
        cta: { label: "Start Free Trial", url: "/signup?plan=pro", variant: "primary" as const },
      },
      {
        name: "Enterprise",
        description: "For large organizations",
        price: 299,
        currency: "USD",
        period: "monthly" as const,
        features: [
          "Unlimited team members",
          "Unlimited events",
          "Custom analytics",
          "Dedicated support",
          "White-label solution",
          "SSO & advanced security",
          "Custom integrations",
        ],
        cta: { label: "Contact Sales", url: "/contact?type=enterprise", variant: "secondary" as const },
      },
    ],
  } satisfies PricingSection,

  faq: {
    type: "faq" as const,
    layout: "accordion" as const,
    items: [
      {
        question: "How do I get started?",
        answer: "Sign up for a free trial and you can start creating events immediately. No credit card required.",
        category: "Getting Started",
      },
      {
        question: "Can I import my existing data?",
        answer: "Yes, we support importing data from CSV files and have integrations with popular event platforms.",
        category: "Getting Started",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
        category: "Billing",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time. Your data will be available for 30 days after cancellation.",
        category: "Billing",
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption and are SOC 2 compliant. Your data is backed up daily.",
        category: "Security",
      },
      {
        question: "Do you offer custom solutions?",
        answer: "Yes, our Enterprise plan includes custom development and white-label options. Contact our sales team for details.",
        category: "Enterprise",
      },
    ],
  } satisfies FAQSection,

  contact: {
    type: "contact" as const,
    showForm: true,
    showMap: true,
    showInfo: true,
    formFields: [
      { name: "name", label: "Full Name", type: "text" as const, required: true },
      { name: "email", label: "Email", type: "email" as const, required: true },
      { name: "phone", label: "Phone", type: "phone" as const, required: false },
      { name: "subject", label: "Subject", type: "select" as const, required: true, options: ["General Inquiry", "Sales", "Support", "Partnership"] },
      { name: "message", label: "Message", type: "textarea" as const, required: true },
    ],
    contactInfo: {
      email: "hello@atlvs.one",
      phone: "",
      address: "",
      hours: "Monday - Friday, 9am - 6pm PST",
      social: [
        { platform: "twitter", url: "https://twitter.com/atlvs", icon: "twitter" },
        { platform: "linkedin", url: "https://linkedin.com/company/atlvs", icon: "linkedin" },
        { platform: "facebook", url: "https://facebook.com/atlvs", icon: "facebook" },
      ],
    },
    mapLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 14,
      marker: true,
    },
  } satisfies ContactSection,

  newsletter: {
    type: "newsletter" as const,
    title: "Stay Updated",
    description: "Subscribe to our newsletter for the latest updates and event management tips.",
    placeholder: "Enter your email",
    buttonLabel: "Subscribe",
    successMessage: "Thanks for subscribing! Check your email for confirmation.",
  } satisfies NewsletterSection,
};

export const publicPages: PublicPage[] = [
  {
    id: "landing",
    slug: "",
    title: "Home",
    description: "Unified Operations Platform - Streamline your event management",
    type: "landing",
    template: "landing",
    sections: [
      { id: "hero", type: "hero", config: landingPageSections.hero, order: 1, visible: true },
      { id: "features", type: "features", title: "Features", config: landingPageSections.features, order: 2, visible: true },
      { id: "testimonials", type: "testimonials", title: "What Our Customers Say", config: landingPageSections.testimonials, order: 3, visible: true },
      { id: "pricing", type: "pricing", title: "Pricing", config: landingPageSections.pricing, order: 4, visible: true },
      { id: "faq", type: "faq", title: "Frequently Asked Questions", config: landingPageSections.faq, order: 5, visible: true },
      { id: "newsletter", type: "newsletter", config: landingPageSections.newsletter, order: 6, visible: true },
    ],
    seo: defaultSEO,
    published: true,
  },
  {
    id: "about",
    slug: "about",
    title: "About Us",
    description: "Learn about our mission and team",
    type: "about",
    template: "content",
    sections: [],
    seo: { ...defaultSEO, title: "About Us - Unified Operations Platform" },
    published: true,
  },
  {
    id: "contact",
    slug: "contact",
    title: "Contact Us",
    description: "Get in touch with our team",
    type: "contact",
    template: "contact",
    sections: [
      { id: "contact", type: "contact", title: "Contact Us", config: landingPageSections.contact, order: 1, visible: true },
    ],
    seo: { ...defaultSEO, title: "Contact Us - Unified Operations Platform" },
    published: true,
  },
  {
    id: "terms",
    slug: "terms",
    title: "Terms of Service",
    description: "Our terms and conditions",
    type: "terms",
    template: "legal",
    sections: [],
    seo: { ...defaultSEO, title: "Terms of Service - Unified Operations Platform", noIndex: true },
    published: true,
  },
  {
    id: "privacy",
    slug: "privacy",
    title: "Privacy Policy",
    description: "How we handle your data",
    type: "privacy",
    template: "legal",
    sections: [],
    seo: { ...defaultSEO, title: "Privacy Policy - Unified Operations Platform", noIndex: true },
    published: true,
  },
];

export const bookingFlowSteps = [
  { id: "tickets", name: "Select Tickets", component: "TicketSelection", validation: "validateTickets" },
  { id: "attendees", name: "Attendee Details", component: "AttendeeForm", validation: "validateAttendees" },
  { id: "contact", name: "Contact Info", component: "ContactForm", validation: "validateContact" },
  { id: "payment", name: "Payment", component: "PaymentForm", validation: "validatePayment" },
  { id: "confirmation", name: "Confirmation", component: "Confirmation" },
];

export const publicUIConfig = {
  pages: publicPages,
  bookingFlow: bookingFlowSteps,
  defaultSEO,
  branding: {
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    primaryColor: "#000000",
    accentColor: "#3b82f6",
  },
  footer: {
    copyright: "© 2024 Unified Operations Platform. All rights reserved.",
    links: [
      { label: "About", url: "/about" },
      { label: "Contact", url: "/contact" },
      { label: "Terms", url: "/terms" },
      { label: "Privacy", url: "/privacy" },
    ],
    social: [
      { platform: "twitter", url: "https://twitter.com/example", icon: "twitter" },
      { platform: "linkedin", url: "https://linkedin.com/company/example", icon: "linkedin" },
    ],
  },
};
