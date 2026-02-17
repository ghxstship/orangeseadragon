'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Filter,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DocumentCategory = 'contract' | 'policy' | 'certification' | 'personal' | 'tax' | 'other';
type DocumentStatus = 'valid' | 'pending' | 'expired' | 'requires_signature';

interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  expiresAt?: Date;
  status: DocumentStatus;
  uploadedBy: string;
  isRequired?: boolean;
}

interface DocumentManagerProps {
  documents?: Document[];
  employeeId?: string;
  onUpload?: (files: FileList) => void;
  onDownload?: (docId: string) => void;
  onDelete?: (docId: string) => void;
  onView?: (docId: string) => void;
}

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; color: string }> = {
  contract: { label: 'Contract', color: 'bg-semantic-info' },
  policy: { label: 'Policy', color: 'bg-semantic-purple' },
  certification: { label: 'Certification', color: 'bg-semantic-success' },
  personal: { label: 'Personal', color: 'bg-semantic-warning' },
  tax: { label: 'Tax', color: 'bg-destructive' },
  other: { label: 'Other', color: 'bg-muted-foreground' },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; icon: React.ElementType; color: string }> = {
  valid: { label: 'Valid', icon: CheckCircle2, color: 'text-semantic-success' },
  pending: { label: 'Pending Review', icon: Clock, color: 'text-semantic-warning' },
  expired: { label: 'Expired', icon: AlertTriangle, color: 'text-destructive' },
  requires_signature: { label: 'Needs Signature', icon: FileText, color: 'text-semantic-info' },
};


const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return FileImage;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheet;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DocumentManager({
  documents = [],
  onUpload,
  onDownload,
  onDelete,
  onView,
}: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      onUpload?.(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files);
    }
  };

  const requiredDocs = documents.filter(d => d.isRequired);
  const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'requires_signature');
  const expiringDocs = documents.filter(d => {
    if (!d.expiresAt) return false;
    const daysUntilExpiry = Math.ceil((d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            Documents
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee documents, contracts, and certifications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/80 border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="text-2xl font-bold text-white">{documents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-semantic-success/10 border-semantic-success/20">
          <CardContent className="pt-4">
            <p className="text-sm text-semantic-success/70">Required Complete</p>
            <p className="text-2xl font-bold text-semantic-success">
              {requiredDocs.filter(d => d.status === 'valid').length}/{requiredDocs.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-semantic-warning/10 border-semantic-warning/20">
          <CardContent className="pt-4">
            <p className="text-sm text-semantic-warning/70">Pending Action</p>
            <p className="text-2xl font-bold text-semantic-warning">{pendingDocs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive/70">Expiring Soon</p>
            <p className="text-2xl font-bold text-destructive">{expiringDocs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="bg-card/80 border-border">
        <CardContent className="pt-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground mb-1">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <label>
              <Button variant="outline" className="cursor-pointer">
                Browse Files
              </Button>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-4">
              Supported: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (Max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">All Documents</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-card/70 border-border"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
                <SelectTrigger className="w-40 bg-card/70 border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-40 bg-card/70 border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDocuments.map((doc, index) => {
              const FileIcon = getFileIcon(doc.fileType);
              const statusConfig = STATUS_CONFIG[doc.status];
              const StatusIcon = statusConfig.icon;
              const categoryConfig = CATEGORY_CONFIG[doc.category];

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-muted/60">
                    <FileIcon className="w-6 h-6 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{doc.name}</p>
                      {doc.isRequired && (
                        <Badge variant="outline" className="text-xs border-semantic-warning/50 text-semantic-warning">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full", categoryConfig.color)} />
                        {categoryConfig.label}
                      </span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>Uploaded {doc.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-1.5 text-sm", statusConfig.color)}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(doc.id)}
                      className="h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload?.(doc.id)}
                      className="h-8 w-8"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(doc.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload?.(doc.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(doc.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No documents found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
