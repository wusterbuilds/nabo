"use client";

import Link from "next/link";
import { clients } from "@/lib/data";
import { FolderOpen, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-onyx tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a client folder to view and manage their campaigns
          </p>
        </div>
        <Button className="bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          New Client
        </Button>
      </div>

      {/* Client folder grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        {clients.map((client) => (
          <Link key={client.id} href={`/client/${client.id}`}>
            <div className="group bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-persian-orange/40 transition-all duration-200 cursor-pointer">
              {/* Folder icon + logo */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: client.color + "15" }}
                >
                  {client.logo}
                </div>
                <FolderOpen className="w-5 h-5 text-muted-foreground/40 group-hover:text-persian-orange transition-colors" />
              </div>

              {/* Client name */}
              <h2 className="font-semibold text-onyx text-base mb-1 group-hover:text-spanish-orange transition-colors">
                {client.name}
              </h2>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {client.archivedNotes} note
                  {client.archivedNotes !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span>Last active: {client.lastActivity}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
