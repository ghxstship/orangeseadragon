/**
 * Public UI Types (GVTEWAY)
 * Type definitions for public-facing pages and components
 */

export type PublicPageType = 
  | "landing" 
  | "event" 
  | "booking" 
  | "registration"
  | "ticket"
  | "venue"
  | "gallery"
  | "contact"
  | "about"
  | "faq"
  | "terms"
  | "privacy";

export interface PublicPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: PublicPageType;
  template: string;
  sections: PageSection[];
  seo: SEOConfig;
  published: boolean;
  publishedAt?: Date;
}

export interface PageSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  config: Record<string, unknown>;
  order: number;
  visible: boolean;
}

export type SectionType =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "gallery"
  | "team"
  | "faq"
  | "contact"
  | "map"
  | "countdown"
  | "schedule"
  | "speakers"
  | "sponsors"
  | "newsletter"
  | "social"
  | "custom";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface HeroSection {
  type: "hero";
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  cta?: CTAButton[];
  alignment?: "left" | "center" | "right";
  height?: "full" | "large" | "medium" | "small";
}

export interface CTAButton {
  label: string;
  url: string;
  variant: "primary" | "secondary" | "outline";
  icon?: string;
}

export interface FeaturesSection {
  type: "features";
  layout: "grid" | "list" | "carousel";
  columns?: 2 | 3 | 4;
  features: Feature[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface TestimonialsSection {
  type: "testimonials";
  layout: "grid" | "carousel" | "masonry";
  testimonials: Testimonial[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface PricingSection {
  type: "pricing";
  layout: "cards" | "table";
  plans: PricingPlan[];
  showComparison?: boolean;
}

export interface PricingPlan {
  name: string;
  description?: string;
  price: number;
  currency: string;
  period?: "monthly" | "yearly" | "one-time";
  features: string[];
  highlighted?: boolean;
  cta: CTAButton;
}

export interface GallerySection {
  type: "gallery";
  layout: "grid" | "masonry" | "carousel" | "lightbox";
  columns?: 2 | 3 | 4 | 5;
  images: GalleryImage[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface FAQSection {
  type: "faq";
  layout: "accordion" | "list" | "columns";
  items: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface ContactSection {
  type: "contact";
  showForm: boolean;
  showMap: boolean;
  showInfo: boolean;
  formFields?: FormFieldConfig[];
  contactInfo?: ContactInfo;
  mapLocation?: MapLocation;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  social?: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  zoom: number;
  marker?: boolean;
}

export interface CountdownSection {
  type: "countdown";
  targetDate: Date;
  title?: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  expiredMessage?: string;
}

export interface ScheduleSection {
  type: "schedule";
  layout: "timeline" | "table" | "cards";
  days: ScheduleDay[];
  showFilters?: boolean;
}

export interface ScheduleDay {
  date: Date;
  label?: string;
  sessions: ScheduleSession[];
}

export interface ScheduleSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakers?: string[];
  track?: string;
  type?: string;
}

export interface SpeakersSection {
  type: "speakers";
  layout: "grid" | "carousel" | "list";
  speakers: Speaker[];
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company?: string;
  bio?: string;
  photo?: string;
  social?: SocialLink[];
}

export interface SponsorsSection {
  type: "sponsors";
  layout: "grid" | "carousel";
  tiers: SponsorTier[];
}

export interface SponsorTier {
  name: string;
  sponsors: Sponsor[];
}

export interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

export interface NewsletterSection {
  type: "newsletter";
  title: string;
  description?: string;
  placeholder?: string;
  buttonLabel: string;
  successMessage?: string;
}

export interface PublicEventPage {
  event: PublicEvent;
  venue?: PublicVenue;
  tickets: TicketType[];
  schedule?: ScheduleDay[];
  speakers?: Speaker[];
  sponsors?: SponsorTier[];
  gallery?: GalleryImage[];
  faqs?: FAQItem[];
}

export interface PublicEvent {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  coverImage?: string;
  logo?: string;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  category?: string;
  tags?: string[];
  organizer: Organizer;
}

export interface Organizer {
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  social?: SocialLink[];
}

export interface PublicVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
  directions?: string;
  parking?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity?: number;
  available: number;
  maxPerOrder?: number;
  salesStart?: Date;
  salesEnd?: Date;
  status: "available" | "sold_out" | "coming_soon" | "ended";
  benefits?: string[];
}

export interface BookingFlow {
  steps: BookingStep[];
  currentStep: number;
  data: BookingData;
}

export interface BookingStep {
  id: string;
  name: string;
  component: string;
  validation?: string;
}

export interface BookingData {
  eventId: string;
  tickets: TicketSelection[];
  attendees: AttendeeInfo[];
  contact: ContactDetails;
  payment?: PaymentDetails;
  extras?: Record<string, unknown>;
}

export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  price: number;
}

export interface AttendeeInfo {
  ticketTypeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  customFields?: Record<string, unknown>;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface PaymentDetails {
  method: "card" | "paypal" | "bank_transfer" | "invoice";
  cardLast4?: string;
  transactionId?: string;
}

export interface ConfirmationPage {
  orderId: string;
  orderNumber: string;
  event: PublicEvent;
  tickets: TicketConfirmation[];
  total: number;
  currency: string;
  qrCode?: string;
  downloadUrl?: string;
  calendarUrl?: string;
}

export interface TicketConfirmation {
  ticketId: string;
  ticketType: string;
  attendeeName: string;
  qrCode: string;
}
