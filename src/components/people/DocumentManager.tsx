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
  contract: { label: 'Contract', color: 'bg-blue-500' },
  policy: { label: 'Policy', color: 'bg-purple-500' },
  certification: { label: 'Certification', color: 'bg-emerald-500' },
  personal: { label: 'Personal', color: 'bg-amber-500' },
  tax: { label: 'Tax', color: 'bg-rose-500' },
  other: { label: 'Other', color: 'bg-zinc-500' },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; icon: React.ElementType; color: string }> = {
  valid: { label: 'Valid', icon: CheckCircle2, color: 'text-emerald-400' },
  pending: { label: 'Pending Review', icon: Clock, color: 'text-amber-400' },
  expired: { label: 'Expired', icon: AlertTriangle, color: 'text-rose-400' },
  requires_signature: { label: 'Needs Signature', icon: FileText, color: 'text-blue-400' },
};

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'Employment Contract.pdf', category: 'contract', fileType: 'pdf', fileSize: 245000, uploadedAt: new Date('2023-06-15'), status: 'valid', uploadedBy: 'HR System', isRequired: true },
  { id: '2', name: 'NDA Agreement.pdf', category: 'contract', fileType: 'pdf', fileSize: 128000, uploadedAt: new Date('2023-06-15'), status: 'valid', uploadedBy: 'HR System', isRequired: true },
  { id: '3', name: 'Safety Certification.pdf', category: 'certification', fileType: 'pdf', fileSize: 512000, uploadedAt: new Date('2024-01-10'), expiresAt: new Date('2026-01-10'), status: 'valid', uploadedBy: 'Training Dept' },
  { id: '4', name: 'First Aid Certificate.jpg', category: 'certification', fileType: 'jpg', fileSize: 1024000, uploadedAt: new Date('2024-06-01'), expiresAt: new Date('2026-03-15'), status: 'valid', uploadedBy: 'Sarah Chen' },
  { id: '5', name: 'W-4 Form 2026.pdf', category: 'tax', fileType: 'pdf', fileSize: 89000, uploadedAt: new Date('2026-01-05'), status: 'pending', uploadedBy: 'Sarah Chen' },
  { id: '6', name: 'Performance Review 2025.pdf', category: 'personal', fileType: 'pdf', fileSize: 156000, uploadedAt: new Date('2025-12-15'), status: 'requires_signature', uploadedBy: 'HR System' },
  { id: '7', name: 'Company Handbook v3.pdf', category: 'policy', fileType: 'pdf', fileSize: 2048000, uploadedAt: new Date('2025-01-01'), status: 'valid', uploadedBy: 'HR System', isRequired: true },
];

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
  documents = MOCK_DOCUMENTS,
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
          <p className="text-sm text-zinc-400 mt-1">
            Manage employee documents, contracts, and certifications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">Total Documents</p>
            <p className="text-2xl font-bold text-white">{documents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-emerald-300/70">Required Complete</p>
            <p className="text-2xl font-bold text-emerald-400">
              {requiredDocs.filter(d => d.status === 'valid').length}/{requiredDocs.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-300/70">Pending Action</p>
            <p className="text-2xl font-bold text-amber-400">{pendingDocs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-rose-300/70">Expiring Soon</p>
            <p className="text-2xl font-bold text-rose-400">{expiringDocs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="bg-zinc-900/60 border-border">
        <CardContent className="pt-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-300 mb-1">Drag and drop files here</p>
            <p className="text-sm text-zinc-500 mb-4">or</p>
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
            <p className="text-xs text-zinc-600 mt-4">
              Supported: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (Max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-zinc-900/60 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-zinc-300">All Documents</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-zinc-800/50 border-border"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
                <SelectTrigger className="w-40 bg-zinc-800/50 border-border">
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
                <SelectTrigger className="w-40 bg-zinc-800/50 border-border">
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
                  className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/30 border border-border hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-zinc-700/50">
                    <FileIcon className="w-6 h-6 text-zinc-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{doc.name}</p>
                      {doc.isRequired && (
                        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
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
                          className="text-rose-400 focus:text-rose-400"
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
              <div className="text-center py-12 text-zinc-500">
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
