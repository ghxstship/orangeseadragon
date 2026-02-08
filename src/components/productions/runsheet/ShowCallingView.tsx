"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Volume2,
  Video,
  Lightbulb,
  Mic,
  Coffee,
  Presentation,
  Music,
  Zap,
} from "lucide-react";

interface RunsheetCue {
  id: string;
  sequence: number;
  name: string;
  description?: string;
  cue_type: string;
  duration_seconds: number;
  scheduled_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: "pending" | "standby" | "go" | "complete" | "skipped";
  assigned_to_id?: string;
  assigned_to_name?: string;
  notes?: string;
  script_text?: string;
}

interface Runsheet {
  id: string;
  name: string;
  event_name?: string;
  stage_name?: string;
  date: string;
  start_time: string;
  status: "draft" | "published" | "live" | "locked" | "completed";
  cues: RunsheetCue[];
}

interface ShowCallingViewProps {
  runsheet: Runsheet;
  onCueGo: (cueId: string) => Promise<void>;
  onCueSkip: (cueId: string) => Promise<void>;
  onCueStandby: (cueId: string) => Promise<void>;
  onCueReset: (cueId: string) => Promise<void>;
  onStartShow: () => Promise<void>;
  onEndShow: () => Promise<void>;
  isLive?: boolean;
  className?: string;
}

const cueTypeIcons: Record<string, React.ReactNode> = {
  action: <Zap className="h-4 w-4" />,
  audio: <Volume2 className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  lighting: <Lightbulb className="h-4 w-4" />,
  transition: <SkipForward className="h-4 w-4" />,
  break: <Coffee className="h-4 w-4" />,
  speech: <Mic className="h-4 w-4" />,
  presentation: <Presentation className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  standby: <Clock className="h-4 w-4" />,
};

const cueTypeColors: Record<string, string> = {
  action: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  audio: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  video: "bg-pink-500/10 text-pink-500 border-pink-500/30",
  lighting: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  transition: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  break: "bg-gray-500/10 text-gray-500 border-gray-500/30",
  speech: "bg-green-500/10 text-green-500 border-green-500/30",
  presentation: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  music: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
  standby: "bg-amber-500/10 text-amber-500 border-amber-500/30",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(timeString: string): string {
  return timeString.slice(0, 5); // HH:MM
}

export function ShowCallingView({
  runsheet,
  onCueGo,
  onCueSkip,
  onCueStandby,
  onCueReset,
  onStartShow,
  onEndShow,
  isLive = false,
  className,
}: ShowCallingViewProps) {
  const [currentCueIndex, setCurrentCueIndex] = useState<number>(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cueElapsedTime, setCueElapsedTime] = useState(0);
  const [showStartTime, setShowStartTime] = useState<Date | null>(null);
  const [cueStartTime, setCueStartTime] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cueListRef = useRef<HTMLDivElement>(null);

  const currentCue = currentCueIndex >= 0 ? runsheet.cues[currentCueIndex] : null;
  const nextCue = currentCueIndex < runsheet.cues.length - 1 ? runsheet.cues[currentCueIndex + 1] : null;
  const previousCue = currentCueIndex > 0 ? runsheet.cues[currentCueIndex - 1] : null;

  // Timer effect
  useEffect(() => {
    if (isLive && showStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - showStartTime.getTime()) / 1000));
        if (cueStartTime) {
          setCueElapsedTime(Math.floor((Date.now() - cueStartTime.getTime()) / 1000));
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLive, showStartTime, cueStartTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (currentCue && currentCue.status !== "complete") {
            handleGo();
          }
          break;
        case "KeyS":
          e.preventDefault();
          if (nextCue) {
            handleStandby();
          }
          break;
        case "Escape":
          e.preventDefault();
          if (currentCue) {
            handleSkip();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (currentCueIndex > 0) {
            setCurrentCueIndex(currentCueIndex - 1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentCueIndex < runsheet.cues.length - 1) {
            setCurrentCueIndex(currentCueIndex + 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCue, nextCue, currentCueIndex, runsheet.cues.length]);

  // Auto-scroll to current cue
  useEffect(() => {
    if (cueListRef.current && currentCueIndex >= 0) {
      const cueElement = cueListRef.current.querySelector(`[data-cue-index="${currentCueIndex}"]`);
      if (cueElement) {
        cueElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentCueIndex]);

  const handleStartShow = useCallback(async () => {
    await onStartShow();
    setShowStartTime(new Date());
    setCurrentCueIndex(0);
  }, [onStartShow]);

  const handleEndShow = useCallback(async () => {
    await onEndShow();
    setShowStartTime(null);
    setCueStartTime(null);
  }, [onEndShow]);

  const handleGo = useCallback(async () => {
    if (!currentCue) return;
    
    await onCueGo(currentCue.id);
    setCueStartTime(new Date());
    
    // Auto-advance to next cue after duration
    if (currentCue.duration_seconds > 0) {
      setTimeout(() => {
        if (currentCueIndex < runsheet.cues.length - 1) {
          setCurrentCueIndex(currentCueIndex + 1);
          setCueStartTime(null);
        }
      }, currentCue.duration_seconds * 1000);
    }
  }, [currentCue, currentCueIndex, onCueGo, runsheet.cues.length]);

  const handleSkip = useCallback(async () => {
    if (!currentCue) return;
    await onCueSkip(currentCue.id);
    if (currentCueIndex < runsheet.cues.length - 1) {
      setCurrentCueIndex(currentCueIndex + 1);
    }
    setCueStartTime(null);
  }, [currentCue, currentCueIndex, onCueSkip, runsheet.cues.length]);

  const handleStandby = useCallback(async () => {
    if (!nextCue) return;
    await onCueStandby(nextCue.id);
  }, [nextCue, onCueStandby]);

  const handleReset = useCallback(async (cueId: string) => {
    await onCueReset(cueId);
  }, [onCueReset]);

  const getVariance = () => {
    if (!currentCue || !cueStartTime) return 0;
    return cueElapsedTime - currentCue.duration_seconds;
  };

  const variance = getVariance();
  const isOvertime = variance > 0;

  return (
    <div className={cn("flex h-full bg-black text-white", className)}>
      {/* Left Panel - Cue List */}
      <div className="w-80 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-lg">{runsheet.name}</h2>
          <p className="text-sm text-zinc-400">
            {runsheet.event_name} • {runsheet.stage_name}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {runsheet.date} @ {runsheet.start_time}
          </p>
        </div>

        <ScrollArea className="flex-1" ref={cueListRef}>
          <div className="p-2 space-y-1">
            {runsheet.cues.map((cue, index) => (
              <button
                key={cue.id}
                data-cue-index={index}
                onClick={() => setCurrentCueIndex(index)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  index === currentCueIndex
                    ? "bg-emerald-500/20 border border-emerald-500"
                    : cue.status === "complete"
                    ? "bg-zinc-800/50 opacity-60"
                    : cue.status === "skipped"
                    ? "bg-red-500/10 opacity-60"
                    : "hover:bg-zinc-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-6">{cue.sequence}</span>
                  <span
                    className={cn(
                      "p-1 rounded border",
                      cueTypeColors[cue.cue_type] || cueTypeColors.action
                    )}
                  >
                    {cueTypeIcons[cue.cue_type] || cueTypeIcons.action}
                  </span>
                  <span className="flex-1 truncate font-medium">{cue.name}</span>
                  <span className="text-xs text-zinc-500">
                    {formatDuration(cue.duration_seconds)}
                  </span>
                </div>
                {cue.status !== "pending" && (
                  <div className="mt-1 ml-8">
                    <Badge
                      variant={
                        cue.status === "complete"
                          ? "default"
                          : cue.status === "go"
                          ? "destructive"
                          : cue.status === "standby"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {cue.status.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Total Cues</span>
            <span>{runsheet.cues.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-zinc-400">Completed</span>
            <span>{runsheet.cues.filter((c) => c.status === "complete").length}</span>
          </div>
        </div>
      </div>

      {/* Center Panel - Current Cue */}
      <div className="flex-1 flex flex-col">
        {/* Timer Bar */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-zinc-500 uppercase">Show Time</div>
              <div className="text-2xl font-mono font-bold">
                {formatDuration(elapsedTime)}
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 bg-zinc-700" />
            <div className="text-center">
              <div className="text-xs text-zinc-500 uppercase">Cue Time</div>
              <div
                className={cn(
                  "text-2xl font-mono font-bold",
                  isOvertime ? "text-red-500" : "text-emerald-500"
                )}
              >
                {cueStartTime ? formatDuration(cueElapsedTime) : "--:--"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLive ? (
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleStartShow}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Show
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndShow}
              >
                <Pause className="h-5 w-5 mr-2" />
                End Show
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isOvertime && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">+{formatDuration(variance)} OVER</span>
              </div>
            )}
            {!isOvertime && variance < 0 && currentCue && (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold">{formatDuration(Math.abs(variance))} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Cue Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {currentCue ? (
            <>
              {/* Previous Cue */}
              {previousCue && (
                <div className="w-full max-w-3xl mb-4 opacity-50">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-4">
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                      <span className="text-zinc-400">Previous:</span>
                      <span className="font-medium">{previousCue.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {previousCue.status === "complete" ? "COMPLETE" : previousCue.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Current Cue - Large Display */}
              <Card className="w-full max-w-3xl bg-zinc-900 border-2 border-emerald-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-zinc-500">
                        #{currentCue.sequence}
                      </span>
                      <span
                        className={cn(
                          "p-2 rounded-lg border",
                          cueTypeColors[currentCue.cue_type] || cueTypeColors.action
                        )}
                      >
                        {cueTypeIcons[currentCue.cue_type] || cueTypeIcons.action}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-500">Scheduled</div>
                      <div className="text-xl font-mono">
                        {formatTime(currentCue.scheduled_time)}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-4xl mt-4">{currentCue.name}</CardTitle>
                  {currentCue.description && (
                    <p className="text-lg text-zinc-400 mt-2">{currentCue.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500">Duration</div>
                      <div className="text-3xl font-mono font-bold">
                        {formatDuration(currentCue.duration_seconds)}
                      </div>
                    </div>
                    {currentCue.assigned_to_name && (
                      <div className="text-right">
                        <div className="text-sm text-zinc-500">Assigned To</div>
                        <div className="text-lg">{currentCue.assigned_to_name}</div>
                      </div>
                    )}
                  </div>

                  {currentCue.script_text && (
                    <div className="p-4 bg-zinc-800 rounded-lg">
                      <div className="text-sm text-zinc-500 mb-2">Script</div>
                      <p className="text-lg whitespace-pre-wrap">{currentCue.script_text}</p>
                    </div>
                  )}

                  {currentCue.notes && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="text-sm text-amber-500 mb-1">Notes</div>
                      <p className="text-amber-200">{currentCue.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Cue */}
              {nextCue && (
                <div className="w-full max-w-3xl mt-4 opacity-70">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex items-center gap-4">
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                      <span className="text-zinc-400">Next:</span>
                      <span
                        className={cn(
                          "p-1 rounded border",
                          cueTypeColors[nextCue.cue_type] || cueTypeColors.action
                        )}
                      >
                        {cueTypeIcons[nextCue.cue_type] || cueTypeIcons.action}
                      </span>
                      <span className="font-medium">{nextCue.name}</span>
                      <span className="text-zinc-500 ml-auto">
                        {formatDuration(nextCue.duration_seconds)}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <Clock className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-zinc-400">Ready to Start</h3>
              <p className="text-zinc-500 mt-2">
                Press &quot;Start Show&quot; or select a cue to begin
              </p>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="h-24 border-t border-zinc-800 bg-zinc-900 flex items-center justify-center gap-4 px-8">
          <Button
            size="lg"
            variant="outline"
            className="h-16 px-8"
            onClick={handleStandby}
            disabled={!nextCue || !isLive}
          >
            <Clock className="h-6 w-6 mr-2" />
            STANDBY
            <kbd className="ml-2 text-xs bg-zinc-800 px-2 py-1 rounded">S</kbd>
          </Button>

          <Button
            size="lg"
            className="h-20 px-16 text-2xl bg-emerald-600 hover:bg-emerald-700"
            onClick={handleGo}
            disabled={!currentCue || currentCue.status === "complete" || !isLive}
          >
            <Play className="h-8 w-8 mr-3" />
            GO
            <kbd className="ml-3 text-sm bg-emerald-800 px-2 py-1 rounded">SPACE</kbd>
          </Button>

          <Button
            size="lg"
            variant="destructive"
            className="h-16 px-8"
            onClick={handleSkip}
            disabled={!currentCue || !isLive}
          >
            <SkipForward className="h-6 w-6 mr-2" />
            SKIP
            <kbd className="ml-2 text-xs bg-red-800 px-2 py-1 rounded">ESC</kbd>
          </Button>

          {currentCue && currentCue.status !== "pending" && (
            <Button
              size="lg"
              variant="ghost"
              className="h-16 px-6"
              onClick={() => handleReset(currentCue.id)}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Right Panel - Info */}
      <div className="w-72 border-l border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-semibold">Keyboard Shortcuts</h3>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Go / Execute</span>
            <kbd className="bg-zinc-800 px-2 py-1 rounded">Space</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Standby Next</span>
            <kbd className="bg-zinc-800 px-2 py-1 rounded">S</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Skip Cue</span>
            <kbd className="bg-zinc-800 px-2 py-1 rounded">Esc</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Previous Cue</span>
            <kbd className="bg-zinc-800 px-2 py-1 rounded">↑</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Next Cue</span>
            <kbd className="bg-zinc-800 px-2 py-1 rounded">↓</kbd>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-semibold">Status</h3>
        </div>
        <div className="p-4 space-y-3 text-sm flex-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Show Status</span>
            <Badge variant={isLive ? "destructive" : "secondary"}>
              {isLive ? "LIVE" : "STANDBY"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Current Cue</span>
            <span>{currentCue ? `#${currentCue.sequence}` : "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Progress</span>
            <span>
              {runsheet.cues.filter((c) => c.status === "complete").length} /{" "}
              {runsheet.cues.length}
            </span>
          </div>
        </div>

        {isLive && (
          <div className="p-4 bg-red-500/10 border-t border-red-500/30">
            <div className="flex items-center gap-2 text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold">LIVE</span>
            </div>
            <p className="text-xs text-red-400 mt-1">
              Show started {showStartTime ? formatDistanceToNow(showStartTime, { addSuffix: true }) : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
