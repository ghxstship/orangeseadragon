"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface EntityFormPageProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  isNew?: boolean;
  sections?: FormSection[];
  children?: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  loading?: boolean;
  sidebarContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

export function EntityFormPage({
  title,
  description,
  breadcrumbs = [],
  backHref,
  isNew = false,
  sections,
  children,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  isSubmitting = false,
  isDirty = false,
  loading = false,
  sidebarContent,
  footerContent,
  className,
}: EntityFormPageProps) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  const defaultSubmitLabel = isNew ? "Create" : "Save changes";
  const finalSubmitLabel = submitLabel || defaultSubmitLabel;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      handleBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.();
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef} className={cn("space-y-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting || (!isDirty && !isNew)}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : finalSubmitLabel}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {sidebarContent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {sections ? (
              sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>{section.content}</CardContent>
                </Card>
              ))
            ) : (
              children
            )}
          </div>
          <div className="space-y-6">{sidebarContent}</div>
        </div>
      ) : sections ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>{section.content}</CardContent>
            </Card>
          ))}
        </div>
      ) : (
        children
      )}

      {/* Footer */}
      {footerContent && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          {footerContent}
        </div>
      )}

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (!isDirty && !isNew)}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : finalSubmitLabel}
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky footer */}
      <div className="h-20 lg:hidden" />
    </form>
  );
}

// Form field wrapper component
interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Form row for horizontal layout
interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
}
