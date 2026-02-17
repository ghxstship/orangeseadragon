import * as React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-xl font-bold">A</span>
              </div>
              <span className="text-2xl font-bold">ATLVS</span>
            </Link>
          </div>
          
          <div className="space-y-6">
            <blockquote className="text-xl font-medium leading-relaxed">
              &ldquo;The platform that transformed how we manage productions. 
              Everything in one place, finally.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold">Sarah Chen</p>
              <p className="text-primary-foreground/70">Production Director, LiveNation</p>
            </div>
          </div>
          
          <div className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} ATLVS. All rights reserved.
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>
      
      {/* Right Panel - Auth Content */}
      <div className="flex-1 flex flex-col">
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
        
        {/* Mobile footer */}
        <div className="lg:hidden p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ATLVS. All rights reserved.
        </div>
      </div>
    </div>
  );
}
