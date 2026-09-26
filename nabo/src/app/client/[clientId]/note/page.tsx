"use client";

import { useParams, useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demo-store";
import { phases } from "@/lib/data";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhaseToggle } from "@/components/block-editor/phase-toggle";
import { ShareModal } from "@/components/share-modal";
import { useState, useEffect } from "react";

export default function NoteViewPage() {
  const params = useParams();
  const router = useRouter();
  const state = useDemoStore();
  const [showShare, setShowShare] = useState(false);

  // Redirect if no note exists
  useEffect(() => {
    if (!state.demoNoteCreated || !state.demoNote) {
      router.push(`/client/${params.clientId}`);
    }
  }, [state.demoNoteCreated, state.demoNote, params.clientId, router]);

  if (!state.demoNoteCreated || !state.demoNote) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Note title — editable, large, Notion-style */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1
              className="text-3xl font-bold text-onyx tracking-tight outline-none leading-tight"
              contentEditable
              suppressContentEditableWarning
            >
              {state.demoNote.title}
            </h1>
            <div className="flex items-center gap-2 mt-3 text-[13px] text-muted-foreground">
              <Badge
                variant="secondary"
                className="text-[11px] font-normal"
                style={{
                  backgroundColor:
                    phases.find((p) => p.id === state.currentPhase)?.color + "12",
                  color: phases.find((p) => p.id === state.currentPhase)?.color,
                }}
              >
                {phases.find((p) => p.id === state.currentPhase)?.label}
              </Badge>
              <span>{state.demoNote.sourceTag}</span>
              <span>·</span>
              <span>{state.demoNote.createdAt}</span>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[12px] gap-1 text-muted-foreground hover:text-onyx"
                  onClick={() => setShowShare(true)}
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thin divider */}
      <hr className="border-border/50 mb-6" />

      {/* Phase toggles — Notion-style collapsible sections */}
      <div className="space-y-1">
        {phases.map((phase) => (
          <PhaseToggle
            key={phase.id}
            phase={phase.id as "strategize" | "plan" | "live" | "monitor"}
            label={phase.label}
            color={phase.color}
            defaultExpanded={phase.id === "strategize"}
          />
        ))}
      </div>

      {/* Activity log — minimal */}
      <div className="mt-12 pt-6 border-t border-border/30">
        <div className="space-y-1.5">
          {[
            { user: "You", action: "created this note", time: "Just now" },
            ...(state.transcriptImported
              ? [{ user: "You", action: "imported Zoom transcript", time: "A moment ago" }]
              : []),
            ...(state.strategizeApproved
              ? [{ user: "You", action: "approved strategy", time: "A moment ago" }]
              : []),
            ...(state.planApproved
              ? [{ user: "You", action: "approved action plan", time: "A moment ago" }]
              : []),
            ...(state.deployed
              ? [{ user: "Nabo", action: "deployed campaigns to Meta Ads", time: "A moment ago" }]
              : []),
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
              <span className="font-medium text-muted-foreground">{entry.user}</span>
              {entry.action}
              <span className="ml-auto text-muted-foreground/40">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-24" />

      <ShareModal open={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}
