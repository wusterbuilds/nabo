"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import {
  Sparkles,
  Send,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Block } from "./types";
import { useDemoStore } from "@/lib/demo-store";
import {
  demoTranscript,
  demoStrategyBrief,
  demoCampaignConfig,
  demoGapAnalysis,
  demoValidation,
  demoInsights,
  demoClientReport,
  demoDiscussionThread,
} from "@/lib/data";

// ─── Notepad context builder ────────────────────────────────

function buildNotepadContext(): string {
  const s = useDemoStore.getState();
  const parts: string[] = [];

  // Strategize
  if (s.transcriptImported) {
    parts.push(`## Zoom Transcript\n${demoTranscript}`);
  }
  if (s.strategyBriefGenerated) {
    parts.push(`## Strategy Brief\n${demoStrategyBrief}`);
  }

  // Plan
  if (s.actionPlanGenerated && s.actionItems.length > 0) {
    const items = s.actionItems
      .map(
        (item) =>
          `- [${item.status}] ${item.title} (${item.assignee}, due ${item.dueDate})`
      )
      .join("\n");
    parts.push(`## Action Plan\n${items}`);
  }
  if (s.discussionVisible) {
    const msgs = demoDiscussionThread
      .map((m) => `${m.author}: ${m.message}`)
      .join("\n");
    parts.push(`## Team Discussion\n${msgs}`);
  }
  if (s.gapAnalysisGenerated) {
    parts.push(`## Gap Analysis\n${demoGapAnalysis}`);
  }

  // Go Live
  if (s.campaignConfigGenerated) {
    parts.push(`## Campaign Configuration\n${demoCampaignConfig}`);
  }
  if (s.validationGenerated) {
    parts.push(`## Validation\n${demoValidation}`);
  }
  if (s.deployed) {
    const campaignList = s.createdCampaigns.length > 0
      ? s.createdCampaigns.map((c) => `- ${c.name} (ID: ${c.id})`).join("\n")
      : "- Summit — Search Lead Gen\n- Summit — Retargeting Warm Leads\n- Summit — Lookalike Expansion\n- Summit — Local Awareness";
    parts.push(`## Deployment Status\nAll 4 campaigns deployed to Meta Ads on Feb 10, 2026.\n${campaignList}`);
  }

  // Monitor
  if (s.insightsGenerated) {
    parts.push(`## Performance Insights\n${demoInsights}`);
  }
  if (s.reportGenerated) {
    parts.push(`## Client Report Draft\n${demoClientReport}`);
  }

  return parts.join("\n\n");
}

// ─── Types ──────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Phase config ───────────────────────────────────────────

const PHASE_CONFIG: Record<
  string,
  { accent: string; placeholder: string; followUp: string; label: string }
> = {
  strategize: {
    accent: "border-purple-400",
    placeholder:
      "Ask about past performance, audience insights, competitor benchmarks...",
    followUp: "Follow up on strategy...",
    label: "Strategy Assistant",
  },
  plan: {
    accent: "border-blue-400",
    placeholder:
      "Ask about risk analysis, task priorities, resource allocation...",
    followUp: "Follow up on plan...",
    label: "Planning Assistant",
  },
  live: {
    accent: "border-spanish-orange",
    placeholder:
      "Ask about audience reach, targeting validation, campaign audit...",
    followUp: "Follow up on campaign...",
    label: "Campaign Assistant",
  },
  monitor: {
    accent: "border-green-500",
    placeholder:
      "Ask about campaign performance, trends, optimization recommendations...",
    followUp: "Follow up on analysis...",
    label: "Performance Analyst",
  },
};

const DEFAULT_CONFIG = {
  accent: "border-persian-orange",
  placeholder: "Ask AI anything...",
  followUp: "Follow up...",
  label: "AI Assistant",
};

// ─── Markdown renderer ──────────────────────────────────────

function parseMarkdownTable(
  lines: string[]
): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const headerLine = lines[0];
  if (!headerLine.includes("|")) return null;
  const separatorLine = lines[1];
  if (!separatorLine.match(/^\|?[\s-:|]+\|?$/)) return null;

  const parseRow = (line: string): string[] =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && !c.match(/^[-:]+$/));

  const headers = parseRow(headerLine);
  if (headers.length === 0) return null;

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("|")) break;
    const cells = parseRow(line);
    if (cells.length > 0) rows.push(cells);
  }

  return rows.length > 0 ? { headers, rows } : null;
}

function MarkdownTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="my-2 rounded-lg border border-border/60 overflow-hidden bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 w-full px-3 py-1.5 bg-snow/80 text-[11px] font-medium text-muted-foreground hover:bg-snow transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        Data Table · {rows.length} rows
      </button>
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/40 bg-snow/40">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-1.5 font-semibold text-onyx whitespace-nowrap"
                  >
                    {renderInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border/20 hover:bg-snow/30"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-1.5 text-onyx/80 whitespace-nowrap"
                    >
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-onyx">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith("`") && cp.endsWith("`")) {
        return (
          <code
            key={`${i}-${j}`}
            className="px-1 py-0.5 bg-snow rounded text-[11px] font-mono text-persian-orange"
          >
            {cp.slice(1, -1)}
          </code>
        );
      }
      return <span key={`${i}-${j}`}>{cp}</span>;
    });
  });
}

function RichResponse({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const tableData = parseMarkdownTable(lines.slice(i));
    if (tableData) {
      elements.push(
        <MarkdownTable
          key={`table-${i}`}
          headers={tableData.headers}
          rows={tableData.rows}
        />
      );
      i += 2 + tableData.rows.length;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={i}
          className="text-[13px] font-semibold text-onyx mt-2 mb-0.5"
        >
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={i}
          className="text-[14px] font-semibold text-onyx mt-2 mb-0.5"
        >
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
    } else if (line.match(/^[-*•]\s/)) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 py-0.5">
          <span className="text-persian-orange mt-1 text-[8px] shrink-0">
            ●
          </span>
          <span className="text-[13px] text-onyx/80 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^[-*•]\s/, ""))}
          </span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1];
      elements.push(
        <div key={i} className="flex items-start gap-1.5 py-0.5">
          <span className="text-persian-orange/70 text-[12px] font-medium shrink-0 w-4 text-right">
            {num}.
          </span>
          <span className="text-[13px] text-onyx/80 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ""))}
          </span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p
          key={i}
          className="text-[13px] text-onyx/80 leading-relaxed py-0.5"
        >
          {renderInlineMarkdown(line)}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

// ─── User message bubble ────────────────────────────────────

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-1.5">
      <div className="bg-persian-orange/8 border border-persian-orange/15 rounded-lg rounded-br-sm px-3 py-1.5 max-w-[85%]">
        <p className="text-[13px] text-onyx leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

// ─── Assistant message ──────────────────────────────────────

function AssistantMessage({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming?: boolean;
}) {
  return (
    <div className="mb-1.5">
      <div className="pl-0.5">
        <RichResponse text={content} />
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-persian-orange/60 animate-pulse ml-0.5 rounded-sm" />
        )}
      </div>
    </div>
  );
}

// ─── Collapsed earlier messages ─────────────────────────────

function CollapsedMessages({
  messages,
  count,
}: {
  messages: ChatMessage[];
  count: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (count <= 0) return null;

  const collapsed = messages.slice(0, count * 2); // pairs of user+assistant

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <MessageSquare className="w-3 h-3" />
        {count} earlier {count === 1 ? "exchange" : "exchanges"}
      </button>
      {expanded && (
        <div className="border-l-2 border-border/30 pl-3 ml-1.5 mt-1 space-y-1 opacity-70">
          {collapsed.map((msg, i) =>
            msg.role === "user" ? (
              <UserBubble key={`collapsed-${i}`} content={msg.content} />
            ) : (
              <AssistantMessage
                key={`collapsed-${i}`}
                content={msg.content}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main AI Chat Block ─────────────────────────────────────

interface AIQueryBlockProps {
  block: Block;
  phase: string;
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

export function AIQueryBlock({
  block,
  phase,
  onChange,
  onDelete,
}: AIQueryBlockProps) {
  const config = PHASE_CONFIG[phase] || DEFAULT_CONFIG;

  // Restore messages from block.meta on mount
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => (block.meta?.messages as ChatMessage[]) || []
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [toolStatus, setToolStatus] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // How many exchanges (user+assistant pairs) to collapse
  const totalExchanges = Math.floor(messages.length / 2);
  const VISIBLE_EXCHANGES = 1; // always show the last exchange fully
  const collapsedCount = Math.max(0, totalExchanges - VISIBLE_EXCHANGES);
  const visibleMessages =
    collapsedCount > 0 ? messages.slice(collapsedCount * 2) : messages;

  // Auto-focus input
  useEffect(() => {
    if (!streaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [streaming, messages.length]);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingText, messages.length, toolStatus]);

  // Persist messages to block.meta
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      onChange({ meta: { ...block.meta, messages: msgs } });
    },
    [block.meta, onChange]
  );

  const handleSend = useCallback(async () => {
    const q = input.trim();
    if (!q || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: q };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);
    setStreamingText("");
    setToolStatus(null);

    try {
      const context = buildNotepadContext();
      const res = await fetch("/api/ai-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, phase, context }),
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ error: "Request failed" }));
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: `**Error:** ${errData.error || res.statusText}`,
        };
        const final = [...updatedMessages, errorMsg];
        setMessages(final);
        persistMessages(final);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accum = "";
      let textAccum = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accum += decoder.decode(value, { stream: true });
        const lines = accum.split("\n");
        accum = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              textAccum += event.content;
              setStreamingText(textAccum);
            } else if (event.type === "tool_call") {
              setToolStatus(event.message || "Fetching data...");
            } else if (event.type === "tool_result") {
              setToolStatus(null);
            } else if (event.type === "error") {
              textAccum += `\n\n**Error:** ${event.message}`;
              setStreamingText(textAccum);
            } else if (event.type === "done") {
              // Finalize: add assistant message to history
              if (textAccum) {
                const assistantMsg: ChatMessage = {
                  role: "assistant",
                  content: textAccum,
                };
                const final = [...updatedMessages, assistantMsg];
                setMessages(final);
                persistMessages(final);
              }
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `**Error:** ${msg}`,
      };
      const final = [...updatedMessages, errorMsg];
      setMessages(final);
      persistMessages(final);
    } finally {
      setStreaming(false);
      setStreamingText("");
      setToolStatus(null);
    }
  }, [input, streaming, messages, phase, persistMessages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Delete block if empty and no messages
    if (
      e.key === "Backspace" &&
      input === "" &&
      messages.length === 0 &&
      !streaming
    ) {
      e.preventDefault();
      onDelete();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setStreamingText("");
    onChange({ meta: { ...block.meta, messages: [] } });
  };

  const hasMessages = messages.length > 0 || streaming;
  const messageCount = Math.ceil(messages.length / 2);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  return (
    <div
      className={`my-2 rounded-lg border-l-[3px] ${config.accent} bg-gradient-to-r from-snow/80 to-white border border-border/40 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-snow/50 border-b border-border/30">
        {/* Collapse toggle (only when there are messages) */}
        {hasMessages && (
          <button
            onClick={() => setChatCollapsed((p) => !p)}
            className="p-0.5 -ml-0.5 hover:bg-muted/40 rounded transition-colors"
            title={chatCollapsed ? "Expand conversation" : "Collapse conversation"}
          >
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground/50 transition-transform duration-150 ${
                chatCollapsed ? "-rotate-90" : ""
              }`}
            />
          </button>
        )}
        <Sparkles className="w-3 h-3 text-persian-orange" />
        <span className="text-[11px] font-medium text-muted-foreground">
          {config.label}
        </span>
        <span className="text-[10px] text-muted-foreground/50 capitalize">
          · {phase}
        </span>
        {messageCount > 0 && (
          <span className="text-[10px] text-muted-foreground/40 ml-0.5">
            · {messageCount} {messageCount === 1 ? "exchange" : "exchanges"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {hasMessages && !streaming && (
            <button
              onClick={handleClear}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex items-center text-[10px] text-muted-foreground/40 hover:text-red-500 transition-colors ml-0.5"
            title="Remove AI block"
          >
            ×
          </button>
        </div>
      </div>

      {/* Chat area — collapsible */}
      {!chatCollapsed && (
        <div
          ref={scrollRef}
          className={`px-3 overflow-y-auto ${hasMessages ? "pt-2 max-h-[420px]" : ""}`}
        >
          {/* Collapsed earlier exchanges */}
          {collapsedCount > 0 && (
            <CollapsedMessages
              messages={messages}
              count={collapsedCount}
            />
          )}

          {/* Visible messages */}
          {visibleMessages.map((msg, i) =>
            msg.role === "user" ? (
              <UserBubble key={`msg-${i}`} content={msg.content} />
            ) : (
              <AssistantMessage key={`msg-${i}`} content={msg.content} />
            )
          )}

          {/* Streaming response (not yet finalized) */}
          {streaming && (
            <>
              {/* Tool status */}
              {toolStatus && (
                <div className="flex items-center gap-1.5 py-1">
                  <Loader2 className="w-3 h-3 text-persian-orange animate-spin" />
                  <span className="text-[11px] text-persian-orange font-medium">
                    {toolStatus}
                  </span>
                </div>
              )}

              {/* Thinking indicator (before any text) */}
              {!streamingText && !toolStatus && (
                <div className="flex items-center gap-1.5 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-persian-orange/60 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-persian-orange/60 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-persian-orange/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-[11px] text-persian-orange/70">
                    Thinking...
                  </span>
                </div>
              )}

              {/* Streaming text */}
              {streamingText && (
                <AssistantMessage content={streamingText} isStreaming />
              )}
            </>
          )}
        </div>
      )}

      {/* Footer: disclaimer + input */}
      <div className="border-t border-border/20">
        {/* Input bar — always visible */}
        <div className="flex items-center gap-2 px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder={
              hasMessages ? config.followUp : config.placeholder
            }
            className="flex-1 text-[13px] bg-transparent outline-none text-onyx placeholder:text-muted-foreground/40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-6 h-6 rounded-md bg-persian-orange hover:bg-spanish-orange text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>

        {/* Subtle disclaimer */}
        {hasMessages && !streaming && (
          <div className="flex items-center gap-1 px-3 pb-1.5 -mt-1">
            <Sparkles className="w-2.5 h-2.5 text-persian-orange/30" />
            <span className="text-[10px] text-muted-foreground/30">
              AI generated · may contain inaccuracies
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
