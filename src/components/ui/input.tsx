import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-11 w-full rounded-xl border px-4 py-2 text-[13px] font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-input bg-background focus-visible:ring-primary/50 shadow-sm hover:border-primary/50",
        glass: "glass text-foreground border-white/10 bg-white/5 focus-visible:ring-primary/50 focus-visible:border-primary/50 placeholder:text-white/40",
        spatial: "bg-background/50 border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus-visible:ring-primary/40 focus-visible:shadow-[0_0_20px_rgba(var(--primary),0.1)]",
        ghost: "border-none bg-transparent shadow-none focus-visible:ring-0 px-0",
      },
      file: {
        true: "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      file: false
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, file, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, file, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
