#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# REDUNDANT PAGE DELETION SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
#
# Run this AFTER:
# 1. Redirects are configured
# 2. Primary pages are updated with consolidated functionality
# 3. All tests pass
#
# ═══════════════════════════════════════════════════════════════════════════

echo "Starting redundant page cleanup..."

# Create backup
BACKUP_DIR="migration/deleted-pages-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/dashboard"
  "src/app/dashboard/overview"
  "src/app/dashboard/activity"
  "src/app/dashboard/analytics"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# EVENT REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/projects/productions"
  "src/app/projects/productions/active"
  "src/app/projects/productions/archived"
  "src/app/projects/productions/completed"
  "src/app/projects/productions/new"
  "src/app/projects/productions/[id]"
  "src/app/projects/productions/[id]/edit"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# VENUE REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/locations"
  "src/app/locations/[id]"
  "src/app/locations/new"
  "src/app/locations/[id]/edit"
  "src/app/projects/places/venue-management"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# PEOPLE REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/people/teams"
  "src/app/people/crew"
  "src/app/people/contractors"
  "src/app/people/directory"
  "src/app/people/talent"
  "src/app/business/contacts"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# FINANCE REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/business/invoices"
  "src/app/business/invoices/[id]"
  "src/app/business/invoices/new"
  "src/app/business/invoices/[id]/edit"
  "src/app/business/insights"
  "src/app/expenses"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# CONTENT REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/documents"
  "src/app/documents/[id]"
  "src/app/documents/new"
  "src/app/documents/[id]/edit"
  "src/app/media"
  "src/app/media/[id]"
  "src/app/media/new"
  "src/app/media/[id]/edit"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW PAGES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/(onboarding)/welcome"
  "src/app/(onboarding)/profile"
  "src/app/(onboarding)/organization_profile"
  "src/app/(onboarding)/billing_setup"
  "src/app/(onboarding)/integrations"
  "src/app/(onboarding)/preferences"
  "src/app/(onboarding)/skills_certifications"
  "src/app/(onboarding)/team_invite"
  "src/app/(onboarding)/complete"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# MISC REDUNDANCIES
# ─────────────────────────────────────────────────────────────────────────────
PAGES_TO_DELETE=(
  "src/app/overview"
  "src/app/home"
  "src/app/tickets"
)

for page in "${PAGES_TO_DELETE[@]}"; do
  if [ -d "$page" ]; then
    echo "Backing up and deleting: $page"
    cp -r "$page" "$BACKUP_DIR/"
    rm -rf "$page"
  fi
done

echo "Cleanup complete. Backup stored in: $BACKUP_DIR"
echo "Run 'npm run build' to verify no broken imports."
