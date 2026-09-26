"use client";

import { useState } from "react";
import {
  ChevronRight,
  Check,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Block, BlockType, createBlock } from "./types";
import { BlockRenderer } from "./block-renderer";
import { Commentable } from "./commentable";
import { CollapsibleSection } from "./collapsible-section";
import {
  ImportWidget,
  AIActions,
  StreamingBlock,
  ActionItemsWidget,
  DeploymentPanel,
  MetricsWidget,
  ReportWidget,
} from "./widgets";
import { CampaignConfigForm } from "./campaign-config-form";
import { useDemoStore } from "@/lib/demo-store";
import {
  demoStrategyBrief,
  demoGapAnalysis,
  demoInsights,
} from "@/lib/data";
import { Button } from "@/components/ui/button";

interface PhaseToggleProps {
  phase: "strategize" | "plan" | "live" | "monitor";
  label: string;
  color: string;
  defaultExpanded?: boolean;
}

export function PhaseToggle({
  phase,
  label,
  color,
  defaultExpanded = true,
}: PhaseToggleProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [blocks, setBlocks] = useState<Block[]>([createBlock("text", "")]);
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const state = useDemoStore();

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const addBlockAfter = (afterId: string, type: BlockType = "text") => {
    const newBlock = createBlock(type);
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setFocusBlockId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) {
        // Last block: reset it to an empty text block instead of refusing to delete
        return [createBlock("text", "")];
      }
      const idx = prev.findIndex((b) => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      // Focus previous block
      if (idx > 0) setFocusBlockId(next[idx - 1].id);
      return next;
    });
  };

  const changeBlockType = (id: string, newType: BlockType) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, type: newType, content: "" } : b)));
    setFocusBlockId(id);
  };

  return (
    <div className="mb-1">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-2 w-full text-left group"
      >
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground/60 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[15px] font-semibold text-onyx group-hover:text-spanish-orange transition-colors">
          {label}
        </span>
      </button>

      {/* Phase content */}
      {expanded && (
        <div className="pl-7 pb-4">
          {/* Phase-specific widgets and AI actions */}
          {phase === "strategize" && (
            <>
              <AIActions phase="strategize" />
              <ImportWidget />
              {state.strategyBriefStreaming && <StreamingBlock />}
              {state.strategyBriefGenerated && (
                <StrategyBriefInline />
              )}
            </>
          )}

          {phase === "plan" && (
            <>
              <AIActions phase="plan" />
              {state.actionPlanStreaming && <StreamingBlock />}
              {state.actionPlanGenerated && !state.actionPlanAccepted && (
                <ActionPlanAcceptBlock />
              )}
              {state.actionPlanAccepted && <ActionItemsWidget />}
              {state.actionPlanAccepted && <CampaignConfigForm />}
              {state.gapAnalysisStreaming && <StreamingBlock />}
              {state.gapAnalysisGenerated && <GapAnalysisInline />}
              {state.actionPlanAccepted && !state.planApproved && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    className="bg-spanish-orange hover:bg-spanish-orange/90 text-white text-[12px] h-7"
                    onClick={state.approvePlan}
                  >
                    Approve Plan
                  </Button>
                </div>
              )}
            </>
          )}

          {phase === "live" && (
            <>
              <DeploymentPanel />
            </>
          )}

          {phase === "monitor" && (
            <>
              <AIActions phase="monitor" />
              <MetricsWidget />
              {state.insightsStreaming && <StreamingBlock />}
              {state.insightsGenerated && <InsightsInline />}
              {state.reportStreaming && <StreamingBlock />}
              <ReportWidget />
            </>
          )}

          {/* Freeform blocks */}
          <div className="mt-2">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                phase={phase}
                onChange={(updates) => updateBlock(block.id, updates)}
                onEnter={() => addBlockAfter(block.id)}
                onDelete={() => deleteBlock(block.id)}
                onTypeChange={(newType) => changeBlockType(block.id, newType)}
                autoFocus={focusBlockId === block.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline Ghost AI Components ─────────────────────────────

function StrategyBriefInline() {
  const state = useDemoStore();
  const lines = demoStrategyBrief.split("\n").filter((l) => l.trim());

  if (!state.strategyBriefAccepted) {
    return (
      <Commentable id="strategy-brief">
        <div className="my-2 relative">
          <div
            className="border-l-2 border-persian-orange/20 pl-3 outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            {lines.map((line, i) => {
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className="text-[14px] leading-relaxed text-onyx/80 py-0.5">
                  {parts.map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j} className="font-semibold text-onyx">{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Button
              size="sm"
              className="h-6 text-[11px] bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-1 px-2"
              onClick={state.acceptStrategyBrief}
            >
              <Check className="w-2.5 h-2.5" />
              Accept
            </Button>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI generated
            </span>
          </div>
        </div>
      </Commentable>
    );
  }

  // Accepted: looks like regular text, editable, collapsible
  return (
    <Commentable id="strategy-brief">
      <CollapsibleSection
        title="Strategy Brief"
        icon={Lightbulb}
        iconColor="text-purple-500"
        className="my-2"
        badge={
          <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        }
      >
        <div
          className="outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        >
          {lines.map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-[14px] leading-relaxed text-onyx py-0.5 group relative">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            );
          })}
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}

function ActionPlanAcceptBlock() {
  const state = useDemoStore();

  const humanTasks = state.actionItems.filter((i) => i.assignee !== "AI");
  const aiTasks = state.actionItems.filter((i) => i.assignee === "AI");

  const renderSection = (label: string, items: typeof humanTasks) =>
    items.length > 0
      ? `${label}\n` +
        items
          .map((item, i) => {
            let line = `  ${i + 1}. ${item.title} — ${item.assignee} — ${item.dueDate}`;
            if (item.subItems) line += "\n" + item.subItems.map((s) => `     · ${s}`).join("\n");
            return line;
          })
          .join("\n")
      : "";

  const planText = [renderSection("👤 Team Tasks", humanTasks), renderSection("🤖 AI Tasks", aiTasks)]
    .filter(Boolean)
    .join("\n\n");

  return (
    <Commentable id="action-plan">
      <div className="my-2">
        <div className="border-l-2 border-persian-orange/20 pl-3">
          <pre
            className="text-[13px] leading-relaxed text-onyx/80 whitespace-pre-wrap font-sans outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
          >
            {planText}
          </pre>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            size="sm"
            className="h-6 text-[11px] bg-spanish-orange hover:bg-spanish-orange/90 text-white gap-1 px-2"
            onClick={state.acceptActionPlan}
          >
            <Check className="w-2.5 h-2.5" />
            Accept
          </Button>
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI generated
          </span>
        </div>
      </div>
    </Commentable>
  );
}

function GapAnalysisInline() {
  return (
    <Commentable id="gap-analysis">
      <CollapsibleSection
        title="Gap Analysis"
        icon={AlertTriangle}
        iconColor="text-amber-500"
        className="my-1"
        badge={
          <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        }
      >
        <p
          className="text-[14px] leading-relaxed text-onyx py-0.5 outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        >
          {demoGapAnalysis}
        </p>
      </CollapsibleSection>
    </Commentable>
  );
}


function InsightsInline() {
  const lines = demoInsights.split("\n").filter((l) => l.trim());
  return (
    <Commentable id="insights">
      <CollapsibleSection
        title="Performance Insights"
        icon={TrendingUp}
        iconColor="text-green-600"
        className="my-2"
        badge={
          <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        }
      >
        <div
          className="outline-none rounded focus:ring-1 focus:ring-persian-orange/20 focus:bg-persian-orange/[0.02] transition-colors"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
        >
          {lines.map((line, i) => {
            const cleaned = line.replace(/\*\*/g, "").replace(/^[•]\s*/, "");
            const isBullet = line.startsWith("•");
            return (
              <p
                key={i}
                className={`text-[14px] leading-relaxed text-onyx py-0.5 ${
                  isBullet ? "pl-4 relative" : ""
                }`}
              >
                {isBullet && <span className="absolute left-0 text-persian-orange">·</span>}
                {cleaned}
              </p>
            );
          })}
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}


