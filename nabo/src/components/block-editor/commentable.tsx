"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { MessageSquare, Send, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: number;
}

// ─── Comment Store (lightweight, local-only) ─────────────────
// Uses a simple Map keyed by a stable id (block id or widget id)

const commentStore = new Map<string, Comment[]>();
const listeners = new Set<() => void>();

function getComments(id: string): Comment[] {
  return commentStore.get(id) || [];
}

function addComment(id: string, text: string) {
  const existing = commentStore.get(id) || [];
  const comment: Comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: "You",
    avatar: "Y",
    text,
    timestamp: Date.now(),
  };
  commentStore.set(id, [...existing, comment]);
  listeners.forEach((fn) => fn());
}

function useComments(id: string): Comment[] {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return getComments(id);
}

// ─── Relative time ──────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

// ─── Comment Thread Popover ─────────────────────────────────

function CommentThread({
  commentId,
  onClose,
}: {
  commentId: string;
  onClose: () => void;
}) {
  const comments = useComments(commentId);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input on open
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new comments
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    addComment(commentId, text);
    setInput("");
  }, [input, commentId]);

  return (
    <div
      className="w-72 bg-white rounded-lg border border-border shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-[12px] font-medium text-onyx">
          {comments.length > 0
            ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}`
            : "Add a comment"}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-onyx transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-48 overflow-y-auto px-3 py-2 space-y-2.5"
        >
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-spanish-orange/15 flex items-center justify-center text-[10px] font-medium text-spanish-orange shrink-0 mt-0.5">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-semibold text-onyx">
                    {c.author}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {relativeTime(c.timestamp)}
                  </span>
                </div>
                <p className="text-[12px] text-onyx/80 leading-relaxed mt-0.5">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border/30">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
            if (e.key === "Escape") {
              onClose();
            }
          }}
          placeholder="Write a comment..."
          className="flex-1 text-[12px] bg-transparent outline-none text-onyx placeholder:text-muted-foreground/40"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="text-spanish-orange hover:text-persian-orange disabled:text-muted-foreground/30 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Commentable Wrapper ────────────────────────────────────

interface CommentableProps {
  /** Stable unique ID for this commentable region */
  id: string;
  children: ReactNode;
  /** Extra class on the outer wrapper */
  className?: string;
}

export function Commentable({ id, children, className = "" }: CommentableProps) {
  const comments = useComments(id);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasComments = comments.length > 0;

  return (
    <div ref={wrapperRef} className={`group/comment relative ${className}`}>
      {children}

      {/* Comment trigger — appears on hover (right margin) */}
      <div
        className={`absolute -right-8 top-0.5 flex items-center gap-0.5 transition-opacity ${
          open
            ? "opacity-100"
            : hasComments
              ? "opacity-60 group-hover/comment:opacity-100"
              : "opacity-0 group-hover/comment:opacity-50"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="relative p-0.5 rounded hover:bg-spanish-orange/10 transition-colors"
          title={hasComments ? `${comments.length} comment(s)` : "Add comment"}
        >
          <MessageSquare className="w-3.5 h-3.5 text-spanish-orange" />
          {hasComments && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-spanish-orange text-white text-[8px] font-bold flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </button>
      </div>

      {/* Thread popover — anchored to the right of the comment icon */}
      {open && (
        <div className="absolute -right-8 top-0 z-50" style={{ transform: "translateX(100%)" }}>
          <div className="ml-2">
            <CommentThread commentId={id} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
