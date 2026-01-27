#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# CODEBASE CLEANUP SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
#
# Generated: 2026-01-26
# Purpose: Remove deprecated directories and redundant files
#
# USAGE:
#   chmod +x scripts/cleanup-redundant-files.sh
#   ./scripts/cleanup-redundant-files.sh [--dry-run]
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE - No files will be deleted${NC}"
    echo ""
fi

# Create backup directory
BACKUP_DIR="migration/cleanup-backup-$(date +%Y%m%d-%H%M%S)"

if [[ "$DRY_RUN" == false ]]; then
    mkdir -p "$BACKUP_DIR"
    echo -e "${GREEN}Created backup directory: $BACKUP_DIR${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION: Safe delete with backup
# ─────────────────────────────────────────────────────────────────────────────
safe_delete() {
    local path="$1"
    local type="$2"  # "file" or "dir"
    
    if [[ "$type" == "dir" ]]; then
        if [[ -d "$path" ]]; then
            if [[ "$DRY_RUN" == true ]]; then
                echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete directory: $path"
            else
                echo -e "  ${GREEN}Backing up and deleting:${NC} $path"
                cp -r "$path" "$BACKUP_DIR/" 2>/dev/null || true
                rm -rf "$path"
            fi
        else
            echo -e "  ${YELLOW}[SKIP]${NC} Directory not found: $path"
        fi
    else
        if [[ -f "$path" ]]; then
            if [[ "$DRY_RUN" == true ]]; then
                echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete file: $path"
            else
                echo -e "  ${GREEN}Backing up and deleting:${NC} $path"
                cp "$path" "$BACKUP_DIR/" 2>/dev/null || true
                rm -f "$path"
            fi
        else
            echo -e "  ${YELLOW}[SKIP]${NC} File not found: $path"
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: DEPRECATED MIGRATION DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SECTION 1: Deprecated Migration Directories${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# These directories contain old/deprecated code that has been migrated
DEPRECATED_DIRS=(
    "migration/deprecated"
    "migration/deleted-pages-20260121-221606"
    "migration/deleted-pages-20260121-222224"
)

for dir in "${DEPRECATED_DIRS[@]}"; do
    safe_delete "$dir" "dir"
done

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: EMPTY DIRECTORIES (if any remain after cleanup)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SECTION 2: Cleaning Empty Directories${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# Clean up empty directories in lib/components/ui if empty
if [[ -d "src/lib/components/ui" ]]; then
    if [[ -z "$(ls -A src/lib/components/ui 2>/dev/null)" ]]; then
        safe_delete "src/lib/components/ui" "dir"
    fi
fi

# Clean up empty forms directory if only FormStep remains
if [[ -d "src/components/forms" ]]; then
    file_count=$(find src/components/forms -type f | wc -l)
    if [[ "$file_count" -eq 0 ]]; then
        safe_delete "src/components/forms" "dir"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: REDUNDANT NAVIGATION FILES (keep .ts, can remove .js if generated)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SECTION 3: Navigation File Consolidation (Optional)${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

echo -e "  ${YELLOW}[INFO]${NC} redirects.js and redirects.ts are both needed:"
echo -e "        - redirects.ts is the source of truth"
echo -e "        - redirects.js is required for next.config.js"
echo -e "        Consider generating .js from .ts at build time"

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}CLEANUP COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}This was a dry run. No files were deleted.${NC}"
    echo -e "Run without --dry-run to perform actual cleanup."
else
    echo -e "Backup created at: ${GREEN}$BACKUP_DIR${NC}"
    echo ""
    echo -e "${YELLOW}NEXT STEPS:${NC}"
    echo "1. Run 'npm run build' to verify no broken imports"
    echo "2. Run 'npm run lint' to check for issues"
    echo "3. If all passes, you can delete the backup directory"
fi

echo ""
