"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// CONSENT CATEGORIES — GDPR/ePrivacy compliant
// ============================================================================

export type ConsentCategory =
  | "essential"
  | "functional"
  | "analytics"
  | "marketing";

export interface ConsentRecord {
  category: ConsentCategory;
  granted: boolean;
  timestamp: string;
  version: string;
}

export interface ConsentState {
  /** Whether the user has made a consent decision (banner dismissed) */
  hasConsented: boolean;
  /** Individual consent decisions by category */
  consents: Record<ConsentCategory, boolean>;
  /** ISO timestamp of last consent update */
  consentTimestamp: string | null;
  /** Consent policy version the user agreed to */
  consentVersion: string;
  /** Full history of consent changes for audit */
  consentHistory: ConsentRecord[];
  /** Actions */
  acceptAll: () => void;
  rejectNonEssential: () => void;
  updateConsent: (category: ConsentCategory, granted: boolean) => void;
  savePreferences: (prefs: Partial<Record<ConsentCategory, boolean>>) => void;
  resetConsent: () => void;
  getConsentForCategory: (category: ConsentCategory) => boolean;
}

const CONSENT_VERSION = "1.0.0";

const DEFAULT_CONSENTS: Record<ConsentCategory, boolean> = {
  essential: true, // Always required, cannot be disabled
  functional: false,
  analytics: false,
  marketing: false,
};

function createConsentRecords(
  consents: Record<ConsentCategory, boolean>,
  version: string
): ConsentRecord[] {
  const timestamp = new Date().toISOString();
  return Object.entries(consents).map(([category, granted]) => ({
    category: category as ConsentCategory,
    granted,
    timestamp,
    version,
  }));
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      hasConsented: false,
      consents: { ...DEFAULT_CONSENTS },
      consentTimestamp: null,
      consentVersion: CONSENT_VERSION,
      consentHistory: [],

      acceptAll: () => {
        const allGranted: Record<ConsentCategory, boolean> = {
          essential: true,
          functional: true,
          analytics: true,
          marketing: true,
        };
        const timestamp = new Date().toISOString();
        const records = createConsentRecords(allGranted, CONSENT_VERSION);
        set((state) => ({
          hasConsented: true,
          consents: allGranted,
          consentTimestamp: timestamp,
          consentVersion: CONSENT_VERSION,
          consentHistory: [...state.consentHistory, ...records],
        }));
      },

      rejectNonEssential: () => {
        const essentialOnly: Record<ConsentCategory, boolean> = {
          essential: true,
          functional: false,
          analytics: false,
          marketing: false,
        };
        const timestamp = new Date().toISOString();
        const records = createConsentRecords(essentialOnly, CONSENT_VERSION);
        set((state) => ({
          hasConsented: true,
          consents: essentialOnly,
          consentTimestamp: timestamp,
          consentVersion: CONSENT_VERSION,
          consentHistory: [...state.consentHistory, ...records],
        }));
      },

      updateConsent: (category, granted) => {
        if (category === "essential") return; // Essential cannot be disabled
        const timestamp = new Date().toISOString();
        const record: ConsentRecord = {
          category,
          granted,
          timestamp,
          version: CONSENT_VERSION,
        };
        set((state) => ({
          consents: { ...state.consents, [category]: granted },
          consentTimestamp: timestamp,
          consentHistory: [...state.consentHistory, record],
        }));
      },

      savePreferences: (prefs) => {
        const timestamp = new Date().toISOString();
        const currentConsents = get().consents;
        const updated = { ...currentConsents, ...prefs, essential: true };
        const records = createConsentRecords(updated, CONSENT_VERSION);
        set((state) => ({
          hasConsented: true,
          consents: updated,
          consentTimestamp: timestamp,
          consentVersion: CONSENT_VERSION,
          consentHistory: [...state.consentHistory, ...records],
        }));
      },

      resetConsent: () => {
        set({
          hasConsented: false,
          consents: { ...DEFAULT_CONSENTS },
          consentTimestamp: null,
          consentHistory: [],
        });
      },

      getConsentForCategory: (category) => {
        return get().consents[category] ?? false;
      },
    }),
    {
      name: "atlvs-consent",
    }
  )
);
