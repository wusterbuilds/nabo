"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sourceTags } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";
import { FileText } from "lucide-react";

interface NewNoteModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
}

export function NewNoteModal({ open, onClose, clientId }: NewNoteModalProps) {
  const [title, setTitle] = useState("");
  const [sourceTag, setSourceTag] = useState<string>("Client Meeting");
  const router = useRouter();
  const createDemoNote = useDemoStore((s) => s.createDemoNote);

  const handleCreate = () => {
    if (!title.trim()) return;
    createDemoNote(title, sourceTag);
    onClose();
    setTitle("");
    router.push(`/client/${clientId}/note`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-spanish-orange" />
            New Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-onyx block mb-1.5">
              Title
            </label>
            <Input
              placeholder="e.g., Audience Exclusion — Remove Past Customers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-onyx block mb-1.5">
              Source
            </label>
            <div className="flex flex-wrap gap-2">
              {sourceTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSourceTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    sourceTag === tag
                      ? "bg-persian-orange/10 border-persian-orange text-persian-orange"
                      : "bg-white border-border text-muted-foreground hover:border-persian-orange/30"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-spanish-orange hover:bg-spanish-orange/90 text-white"
              onClick={handleCreate}
              disabled={!title.trim()}
            >
              Create Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
