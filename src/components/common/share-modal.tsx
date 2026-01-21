"use client";

import * as React from "react";
import { Share2, Copy, Check, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type Permission = "view" | "comment" | "edit" | "admin";

interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permission: Permission;
}

interface ShareModalProps {
  title: string;
  description?: string;
  shareUrl?: string;
  sharedWith?: SharedUser[];
  onShare?: (email: string, permission: Permission) => void | Promise<void>;
  onUpdatePermission?: (userId: string, permission: Permission) => void | Promise<void>;
  onCopyLink?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
}

export function ShareModal({
  title,
  description,
  shareUrl,
  sharedWith = [],
  onShare,
  onUpdatePermission,
  onCopyLink,
  open,
  onOpenChange,
  triggerLabel = "Share",
}: ShareModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [permission, setPermission] = React.useState<Permission>("view");
  const [copied, setCopied] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyLink?.();
    }
  };

  const handleShare = async () => {
    if (!email) return;
    setIsSharing(true);
    try {
      await onShare?.(email, permission);
      setEmail("");
    } finally {
      setIsSharing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {shareUrl && (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Invite people</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={permission}
                onValueChange={(v) => setPermission(v as Permission)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleShare}
              disabled={!email || isSharing}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSharing ? "Sending..." : "Send invite"}
            </Button>
          </div>

          {sharedWith.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  People with access ({sharedWith.length})
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {sharedWith.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.avatar && <AvatarImage src={user.avatar} />}
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Select
                        value={user.permission}
                        onValueChange={(v) =>
                          onUpdatePermission?.(user.id, v as Permission)
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">Can view</SelectItem>
                          <SelectItem value="comment">Can comment</SelectItem>
                          <SelectItem value="edit">Can edit</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <Separator className="my-1" />
                          <SelectItem
                            value="remove"
                            className="text-destructive"
                          >
                            Remove
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
