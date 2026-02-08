/**
 * Runsheet Timing Utilities
 * 
 * Automatic time calculations for runsheet cues.
 * Supports scheduled time computation, variance tracking, and ripple updates.
 */

interface Cue {
  id: string;
  sequence: number;
  duration_seconds: number;
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  is_locked?: boolean;
}

interface TimingResult {
  cueId: string;
  scheduled_time: string;
  cumulative_seconds: number;
  end_time: string;
}

/**
 * Parse a time string (HH:MM:SS or HH:MM) to seconds since midnight
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 3600 + parts[1] * 60;
  }
  return 0;
}

/**
 * Format seconds since midnight to HH:MM:SS
 */
export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to a human-readable duration (e.g., "1h 30m" or "45m 30s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    return `-${formatDuration(Math.abs(seconds))}`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Calculate scheduled times for all cues based on start time and durations
 */
export function calculateCueTimes(
  cues: Cue[],
  startTime: string
): TimingResult[] {
  const sortedCues = [...cues].sort((a, b) => a.sequence - b.sequence);
  const startSeconds = parseTimeToSeconds(startTime);
  
  let cumulativeSeconds = 0;
  const results: TimingResult[] = [];

  for (const cue of sortedCues) {
    // If cue is locked, use its existing scheduled time
    if (cue.is_locked && cue.scheduled_time) {
      const lockedSeconds = parseTimeToSeconds(cue.scheduled_time);
      cumulativeSeconds = lockedSeconds - startSeconds + cue.duration_seconds;
      
      results.push({
        cueId: cue.id,
        scheduled_time: cue.scheduled_time,
        cumulative_seconds: lockedSeconds - startSeconds,
        end_time: formatSecondsToTime(lockedSeconds + cue.duration_seconds),
      });
    } else {
      const scheduledSeconds = startSeconds + cumulativeSeconds;
      const endSeconds = scheduledSeconds + cue.duration_seconds;
      
      results.push({
        cueId: cue.id,
        scheduled_time: formatSecondsToTime(scheduledSeconds),
        cumulative_seconds: cumulativeSeconds,
        end_time: formatSecondsToTime(endSeconds),
      });
      
      cumulativeSeconds += cue.duration_seconds;
    }
  }

  return results;
}

/**
 * Calculate total duration of all cues
 */
export function calculateTotalDuration(cues: Cue[]): number {
  return cues.reduce((total, cue) => total + (cue.duration_seconds || 0), 0);
}

/**
 * Calculate variance between planned and actual times
 */
export function calculateVariance(
  plannedDuration: number,
  actualStart?: string,
  actualEnd?: string
): { variance_seconds: number; status: 'on_time' | 'ahead' | 'behind' } | null {
  if (!actualStart || !actualEnd) return null;

  const actualDuration = 
    (new Date(actualEnd).getTime() - new Date(actualStart).getTime()) / 1000;
  
  const variance = actualDuration - plannedDuration;
  
  // Within 30 seconds is considered "on time"
  if (Math.abs(variance) <= 30) {
    return { variance_seconds: variance, status: 'on_time' };
  }
  
  return {
    variance_seconds: variance,
    status: variance > 0 ? 'behind' : 'ahead',
  };
}

/**
 * Ripple time changes through subsequent cues
 * When a cue's duration changes, update all following cue times
 */
export function rippleTimeChanges(
  cues: Cue[],
  changedCueId: string,
  newDuration: number,
  startTime: string
): TimingResult[] {
  const updatedCues = cues.map((cue) =>
    cue.id === changedCueId ? { ...cue, duration_seconds: newDuration } : cue
  );
  
  return calculateCueTimes(updatedCues, startTime);
}

/**
 * Get the estimated end time for the runsheet
 */
export function getEstimatedEndTime(startTime: string, cues: Cue[]): string {
  const totalDuration = calculateTotalDuration(cues);
  const startSeconds = parseTimeToSeconds(startTime);
  return formatSecondsToTime(startSeconds + totalDuration);
}

/**
 * Check if runsheet is running over time
 */
export function isOvertime(
  startTime: string,
  plannedDuration: number,
  currentTime: Date = new Date()
): { isOver: boolean; overtimeSeconds: number } {
  const startSeconds = parseTimeToSeconds(startTime);
  const plannedEndSeconds = startSeconds + plannedDuration;
  
  const currentSeconds = 
    currentTime.getHours() * 3600 + 
    currentTime.getMinutes() * 60 + 
    currentTime.getSeconds();
  
  const overtime = currentSeconds - plannedEndSeconds;
  
  return {
    isOver: overtime > 0,
    overtimeSeconds: Math.max(0, overtime),
  };
}

/**
 * Calculate time remaining until a specific cue
 */
export function getTimeUntilCue(
  cues: Cue[],
  targetCueId: string,
  startTime: string,
  currentTime: Date = new Date()
): number | null {
  const timings = calculateCueTimes(cues, startTime);
  const targetTiming = timings.find((t) => t.cueId === targetCueId);
  
  if (!targetTiming) return null;
  
  const targetSeconds = parseTimeToSeconds(targetTiming.scheduled_time);
  const currentSeconds = 
    currentTime.getHours() * 3600 + 
    currentTime.getMinutes() * 60 + 
    currentTime.getSeconds();
  
  return targetSeconds - currentSeconds;
}

/**
 * Find the current cue based on time
 */
export function getCurrentCue(
  cues: Cue[],
  startTime: string,
  currentTime: Date = new Date()
): Cue | null {
  const timings = calculateCueTimes(cues, startTime);
  const currentSeconds = 
    currentTime.getHours() * 3600 + 
    currentTime.getMinutes() * 60 + 
    currentTime.getSeconds();
  
  for (let i = timings.length - 1; i >= 0; i--) {
    const timing = timings[i];
    const cueStartSeconds = parseTimeToSeconds(timing.scheduled_time);
    
    if (currentSeconds >= cueStartSeconds) {
      return cues.find((c) => c.id === timing.cueId) || null;
    }
  }
  
  return null;
}

/**
 * Generate a summary of timing for display
 */
export function getTimingSummary(
  cues: Cue[],
  startTime: string
): {
  totalDuration: string;
  estimatedEnd: string;
  cueCount: number;
  averageCueDuration: string;
} {
  const totalSeconds = calculateTotalDuration(cues);
  const cueCount = cues.length;
  const avgSeconds = cueCount > 0 ? Math.round(totalSeconds / cueCount) : 0;
  
  return {
    totalDuration: formatDuration(totalSeconds),
    estimatedEnd: getEstimatedEndTime(startTime, cues),
    cueCount,
    averageCueDuration: formatDuration(avgSeconds),
  };
}
