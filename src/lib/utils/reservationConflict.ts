/**
 * Reservation Conflict Detection Utility
 * Checks for scheduling conflicts when reserving assets
 */

export interface ConflictCheckParams {
  asset_id: string;
  start_date: Date | string;
  end_date: Date | string;
  exclude_reservation_id?: string;
}

export interface ConflictingReservation {
  id: string;
  asset_id: string;
  start_date: Date;
  end_date: Date;
  event_name?: string;
  requested_by?: string;
  status: string;
}

export interface AlternativeAsset {
  id: string;
  name: string;
  asset_type: string;
  category_id?: string;
  status: string;
}

export interface ConflictCheckResult {
  has_conflict: boolean;
  conflicting_reservations: ConflictingReservation[];
  suggested_alternatives: AlternativeAsset[];
  conflict_summary?: string;
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Format conflict summary for display
 */
export function formatConflictSummary(conflicts: ConflictingReservation[]): string {
  if (conflicts.length === 0) return '';
  
  if (conflicts.length === 1) {
    const c = conflicts[0];
    if (!c) return '';
    const start = new Date(c.start_date).toLocaleDateString();
    const end = new Date(c.end_date).toLocaleDateString();
    return `Conflicts with reservation from ${start} to ${end}${c.event_name ? ` for "${c.event_name}"` : ''}`;
  }
  
  return `Conflicts with ${conflicts.length} existing reservations`;
}

/**
 * Client-side conflict check (for immediate UI feedback)
 * For production, this should call the API endpoint
 */
export async function checkReservationConflict(
  params: ConflictCheckParams,
  existingReservations: ConflictingReservation[]
): Promise<ConflictCheckResult> {
  const startDate = new Date(params.start_date);
  const endDate = new Date(params.end_date);
  
  const conflicts = existingReservations.filter((reservation) => {
    // Skip the current reservation if editing
    if (params.exclude_reservation_id && reservation.id === params.exclude_reservation_id) {
      return false;
    }
    
    // Only check reservations for the same asset
    if (reservation.asset_id !== params.asset_id) {
      return false;
    }
    
    // Only check active reservations (pending, approved)
    if (!['pending', 'approved', 'checked_out'].includes(reservation.status)) {
      return false;
    }
    
    // Check for date overlap
    return dateRangesOverlap(
      startDate,
      endDate,
      new Date(reservation.start_date),
      new Date(reservation.end_date)
    );
  });
  
  return {
    has_conflict: conflicts.length > 0,
    conflicting_reservations: conflicts,
    suggested_alternatives: [], // Would be populated by API call
    conflict_summary: formatConflictSummary(conflicts),
  };
}

/**
 * Check conflicts for multiple assets (kit reservation)
 */
export async function checkKitReservationConflicts(
  assetIds: string[],
  startDate: Date | string,
  endDate: Date | string,
  existingReservations: ConflictingReservation[]
): Promise<Map<string, ConflictCheckResult>> {
  const results = new Map<string, ConflictCheckResult>();
  
  for (const assetId of assetIds) {
    const result = await checkReservationConflict(
      { asset_id: assetId, start_date: startDate, end_date: endDate },
      existingReservations
    );
    results.set(assetId, result);
  }
  
  return results;
}

/**
 * Get available date ranges for an asset
 */
export function getAvailableDateRanges(
  assetId: string,
  reservations: ConflictingReservation[],
  rangeStart: Date,
  rangeEnd: Date
): Array<{ start: Date; end: Date }> {
  // Filter reservations for this asset
  const assetReservations = reservations
    .filter((r) => r.asset_id === assetId && ['pending', 'approved', 'checked_out'].includes(r.status))
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  const availableRanges: Array<{ start: Date; end: Date }> = [];
  let currentStart = rangeStart;
  
  for (const reservation of assetReservations) {
    const resStart = new Date(reservation.start_date);
    const resEnd = new Date(reservation.end_date);
    
    // Skip reservations outside our range
    if (resEnd <= rangeStart || resStart >= rangeEnd) continue;
    
    // Add available range before this reservation
    if (currentStart < resStart) {
      availableRanges.push({
        start: currentStart,
        end: resStart,
      });
    }
    
    // Move current start past this reservation
    if (resEnd > currentStart) {
      currentStart = resEnd;
    }
  }
  
  // Add remaining range after last reservation
  if (currentStart < rangeEnd) {
    availableRanges.push({
      start: currentStart,
      end: rangeEnd,
    });
  }
  
  return availableRanges;
}
