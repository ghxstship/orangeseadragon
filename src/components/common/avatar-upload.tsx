'use client';

import * as React from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { captureError } from '@/lib/observability';

interface AvatarUploadProps {
  currentUrl?: string | null;
  userId: string;
  bucket?: 'avatars' | 'org-assets';
  folder?: string;
  fallbackInitials?: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadComplete?: (publicUrl: string) => void;
  onRemove?: () => void;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
} as const;

export function AvatarUpload({
  currentUrl,
  userId,
  bucket = 'avatars',
  folder,
  fallbackInitials = '?',
  size = 'md',
  onUploadComplete,
  onRemove,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl ?? currentUrl ?? null;
  const sizeClass = SIZE_MAP[size];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      const supabase = createClient();
      const folderPath = folder ?? userId;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const filePath = `${folderPath}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        captureError(uploadError, 'avatarUpload.upload');
        setPreviewUrl(null);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onUploadComplete?.(publicUrl);
    } catch (err) {
      captureError(err, 'avatarUpload.upload');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClass, 'border-2 border-border')}>
        {displayUrl && <AvatarImage src={displayUrl} alt="Avatar" />}
        <AvatarFallback className="text-lg font-semibold bg-muted">
          {fallbackInitials}
        </AvatarFallback>
      </Avatar>

      {/* Upload overlay */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-full p-0 h-auto',
          'bg-black/0 hover:bg-black/40 transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'group'
        )}
        aria-label="Upload avatar"
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : (
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </Button>

      {/* Remove button */}
      {displayUrl && !isUploading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
          onClick={handleRemove}
          aria-label="Remove avatar"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
