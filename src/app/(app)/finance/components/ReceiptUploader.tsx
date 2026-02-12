'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Camera, 
  FileImage, 
  X, 
  Check, 
  Loader2,
  AlertCircle,
  ScanLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedReceipt {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  extractedData?: {
    vendor?: string;
    amount?: number;
    date?: string;
    category?: string;
    confidence?: number;
  };
  error?: string;
}

interface ReceiptUploaderProps {
  onUploadComplete: (receipts: UploadedReceipt[]) => void;
  maxFiles?: number;
}

export function ReceiptUploader({ onUploadComplete, maxFiles = 10 }: ReceiptUploaderProps) {
  const [receipts, setReceipts] = useState<UploadedReceipt[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File): Promise<UploadedReceipt> => {
    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    
    const receipt: UploadedReceipt = {
      id,
      file,
      preview,
      status: 'uploading',
      progress: 0,
    };

    setReceipts((prev) => [...prev, receipt]);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setReceipts((prev) =>
        prev.map((r) => (r.id === id ? { ...r, progress: i } : r))
      );
    }

    // Simulate OCR processing
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'processing' } : r))
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate extracted data (in production, this would come from OCR API)
    const extractedData = {
      vendor: 'Sample Vendor',
      amount: Math.round(Math.random() * 500 * 100) / 100,
      date: new Date().toISOString().split('T')[0],
      category: ['Meals', 'Travel', 'Software', 'Office Supplies'][Math.floor(Math.random() * 4)],
      confidence: 0.85 + Math.random() * 0.15,
    };

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'completed', extractedData }
          : r
      )
    );

    return { ...receipt, status: 'completed', extractedData };
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, maxFiles - receipts.length);
    const validFiles = fileArray.filter((file) =>
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    for (const file of validFiles) {
      await processFile(file);
    }
  }, [receipts.length, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeReceipt = (id: string) => {
    setReceipts((prev) => {
      const receipt = prev.find((r) => r.id === id);
      if (receipt?.preview) {
        URL.revokeObjectURL(receipt.preview);
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const completedReceipts = receipts.filter((r) => r.status === 'completed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-5 w-5" />
          Upload Receipts
        </CardTitle>
        <CardDescription>
          Upload receipt images or PDFs for automatic data extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="mb-2 text-center font-medium">
            Drag and drop receipts here
          </p>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            or click to browse (JPG, PNG, PDF)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('receipt-input')?.click()}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('receipt-camera')?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>
          <input
            id="receipt-input"
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <input
            id="receipt-camera"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {receipts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Receipts ({receipts.length})</h4>
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {receipt.file.type.startsWith('image/') ? (
                    <img
                      src={receipt.preview}
                      alt="Receipt"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{receipt.file.name}</p>
                  
                  {receipt.status === 'uploading' && (
                    <div className="mt-1">
                      <Progress value={receipt.progress} className="h-1" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploading... {receipt.progress}%
                      </p>
                    </div>
                  )}

                  {receipt.status === 'processing' && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extracting data...
                    </div>
                  )}

                  {receipt.status === 'completed' && receipt.extractedData && (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {receipt.extractedData.vendor}
                      </Badge>
                      <Badge variant="outline">
                        ${receipt.extractedData.amount?.toFixed(2)}
                      </Badge>
                      <Badge variant="outline">
                        {receipt.extractedData.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((receipt.extractedData.confidence || 0) * 100)}% confidence
                      </span>
                    </div>
                  )}

                  {receipt.status === 'failed' && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {receipt.error || 'Failed to process'}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {receipt.status === 'completed' && (
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReceipt(receipt.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedReceipts.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setReceipts([])}
            >
              Clear All
            </Button>
            <Button onClick={() => onUploadComplete(completedReceipts)}>
              Create {completedReceipts.length} Expense{completedReceipts.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
