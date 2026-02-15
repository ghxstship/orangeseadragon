"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p) => /\d/.test(p) },
  { key: "special", label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

type StrengthLevel = "weak" | "fair" | "good" | "strong";

interface StrengthConfig {
  label: string;
  color: string;
  bgColor: string;
}

const STRENGTH_CONFIG: Record<StrengthLevel, StrengthConfig> = {
  weak: { label: "Weak", color: "bg-destructive", bgColor: "text-destructive" },
  fair: { label: "Fair", color: "bg-semantic-orange", bgColor: "text-semantic-orange" },
  good: { label: "Good", color: "bg-semantic-warning", bgColor: "text-semantic-warning" },
  strong: { label: "Strong", color: "bg-semantic-success", bgColor: "text-semantic-success" },
};

const getStrengthBarWidthStyle = (score: number): React.CSSProperties => ({
  width: `${score}%`,
});

function calculateStrength(password: string): { level: StrengthLevel; score: number } {
  if (!password) return { level: "weak", score: 0 };

  const passedRequirements = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
  const totalRequirements = PASSWORD_REQUIREMENTS.length;
  const score = (passedRequirements / totalRequirements) * 100;

  if (passedRequirements <= 1) return { level: "weak", score };
  if (passedRequirements <= 2) return { level: "fair", score };
  if (passedRequirements <= 4) return { level: "good", score };
  return { level: "strong", score };
}

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordStrength({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthProps) {
  const { level, score } = calculateStrength(password);
  const config = STRENGTH_CONFIG[level];

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)} role="status" aria-live="polite">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn("font-medium", config.bgColor)}>{config.label}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 rounded-full", config.color)}
            style={getStrengthBarWidthStyle(score)}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${config.label}`}
          />
        </div>
      </div>

      {showRequirements && (
        <ul className="space-y-1" aria-label="Password requirements">
          {PASSWORD_REQUIREMENTS.map((req) => {
            const passed = req.test(password);
            return (
              <li
                key={req.key}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passed ? "text-semantic-success" : "text-muted-foreground"
                )}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  showRequirements?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = true, showRequirements = true, onChange, ...props }, ref) => {
    const [password, setPassword] = React.useState((props.value as string) || "");
    const [showPassword, setShowPassword] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      onChange?.(e);
    };

    React.useEffect(() => {
      if (props.value !== undefined) {
        setPassword(props.value as string);
      }
    }, [props.value]);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-11 w-full rounded-xl border border-border bg-muted px-4 py-2 pr-10 text-[13px] font-medium ring-offset-background backdrop-blur-3xl transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-xl",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
        {showStrength && <PasswordStrength password={password} showRequirements={showRequirements} />}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
