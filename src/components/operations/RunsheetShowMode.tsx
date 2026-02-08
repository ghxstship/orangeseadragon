'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Play,
  SkipForward,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Cue {
  id: string;
  sequence: number;
  name: string;
  description?: string;
  cue_type: string;
  duration_seconds: number;
  scheduled_time: string;
  status: 'pending' | 'standby' | 'go' | 'complete' | 'skipped';
  assigned_to?: string;
  notes?: string;
  script_text?: string;
}

interface RunsheetShowModeProps {
  runsheetId: string;
  runsheetName: string;
  startTime: string;
  cues: Cue[];
  onCueGo?: (cueId: string) => void;
  onCueSkip?: (cueId: string) => void;
  onCueStandby?: (cueId: string) => void;
}

const CUE_TYPE_COLORS: Record<string, string> = {
  action: 'bg-blue-500',
  audio: 'bg-purple-500',
  video: 'bg-pink-500',
  lighting: 'bg-yellow-500',
  transition: 'bg-cyan-500',
  break: 'bg-gray-500',
  speech: 'bg-green-500',
  presentation: 'bg-orange-500',
  music: 'bg-indigo-500',
  standby: 'bg-amber-500',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(timeString: string): string {
  return timeString || '--:--';
}

export function RunsheetShowMode({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  runsheetId,
  runsheetName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startTime,
  cues,
  onCueGo,
  onCueSkip,
  onCueStandby,
}: RunsheetShowModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCueIndex, setCurrentCueIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showClock, setShowClock] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentCue = cues[currentCueIndex];
  const previousCue = currentCueIndex > 0 ? cues[currentCueIndex - 1] : null;
  const nextCues = cues.slice(currentCueIndex + 1, currentCueIndex + 4);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentCue) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentCue]);

  const handleGo = useCallback(() => {
    if (!currentCue) return;
    
    onCueGo?.(currentCue.id);
    setIsRunning(true);
  }, [currentCue, onCueGo]);

  const handleNext = useCallback(() => {
    if (currentCueIndex < cues.length - 1) {
      setCurrentCueIndex((prev) => prev + 1);
      setElapsedSeconds(0);
      setIsRunning(false);
    }
  }, [currentCueIndex, cues.length]);

  const handleSkip = useCallback(() => {
    if (!currentCue) return;
    
    onCueSkip?.(currentCue.id);
    handleNext();
  }, [currentCue, onCueSkip, handleNext]);

  const handleStandby = useCallback(() => {
    if (!currentCue) return;
    onCueStandby?.(currentCue.id);
  }, [currentCue, onCueStandby]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleGo();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      } else if (e.code === 'KeyS') {
        handleSkip();
      } else if (e.code === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGo, handleNext, handleSkip, isFullscreen, toggleFullscreen]);

  const remainingSeconds = currentCue 
    ? Math.max(0, currentCue.duration_seconds - elapsedSeconds) 
    : 0;
  
  const progressPercent = currentCue && currentCue.duration_seconds > 0
    ? Math.min(100, (elapsedSeconds / currentCue.duration_seconds) * 100)
    : 0;

  const isOvertime = elapsedSeconds > (currentCue?.duration_seconds || 0);

  return (
    <div className={cn(
      "flex flex-col h-full bg-black text-white",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Badge variant="destructive" className="animate-pulse text-sm px-3 py-1">
            🔴 LIVE
          </Badge>
          <h1 className="text-xl font-bold">{runsheetName}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {showClock && (
            <div className="text-3xl font-mono font-bold text-emerald-400">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-accent"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        {/* Previous Cue */}
        {previousCue && (
          <div className="flex items-center gap-4 text-neutral-500">
            <ChevronUp className="h-4 w-4" />
            <span className="text-sm">PREVIOUS:</span>
            <span className="font-medium">{previousCue.name}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
            <span className="text-emerald-500 text-sm">COMPLETE</span>
          </div>
        )}

        {/* Current Cue - Main Focus */}
        <AnimatePresence mode="wait">
          {currentCue && (
            <motion.div
              key={currentCue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              <Card className={cn(
                "h-full p-8 border-2 transition-all duration-300",
                isRunning 
                  ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  : "border-border bg-muted",
                isOvertime && "border-rose-500 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
              )}>
                <div className="flex flex-col h-full">
                  {/* Cue Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        CUE_TYPE_COLORS[currentCue.cue_type] || 'bg-gray-500'
                      )} />
                      <Badge variant="outline" className="text-sm uppercase tracking-wider">
                        {currentCue.cue_type}
                      </Badge>
                      <span className="text-neutral-400">#{currentCue.sequence}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-400">Scheduled</p>
                      <p className="text-xl font-mono">{formatTime(currentCue.scheduled_time)}</p>
                    </div>
                  </div>

                  {/* Cue Name */}
                  <h2 className="text-4xl font-bold mb-4">{currentCue.name}</h2>
                  
                  {currentCue.description && (
                    <p className="text-lg text-neutral-300 mb-6">{currentCue.description}</p>
                  )}

                  {/* Timer Section */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className={cn(
                        "text-sm uppercase tracking-wider mb-2",
                        isOvertime ? "text-rose-400" : "text-neutral-400"
                      )}>
                        {isOvertime ? 'OVERTIME' : isRunning ? 'REMAINING' : 'DURATION'}
                      </p>
                      <p className={cn(
                        "text-8xl font-mono font-bold",
                        isOvertime ? "text-rose-500 animate-pulse" : isRunning ? "text-emerald-400" : "text-white"
                      )}>
                        {isOvertime 
                          ? `+${formatDuration(elapsedSeconds - currentCue.duration_seconds)}`
                          : formatDuration(isRunning ? remainingSeconds : currentCue.duration_seconds)
                        }
                      </p>
                      
                      {/* Progress Bar */}
                      {currentCue.duration_seconds > 0 && (
                        <div className="w-96 h-2 bg-accent rounded-full mt-6 mx-auto overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              isOvertime ? "bg-rose-500" : "bg-emerald-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {currentCue.notes && (
                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-sm font-medium mb-1">NOTES</p>
                      <p className="text-amber-200">{currentCue.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Cues */}
        <div className="space-y-2">
          {nextCues.map((cue, index) => (
            <div
              key={cue.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all",
                index === 0 
                  ? "bg-accent border border-border" 
                  : "bg-muted text-neutral-400"
              )}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm uppercase tracking-wider">
                {index === 0 ? 'NEXT' : `THEN`}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                CUE_TYPE_COLORS[cue.cue_type] || 'bg-gray-500'
              )} />
              <span className="font-medium flex-1">{cue.name}</span>
              <span className="font-mono text-sm">
                {formatDuration(cue.duration_seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-6 py-4 border-t border-border bg-muted">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleStandby}
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 px-8"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            STANDBY
          </Button>
          
          <Button
            size="lg"
            onClick={handleGo}
            disabled={!currentCue}
            className={cn(
              "px-16 py-6 text-2xl font-bold transition-all",
              isRunning
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                : "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            <Play className="h-6 w-6 mr-2 fill-current" />
            GO
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            className="border-rose-500/50 text-rose-400 hover:bg-rose-500/20 px-8"
          >
            <SkipForward className="h-5 w-5 mr-2" />
            SKIP
          </Button>
        </div>

        {/* Keyboard Hints */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-neutral-500">
          <span><kbd className="px-2 py-1 bg-accent rounded">SPACE</kbd> Go</span>
          <span><kbd className="px-2 py-1 bg-accent rounded">ENTER</kbd> Next</span>
          <span><kbd className="px-2 py-1 bg-accent rounded">S</kbd> Skip</span>
          <span><kbd className="px-2 py-1 bg-accent rounded">F11</kbd> Fullscreen</span>
        </div>
      </div>
    </div>
  );
}

export default RunsheetShowMode;
