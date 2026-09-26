"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDemoStore } from "@/lib/demo-store";
import {
  demoTranscript,
  demoCampaignConfig,
  demoMetrics,
  demoClientReport,
  teamMembers,
} from "@/lib/data";
import type { ActionItem } from "@/lib/data";
import { Commentable } from "./commentable";
import { CollapsibleSection } from "./collapsible-section";
import { MetricCard } from "@/components/metric-card";
import { useToast } from "@/components/toast-provider";
import {
  Video,
  MessageSquare,
  Mail,
  Sparkles,
  Clock,
  User,
  Calendar,
  Rocket,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Play,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ─── Import Widget ──────────────────────────────────────────
export function ImportWidget() {
  const state = useDemoStore();

  if (state.transcriptImported) {
    return (
      <Commentable id="transcript">
        <div className="rounded-lg bg-snow border border-border/60 my-2 overflow-hidden">
          <CollapsibleSection
            title="Zoom Transcript"
            icon={Video}
            iconColor="text-blue-600"
            defaultOpen={false}
            className="px-4 pt-2 pb-1"
          >
            <div className="text-[14px] leading-relaxed text-onyx whitespace-pre-wrap pb-3">
              {demoTranscript}
            </div>
          </CollapsibleSection>
        </div>
      </Commentable>
    );
  }

  if (state.transcriptStreaming) {
    return (
      <div className="rounded-lg bg-snow border border-border/60 p-4 my-2 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-[11px] font-medium text-blue-600">
            Importing transcript from Zoom...
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 my-2">
      <button
        onClick={state.importTranscript}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-white hover:bg-snow hover:border-persian-orange/30 transition-all text-[13px] text-onyx"
      >
        <Video className="w-3.5 h-3.5 text-blue-600" />
        Import from Zoom
      </button>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-white text-[13px] text-muted-foreground/50 cursor-not-allowed">
        <MessageSquare className="w-3.5 h-3.5" />
        Slack
      </button>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-white text-[13px] text-muted-foreground/50 cursor-not-allowed">
        <Mail className="w-3.5 h-3.5" />
        Email
      </button>
    </div>
  );
}

// ─── AI Action Buttons (inline, compact) ────────────────────
interface AIActionsProps {
  phase: "strategize" | "plan" | "live" | "monitor";
}

export function AIActions({ phase }: AIActionsProps) {
  const state = useDemoStore();

  const actions: Record<string, { label: string; onClick: () => void; disabled: boolean; loading: boolean }[]> = {
    strategize: [
      {
        label: "Draft Strategy Brief",
        onClick: state.generateStrategyBrief,
        disabled: !state.transcriptImported || state.strategyBriefGenerated,
        loading: state.strategyBriefStreaming,
      },
    ],
    plan: [
      {
        label: "Generate Action Plan",
        onClick: state.generateActionPlan,
        disabled: state.actionPlanGenerated,
        loading: state.actionPlanStreaming,
      },
      {
        label: "Check for Gaps",
        onClick: state.generateGapAnalysis,
        disabled: !state.actionPlanAccepted || state.gapAnalysisGenerated,
        loading: state.gapAnalysisStreaming,
      },
    ],
    live: [],
    monitor: [
      {
        label: "Surface Insights",
        onClick: state.generateInsights,
        disabled: state.insightsGenerated,
        loading: state.insightsStreaming,
      },
      {
        label: "Draft Client Report",
        onClick: state.generateReport,
        disabled: state.reportGenerated,
        loading: state.reportStreaming,
      },
    ],
  };

  const phaseActions = actions[phase] || [];
  const allDone = phaseActions.every((a) => a.disabled && !a.loading);

  if (allDone) return null;

  return (
    <div className="flex items-center gap-1.5 my-1">
      {phaseActions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium transition-all
            ${
              action.disabled
                ? "text-muted-foreground/30 cursor-default"
                : action.loading
                ? "text-persian-orange bg-persian-orange/5 animate-pulse"
                : "text-persian-orange/80 hover:text-persian-orange hover:bg-persian-orange/5 cursor-pointer"
            }
          `}
        >
          <Sparkles className="w-3 h-3" />
          {action.loading ? "Generating..." : action.label}
        </button>
      ))}
    </div>
  );
}

// ─── Streaming Indicator ────────────────────────────────────
export function StreamingBlock() {
  return (
    <div className="py-1 my-1">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-persian-orange animate-pulse" />
        <span className="text-[11px] text-persian-orange font-medium">
          Writing...
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-persian-orange/8 rounded animate-pulse w-full" />
        <div className="h-3 bg-persian-orange/8 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-persian-orange/8 rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

// ─── Action Items Widget (v2 — Human / AI split) ────────────

const ASSIGNEE_OPTIONS = [...teamMembers, "AI"];

/** Small inline assignee picker */
function AssigneePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-onyx transition-colors"
      >
        {value === "AI" ? (
          <Sparkles className="w-2.5 h-2.5 text-spanish-orange" />
        ) : (
          <User className="w-2.5 h-2.5" />
        )}
        {value}
        <ChevronDown className="w-2 h-2 opacity-50" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-md border border-border shadow-md py-0.5 min-w-[100px]">
          {ASSIGNEE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1 text-[11px] hover:bg-snow transition-colors flex items-center gap-1.5 ${
                opt === value ? "text-spanish-orange font-medium" : "text-onyx"
              }`}
            >
              {opt === "AI" ? (
                <Sparkles className="w-2.5 h-2.5 text-spanish-orange" />
              ) : (
                <User className="w-2.5 h-2.5 text-muted-foreground" />
              )}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Single action item row */
function ActionItemRow({
  item,
  isFirst,
  locked,
}: {
  item: ActionItem;
  isFirst: boolean;
  locked: boolean;
}) {
  const state = useDemoStore();
  const titleRef = useRef<HTMLSpanElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleToggle = useCallback(() => {
    if (locked) return;
    state.updateActionItem(item.id, {
      status: item.status === "pending" ? "complete" : "pending",
    });
  }, [locked, item.id, item.status, state]);

  const handleRun = useCallback(() => {
    if (locked || running) return;
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      state.updateActionItem(item.id, { status: "complete" });
    }, 1500);
  }, [locked, running, item.id, state]);

  const handleUpload = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(file.name);
        state.updateActionItem(item.id, { status: "complete" });
      }
    },
    [item.id, state]
  );

  const isDone = item.status === "complete";

  return (
    <div
      className={`group/row flex items-start gap-2.5 px-3 py-2 ${
        !isFirst ? "border-t border-border/40" : ""
      } ${locked ? "opacity-75" : "hover:bg-snow/30"}`}
    >
      {/* Checkbox */}
      <button onClick={handleToggle} className="mt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          {/* Editable title */}
          <span
            ref={titleRef}
            contentEditable={!locked}
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={() => {
              const text = titleRef.current?.textContent || "";
              if (text !== item.title) {
                state.updateActionItem(item.id, { title: text });
              }
            }}
            className={`flex-1 text-[13px] outline-none rounded px-0.5 -mx-0.5 focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors ${
              isDone ? "line-through text-muted-foreground" : "text-onyx"
            }`}
          >
            {item.title}
          </span>

          {/* Action button */}
          {item.actionType === "upload" && !isDone && (
            <>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
              <button
                onClick={handleUpload}
                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-2.5 h-2.5" />
                {item.actionLabel || "Upload"}
              </button>
            </>
          )}
          {item.actionType === "upload" && isDone && uploadedFile && (
            <span className="shrink-0 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
              ✓ {uploadedFile}
            </span>
          )}
          {item.actionType === "run" && !isDone && (
            <button
              onClick={handleRun}
              disabled={running}
              className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                running
                  ? "text-spanish-orange bg-spanish-orange/10 animate-pulse"
                  : "text-spanish-orange bg-spanish-orange/5 hover:bg-spanish-orange/15"
              }`}
            >
              <Play className="w-2.5 h-2.5" />
              {running ? "Running..." : "Run"}
            </button>
          )}
          {item.actionType === "run" && isDone && (
            <span className="shrink-0 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
              ✓ Done
            </span>
          )}

          {/* Delete */}
          {!locked && (
            <button
              onClick={() => state.deleteActionItem(item.id)}
              className="shrink-0 p-0.5 opacity-0 group-hover/row:opacity-40 hover:!opacity-100 text-muted-foreground hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {item.subItems && (
          <div className="mt-0.5 ml-0.5">
            {item.subItems.map((sub, j) => (
              <p key={j} className="text-[12px] text-muted-foreground">
                · {sub}
              </p>
            ))}
          </div>
        )}

        {/* Meta: assignee + due date */}
        <div className="flex items-center gap-2 mt-1">
          <AssigneePicker
            value={item.assignee}
            onChange={(v) => state.updateActionItem(item.id, { assignee: v })}
          />
          <span
            contentEditable={!locked}
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={(e) => {
              const text = (e.target as HTMLElement).textContent || "";
              if (text !== item.dueDate) {
                state.updateActionItem(item.id, { dueDate: text });
              }
            }}
            className="text-[11px] text-muted-foreground flex items-center gap-0.5 outline-none rounded focus:ring-1 focus:ring-persian-orange/20 px-0.5 -mx-0.5"
          >
            <Calendar className="w-2.5 h-2.5 shrink-0" /> {item.dueDate || "No date"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActionItemsWidget() {
  const state = useDemoStore();

  if (state.actionItems.length === 0) return null;

  const humanTasks = state.actionItems.filter((i) => i.assignee !== "AI");
  const aiTasks = state.actionItems.filter((i) => i.assignee === "AI");
  const locked = state.planApproved;

  const renderSection = (
    label: string,
    SectionIcon: typeof User,
    items: ActionItem[],
    defaultAssignee: string,
    iconColorClass: string,
  ) => {
    const doneCount = items.filter((i) => i.status === "complete").length;
    return (
      <div className="my-2">
        <CollapsibleSection
          title={label}
          icon={SectionIcon}
          iconColor={iconColorClass}
          badge={
            <span className="text-[10px] text-muted-foreground/50">
              {doneCount}/{items.length}
            </span>
          }
        >
          <div className="rounded-lg border border-border/60 bg-white overflow-hidden">
            {items.map((item, i) => (
              <ActionItemRow key={item.id} item={item} isFirst={i === 0} locked={locked} />
            ))}
            {!locked && (
              <button
                onClick={() => state.addActionItem(defaultAssignee)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground hover:bg-snow/50 transition-colors border-t border-border/30"
              >
                <Plus className="w-3 h-3" />
                Add task
              </button>
            )}
          </div>
        </CollapsibleSection>
      </div>
    );
  };

  return (
    <Commentable id="action-items">
      <div>
        {renderSection(
          "Team Tasks",
          User,
          humanTasks,
          "Sarah",
          "text-blue-600",
        )}
        {renderSection(
          "AI Tasks",
          Sparkles,
          aiTasks,
          "AI",
          "text-spanish-orange",
        )}
      </div>
    </Commentable>
  );
}

// ─── Campaign Config Widget ─────────────────────────────────
import { Settings } from "lucide-react";

export function CampaignConfigWidget() {
  const state = useDemoStore();
  if (!state.campaignConfigGenerated) return null;

  return (
    <Commentable id="campaign-config">
      <CollapsibleSection
        title="Campaign Configuration"
        icon={Settings}
        iconColor="text-spanish-orange"
        className="my-2"
      >
        <div className="rounded-lg border border-border/60 bg-white p-3">
          <div
            className="text-[13px] leading-relaxed text-onyx whitespace-pre-wrap outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            {demoCampaignConfig.split("\n").map((line, i) => {
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <div key={i}>
                  {parts.map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}

// ─── Deployment Panel (consolidated Go Live control) ─────────
import { Undo2, Square } from "lucide-react";

export function DeploymentPanel() {
  const state = useDemoStore();
  const logRef = useRef<HTMLDivElement>(null);
  const [logExpanded, setLogExpanded] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.agentLog.length]);

  const hasLog = state.agentLog.length > 0;
  const hasCampaigns = state.createdCampaigns.length > 0;

  return (
    <Commentable id="deployment-panel">
      <div className="my-2 rounded-lg border border-border/60 bg-white overflow-hidden">
        {/* ── Header + Toolbar ──────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 bg-snow/30 cursor-pointer group/deploy-header"
          onClick={() => setPanelOpen((p) => !p)}
        >
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground/50 transition-transform duration-150 ${
              panelOpen ? "" : "-rotate-90"
            }`}
          />
          <Rocket className="w-3.5 h-3.5 text-spanish-orange" />
          <span className="text-[13px] font-semibold text-onyx group-hover/deploy-header:text-spanish-orange transition-colors">
            Deployment Control
          </span>

          {/* Live mode toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); state.toggleLiveMode(); }}
            className={`ml-auto flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
              state.liveMode
                ? "text-green-600 bg-green-100 hover:bg-green-200"
                : "text-muted-foreground bg-muted/50 hover:bg-muted"
            }`}
          >
            {state.liveMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            {state.liveMode ? "LIVE" : "MOCK"}
          </button>
        </div>

        {/* Panel body — collapsible */}
        {panelOpen && (<>
          {/* ── Action Buttons ───────────────────────────────── */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Deploy */}
            <Button
              size="sm"
              className="bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-1.5 h-8 text-[12px]"
              onClick={state.deployAll}
              disabled={state.deploying || state.deployed}
            >
              <Rocket className="w-3.5 h-3.5" />
              {state.deployed ? "Deployed" : "Deploy All"}
            </Button>

            {/* Stop */}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-[12px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={state.stopDeploy}
              disabled={!state.deploying}
            >
              <Square className="w-3 h-3" />
              Stop
            </Button>

            {/* Revert */}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-[12px]"
              onClick={state.revertDeploy}
              disabled={!state.deployed || state.deploying}
            >
              <Undo2 className="w-3 h-3" />
              Revert
            </Button>

            {/* Status indicator */}
            <div className="ml-auto">
              {state.deploying && (
                <span className="text-[11px] text-spanish-orange font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  Deploying...
                </span>
              )}
              {state.deployed && !state.deploying && (
                <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live — Feb 10, 2026
                </span>
              )}
              {state.deployError && !state.deploying && !state.deployed && (
                <span className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                  <Circle className="w-3 h-3" />
                  Failed
                </span>
              )}
            </div>
          </div>

          {/* ── Progress Bar (while deploying) ───────────────── */}
          {state.deploying && (
            <div className="px-3 pb-2">
              <Progress value={state.deployProgress} className="h-1.5" />
            </div>
          )}

          {/* ── Error Banner ─────────────────────────────────── */}
          {state.deployError && !state.deploying && (
            <div className="mx-3 mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <div className="text-[12px] text-red-700 font-medium">Deployment failed</div>
              <div className="text-[11px] text-red-600 mt-0.5">{state.deployError}</div>
            </div>
          )}

          {/* ── Campaign Tree (after deploy) ─────────────────── */}
          {hasCampaigns && (
            <div className="mx-3 mb-2 rounded-md border border-green-200 bg-green-50/50 p-2.5 space-y-1.5">
              <div className="text-[10px] font-medium text-green-700 uppercase tracking-wide mb-1">
                Deployed Resources
              </div>
              {state.createdCampaigns.map((c) => (
                <div key={c.name} className="space-y-0.5">
                  {/* Campaign */}
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                    <span className="text-green-800 font-medium">{c.name}</span>
                    {c.id && (
                      <span className="text-green-600/70 font-mono text-[10px]">#{c.id}</span>
                    )}
                  </div>
                  {/* Ad Sets */}
                  {c.adSets && c.adSets.length > 0 && (
                    <div className="ml-5 space-y-0.5">
                      {c.adSets.map((as) => (
                        <div key={as.name} className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <div className="w-2.5 h-2.5 rounded-full border border-green-400 bg-green-100 shrink-0" />
                            <span className="text-green-700">{as.name}</span>
                            {as.id && (
                              <span className="text-green-500/70 font-mono text-[9px]">#{as.id}</span>
                            )}
                          </div>
                          {/* Ads */}
                          {as.ads && as.ads.length > 0 && (
                            <div className="ml-4 space-y-0.5">
                              {as.ads.map((ad) => (
                                <div key={ad.name} className="flex items-center gap-1.5 text-[10px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                  <span className="text-green-600">{ad.name}</span>
                                  {ad.id && (
                                    <span className="text-green-400/70 font-mono text-[9px]">#{ad.id}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {state.adsManagerUrl && (
                <a
                  href={state.adsManagerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View in Meta Ads Manager
                </a>
              )}
            </div>
          )}

          {/* ── Agent Log ────────────────────────────────────── */}
          {hasLog && (
            <div className="border-t border-border/30">
              <button
                onClick={() => setLogExpanded((p) => !p)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide hover:bg-snow/30 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${logExpanded ? "" : "-rotate-90"}`}
                />
                Agent Log ({state.agentLog.length})
              </button>
              {logExpanded && (
                <div
                  ref={logRef}
                  className="px-3 pb-2 space-y-0.5 max-h-40 overflow-y-auto"
                >
                  {state.agentLog.map((entry, i) => {
                    const isSuccess = ["campaign_created", "adset_created", "ad_created", "image_uploaded", "creative_created", "complete"].includes(entry.type);
                    const isError = entry.type === "error";
                    return (
                      <div
                        key={i}
                        className={`text-[11px] font-mono leading-relaxed ${
                          isError
                            ? "text-red-600"
                            : isSuccess
                              ? entry.type === "complete" ? "text-green-700 font-semibold" : "text-green-700"
                              : "text-onyx/60"
                        }`}
                      >
                        {isSuccess ? "✓ " : isError ? "✗ " : "→ "}
                        {entry.message}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>)}
      </div>
    </Commentable>
  );
}

// ─── Metrics Widget ─────────────────────────────────────────
import { BarChart3 } from "lucide-react";

export function MetricsWidget() {
  return (
    <Commentable id="metrics-dashboard">
      <CollapsibleSection
        title="Performance Metrics"
        icon={BarChart3}
        iconColor="text-green-600"
        className="my-2"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {demoMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}

// ─── Report Widget ──────────────────────────────────────────
import { FileText } from "lucide-react";

export function ReportWidget() {
  const state = useDemoStore();
  const { showToast } = useToast();

  if (!state.reportGenerated) return null;

  return (
    <Commentable id="client-report">
      <CollapsibleSection
        title="Client Report"
        icon={FileText}
        iconColor="text-purple-600"
        className="my-2"
      >
        <div className="rounded-lg border border-border/60 bg-white p-3">
          <div
            className="text-[13px] leading-relaxed text-onyx whitespace-pre-wrap outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            {demoClientReport}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] gap-1 px-2"
            onClick={() => showToast("Copied to clipboard")}
          >
            <Copy className="w-2.5 h-2.5" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] gap-1 px-2"
            onClick={() => showToast("Sent to #summit-home on Slack")}
          >
            <MessageSquare className="w-2.5 h-2.5" />
            Slack
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] gap-1 px-2"
            onClick={() => showToast("Email sent to client@example.com")}
          >
            <Mail className="w-2.5 h-2.5" />
            Email
          </Button>
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}
