"use client";

import { useParams, useRouter } from "next/navigation";
import { clients, archivedNotes, phases } from "@/lib/data";
import { useDemoStore } from "@/lib/demo-store";
import {
  Plus,
  FileText,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { NewNoteModal } from "@/components/new-note-modal";

export default function ClientFolderPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const client = clients.find((c) => c.id === clientId);
  const archived = archivedNotes[clientId] || [];
  const demoState = useDemoStore();

  const [showNewNote, setShowNewNote] = useState(false);

  if (!client) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-center text-muted-foreground">
        Client not found.
      </div>
    );
  }

  const isDemoClient = clientId === "summit-home";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Client header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: client.color + "15" }}
          >
            {client.logo}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-onyx tracking-tight">
              {client.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Last active: {client.lastActivity}
            </p>
          </div>
        </div>
        {isDemoClient && (
          <Button
            className="bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-2"
            onClick={() => setShowNewNote(true)}
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        )}
      </div>

      {/* Active notes */}
      {isDemoClient && demoState.demoNoteCreated && demoState.demoNote && (
        <div className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Active
          </h2>
          <div
            className="bg-white rounded-xl border border-persian-orange/30 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => router.push(`/client/${clientId}/note`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-spanish-orange" />
                <div>
                  <h3 className="font-semibold text-onyx group-hover:text-spanish-orange transition-colors">
                    {demoState.demoNote.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor:
                          phases.find((p) => p.id === demoState.currentPhase)
                            ?.color + "15",
                        color: phases.find(
                          (p) => p.id === demoState.currentPhase
                        )?.color,
                      }}
                    >
                      {
                        phases.find((p) => p.id === demoState.currentPhase)
                          ?.label
                      }
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      · {demoState.demoNote.sourceTag}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-persian-orange/20 flex items-center justify-center text-[10px] font-medium text-persian-orange">
                  AW
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for non-demo clients or if no note created */}
      {isDemoClient && !demoState.demoNoteCreated && archived.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-onyx mb-1">No notes yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first note to get started
          </p>
          <Button
            className="bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-2"
            onClick={() => setShowNewNote(true)}
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      )}

      {!isDemoClient && archived.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-onyx mb-1">No notes yet</h3>
          <p className="text-sm text-muted-foreground">
            Notes for this client will appear here
          </p>
        </div>
      )}

      {/* Archived notes */}
      {archived.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Archive className="w-3.5 h-3.5" />
            Archived
          </h2>
          <div className="space-y-3 stagger-children">
            {archived.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-border p-4 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <div>
                      <h3 className="font-medium text-onyx text-sm">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-green-50 text-green-700"
                        >
                          Complete
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          · Archived {note.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {note.collaborators.map((c) => (
                      <div
                        key={c}
                        className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground"
                      >
                        {c[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Note Modal */}
      <NewNoteModal
        open={showNewNote}
        onClose={() => setShowNewNote(false)}
        clientId={clientId}
      />
    </div>
  );
}
