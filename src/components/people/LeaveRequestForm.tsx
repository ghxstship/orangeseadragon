'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palmtree,
  Stethoscope,
  Baby,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type LeaveType = 'annual' | 'sick' | 'parental' | 'bereavement' | 'study' | 'unpaid';

interface LeaveBalance {
  type: LeaveType;
  available: number;
  total: number;
}

interface LeaveRequestFormProps {
  balances?: LeaveBalance[];
  onSubmit?: (data: LeaveRequestData) => void;
  onCancel?: () => void;
}

interface LeaveRequestData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  startHalfDay: 'full' | 'morning' | 'afternoon';
  endHalfDay: 'full' | 'morning' | 'afternoon';
  reason: string;
  attachment?: File;
}

const LEAVE_TYPES: { value: LeaveType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'annual', label: 'Annual Leave', icon: Palmtree, color: 'text-emerald-400' },
  { value: 'sick', label: 'Sick Leave', icon: Stethoscope, color: 'text-rose-400' },
  { value: 'parental', label: 'Parental Leave', icon: Baby, color: 'text-purple-400' },
  { value: 'bereavement', label: 'Bereavement', icon: Heart, color: 'text-zinc-400' },
  { value: 'study', label: 'Study Leave', icon: GraduationCap, color: 'text-blue-400' },
  { value: 'unpaid', label: 'Unpaid Leave', icon: Briefcase, color: 'text-amber-400' },
];

const DEFAULT_BALANCES: LeaveBalance[] = [
  { type: 'annual', available: 12, total: 20 },
  { type: 'sick', available: 8, total: 10 },
  { type: 'parental', available: 0, total: 0 },
  { type: 'bereavement', available: 3, total: 3 },
  { type: 'study', available: 5, total: 5 },
  { type: 'unpaid', available: 999, total: 999 },
];

export function LeaveRequestForm({
  balances = DEFAULT_BALANCES,
  onSubmit,
  onCancel,
}: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startHalfDay, setStartHalfDay] = useState<'full' | 'morning' | 'afternoon'>('full');
  const [endHalfDay, setEndHalfDay] = useState<'full' | 'morning' | 'afternoon'>('full');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBalance = balances.find(b => b.type === leaveType);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    
    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (startHalfDay !== 'full') days -= 0.5;
    if (endHalfDay !== 'full' && startDate !== endDate) days -= 0.5;
    
    return Math.max(0, days);
  };

  const requestedDays = calculateDays();
  const hasInsufficientBalance = selectedBalance && requestedDays > selectedBalance.available && leaveType !== 'unpaid';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (hasInsufficientBalance) {
      newErrors.balance = `Insufficient balance. You have ${selectedBalance?.available} days available.`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    onSubmit?.({
      leaveType,
      startDate,
      endDate,
      startHalfDay,
      endHalfDay,
      reason,
      attachment: attachment || undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <Card className="bg-zinc-900/60 border-white/10 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Request Time Off
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Leave Type Selection */}
        <div className="space-y-2">
          <Label>Leave Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {LEAVE_TYPES.map((type) => {
              const Icon = type.icon;
              const balance = balances.find(b => b.type === type.value);
              const isSelected = leaveType === type.value;
              
              return (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLeaveType(type.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-colors",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-white/10 bg-zinc-800/50 hover:bg-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-4 h-4", type.color)} />
                    <span className="text-sm font-medium text-white">{type.label}</span>
                  </div>
                  {balance && type.value !== 'unpaid' && (
                    <p className="text-xs text-zinc-500">
                      {balance.available} of {balance.total} days
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(
                "bg-zinc-800/50 border-white/10",
                errors.startDate && "border-rose-500"
              )}
            />
            {errors.startDate && (
              <p className="text-xs text-rose-400">{errors.startDate}</p>
            )}
            <Select value={startHalfDay} onValueChange={(v) => setStartHalfDay(v as typeof startHalfDay)}>
              <SelectTrigger className="bg-zinc-800/50 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Day</SelectItem>
                <SelectItem value="morning">Morning Only</SelectItem>
                <SelectItem value="afternoon">Afternoon Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(
                "bg-zinc-800/50 border-white/10",
                errors.endDate && "border-rose-500"
              )}
            />
            {errors.endDate && (
              <p className="text-xs text-rose-400">{errors.endDate}</p>
            )}
            <Select value={endHalfDay} onValueChange={(v) => setEndHalfDay(v as typeof endHalfDay)}>
              <SelectTrigger className="bg-zinc-800/50 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Day</SelectItem>
                <SelectItem value="morning">Morning Only</SelectItem>
                <SelectItem value="afternoon">Afternoon Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Days Summary */}
        {requestedDays > 0 && (
          <div className={cn(
            "p-4 rounded-lg border",
            hasInsufficientBalance 
              ? "bg-rose-500/10 border-rose-500/20" 
              : "bg-zinc-800/50 border-white/10"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Requested Days</p>
                <p className="text-2xl font-bold text-white">{requestedDays} days</p>
              </div>
              {selectedBalance && leaveType !== 'unpaid' && (
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Remaining After</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    hasInsufficientBalance ? "text-rose-400" : "text-emerald-400"
                  )}>
                    {selectedBalance.available - requestedDays} days
                  </p>
                </div>
              )}
            </div>
            {hasInsufficientBalance && (
              <div className="flex items-center gap-2 mt-3 text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.balance}</span>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (Optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add any notes or details about your leave request..."
            className="bg-zinc-800/50 border-white/10 min-h-[100px]"
          />
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <Label>Attachment (Optional)</Label>
          <p className="text-xs text-zinc-500 mb-2">
            Upload supporting documents (e.g., medical certificate)
          </p>
          
          {attachment ? (
            <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-white/10">
              <div className="flex-1 truncate">
                <p className="text-sm text-white truncate">{attachment.name}</p>
                <p className="text-xs text-zinc-500">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAttachment(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
              <Upload className="w-5 h-5 text-zinc-500" />
              <span className="text-sm text-zinc-400">Click to upload</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 border-t border-white/5 pt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={hasInsufficientBalance}
        >
          Submit Request
        </Button>
      </CardFooter>
    </Card>
  );
}
