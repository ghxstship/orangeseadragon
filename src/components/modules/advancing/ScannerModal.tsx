'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  QrCode, 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  Package,
  MapPin,
  Loader2,
  ScanLine,
  Flashlight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ScanResult {
  success: boolean;
  tag?: {
    id: string;
    tag_value: string;
    tag_type: string;
    label?: string;
  };
  item?: {
    id: string;
    item_name: string;
    status: string;
    category?: { name: string; color: string };
    vendor?: { name: string };
    production_advance?: { advance_code: string };
  };
  error?: string;
}

interface ScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
  advanceId?: string;
  onScanComplete?: (result: ScanResult) => void;
}

const SCAN_ACTIONS = [
  { value: 'check_out', label: 'Check Out', description: 'Item leaving warehouse' },
  { value: 'check_in', label: 'Check In', description: 'Item returning to warehouse' },
  { value: 'verify', label: 'Verify', description: 'Confirm item presence' },
  { value: 'locate', label: 'Locate', description: 'Update item location' },
  { value: 'transfer', label: 'Transfer', description: 'Move between locations' },
  { value: 'inspect', label: 'Inspect', description: 'Quality inspection' },
  { value: 'damage_report', label: 'Report Damage', description: 'Log damage or issue' },
];

export function ScannerModal({ 
  open, 
  onOpenChange, 
  eventId,
  advanceId,
  onScanComplete 
}: ScannerModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [action, setAction] = useState('verify');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
      setMode('manual');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (open && mode === 'camera') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, mode, startCamera, stopCamera]);

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as MediaTrackConstraintSet]
        });
        setTorchOn(!torchOn);
      }
    }
  };

  const processCode = async (code: string) => {
    if (processing || !code.trim()) return;
    
    setProcessing(true);
    
    try {
      // First, look up the tag
      const lookupRes = await fetch(`/api/advancing/scan?tagValue=${encodeURIComponent(code)}`);
      
      if (!lookupRes.ok) {
        const error = await lookupRes.json();
        setScanResult({
          success: false,
          error: error.code === 'TAG_NOT_FOUND' 
            ? 'Tag not found in system' 
            : error.error || 'Lookup failed'
        });
        return;
      }
      
      const lookupData = await lookupRes.json();
      
      // Now record the scan
      const scanRes = await fetch('/api/advancing/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagValue: code,
          action,
          location: location || undefined,
          notes: notes || undefined,
          eventId,
          advanceId,
        }),
      });
      
      if (!scanRes.ok) {
        const error = await scanRes.json();
        setScanResult({
          success: false,
          tag: lookupData.data,
          error: error.error || 'Scan recording failed'
        });
        return;
      }
      
      const scanData = await scanRes.json();
      
      const result: ScanResult = {
        success: true,
        tag: scanData.tag,
        item: scanData.item,
      };
      
      setScanResult(result);
      onScanComplete?.(result);
      
      toast({
        title: 'Scan Successful',
        description: `${scanData.item?.item_name || 'Item'} - ${action.replace('_', ' ')}`,
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        error: 'Network error. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(manualCode);
  };

  const resetScan = () => {
    setScanResult(null);
    setManualCode('');
    setNotes('');
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setManualCode('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Asset
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('camera')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setMode('manual'); stopCamera(); }}
              className="flex-1"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>
          
          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Scan Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCAN_ACTIONS.map(a => (
                  <SelectItem key={a.value} value={a.value}>
                    <div className="flex flex-col">
                      <span>{a.label}</span>
                      <span className="text-xs text-muted-foreground">{a.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Camera View */}
          <AnimatePresence mode="wait">
            {mode === 'camera' && !scanResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden"
              >
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                    <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
                    <p className="text-sm">{cameraError}</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />
                        
                        {scanning && (
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-primary"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Camera controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full bg-black/50 hover:bg-black/70"
                        onClick={toggleTorch}
                      >
                        <Flashlight className={cn("h-4 w-4", torchOn && "text-yellow-400")} />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
            
            {/* Manual Entry */}
            {mode === 'manual' && !scanResult && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleManualSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="code">Tag Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter or scan barcode/QR code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g., Warehouse A, Stage Left"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!manualCode.trim() || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Scan
                    </>
                  )}
                </Button>
              </motion.form>
            )}
            
            {/* Scan Result */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-4 rounded-lg border",
                  scanResult.success 
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                    : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      scanResult.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                    )}>
                      {scanResult.success ? (
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold",
                        scanResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                      )}>
                        {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
                      </h4>
                      
                      {scanResult.error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {scanResult.error}
                        </p>
                      )}
                      
                      {scanResult.item && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{scanResult.item.item_name}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {scanResult.item.status.replace('_', ' ')}
                            </Badge>
                            {scanResult.item.category && (
                              <Badge 
                                variant="secondary"
                                style={{ "--category-color": scanResult.item.category.color, backgroundColor: "color-mix(in srgb, var(--category-color) 12%, transparent)" } as React.CSSProperties}
                              >
                                {scanResult.item.category.name}
                              </Badge>
                            )}
                          </div>
                          
                          {scanResult.item.vendor && (
                            <p className="text-sm text-muted-foreground">
                              Vendor: {scanResult.item.vendor.name}
                            </p>
                          )}
                          
                          {scanResult.item.production_advance && (
                            <p className="text-sm text-muted-foreground">
                              Advance: {scanResult.item.production_advance.advance_code}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetScan} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Scan Another
                  </Button>
                  <Button onClick={handleClose} className="flex-1">
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
