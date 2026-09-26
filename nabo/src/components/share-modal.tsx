"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Link2, Globe } from "lucide-react";
import { useToast } from "@/components/toast-provider";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const { showToast } = useToast();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-spanish-orange" />
            Share Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Share link */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Share link
            </label>
            <div className="flex gap-2">
              <Input
                className="text-sm bg-snow"
                value="https://app.nabo.io/note/demo-note-1"
                readOnly
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => showToast("Link copied to clipboard")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Anyone with the link can view and edit
            </p>
          </div>

          {/* People with access */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              People with access
            </label>
            <div className="space-y-2">
              {[
                { name: "You", email: "owner@example.com", role: "Owner" },
                { name: "Sarah", email: "sarah@example.com", role: "Editor" },
                { name: "Mike", email: "mike@example.com", role: "Editor" },
              ].map((person) => (
                <div
                  key={person.email}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div className="w-7 h-7 rounded-full bg-persian-orange/20 flex items-center justify-center text-xs font-medium text-persian-orange">
                    {person.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-onyx truncate">
                      {person.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {person.email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {person.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-spanish-orange hover:bg-spanish-orange/90 text-white"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
