"use client";

import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react";
import { Block, BlockType } from "./types";
import { SlashMenu } from "./slash-menu";
import { AIQueryBlock } from "./ai-query-block";
import { Commentable } from "./commentable";
import { Check, Sparkles } from "lucide-react";

interface BlockRendererProps {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  onTypeChange: (newType: BlockType) => void;
  autoFocus?: boolean;
  phase?: string;
}

export function BlockRenderer({
  block,
  onChange,
  onEnter,
  onDelete,
  onTypeChange,
  autoFocus,
  phase = "strategize",
}: BlockRendererProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const editRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Track block id so we only set DOM content on mount or block change
  const initializedRef = useRef<string | null>(null);

  // Set DOM content only on first mount or when block id/type changes
  // Never re-set it on content changes — the DOM owns the text
  useEffect(() => {
    if (editRef.current && initializedRef.current !== block.id + block.type) {
      editRef.current.textContent = block.content;
      initializedRef.current = block.id + block.type;
    }
  }, [block.id, block.type, block.content]);

  useEffect(() => {
    if (autoFocus && editRef.current) {
      editRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      if (editRef.current.childNodes.length > 0) {
        range.selectNodeContents(editRef.current);
        range.collapse(false);
      }
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (showSlash) return; // Let slash menu handle keys

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }

    if (e.key === "Backspace") {
      const text = (editRef.current?.textContent || "").trim();
      if (text === "") {
        e.preventDefault();
        onDelete();
      }
    }
  };

  const handleInput = () => {
    if (!editRef.current) return;
    const text = editRef.current.textContent || "";
    onChange({ content: text });

    // Detect slash command
    if (text === "/") {
      setShowSlash(true);
      setSlashFilter("");
    } else if (text.startsWith("/") && showSlash) {
      setSlashFilter(text.slice(1));
    } else if (showSlash && !text.startsWith("/")) {
      setShowSlash(false);
    }
  };

  const handleSlashSelect = useCallback(
    (type: string) => {
      setShowSlash(false);
      if (editRef.current) {
        editRef.current.textContent = "";
      }
      onChange({ content: "" });
      onTypeChange(type as BlockType);
    },
    [onChange, onTypeChange]
  );

  // Divider block
  if (block.type === "divider") {
    return (
      <Commentable id={block.id}>
        <div className="py-3 group relative">
          <hr className="border-border" />
        </div>
      </Commentable>
    );
  }

  // Checklist block
  if (block.type === "checklist") {
    return (
      <Commentable id={block.id}>
        <div className="flex items-start gap-2 group py-0.5 relative">
          <button
            onClick={() => onChange({ checked: !block.checked })}
            className="mt-0.5 shrink-0"
          >
            {block.checked ? (
              <div className="w-4 h-4 rounded bg-spanish-orange flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded border-2 border-border hover:border-persian-orange transition-colors" />
            )}
          </button>
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            className={`flex-1 outline-none text-[15px] leading-relaxed ${
              block.checked ? "line-through text-muted-foreground" : "text-onyx"
            }`}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-placeholder="To-do"
          />
          {showSlash && (
            <SlashMenu
              anchorRef={editRef}
              onSelect={handleSlashSelect}
              onClose={() => setShowSlash(false)}
              filter={slashFilter}
            />
          )}
        </div>
      </Commentable>
    );
  }

  // Bullet block
  if (block.type === "bullet") {
    return (
      <Commentable id={block.id}>
        <div className="flex items-start gap-2 group py-0.5 relative">
          <span className="text-persian-orange mt-1.5 text-xs shrink-0">●</span>
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 outline-none text-[15px] leading-relaxed text-onyx"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-placeholder="List item"
          />
          {showSlash && (
            <SlashMenu
              anchorRef={editRef}
              onSelect={handleSlashSelect}
              onClose={() => setShowSlash(false)}
              filter={slashFilter}
            />
          )}
        </div>
      </Commentable>
    );
  }

  // Heading block
  if (block.type === "heading") {
    return (
      <Commentable id={block.id}>
        <div className="group relative py-1">
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none text-lg font-semibold text-onyx leading-snug"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-placeholder="Heading"
          />
          {showSlash && (
            <SlashMenu
              anchorRef={editRef}
              onSelect={handleSlashSelect}
              onClose={() => setShowSlash(false)}
              filter={slashFilter}
            />
          )}
        </div>
      </Commentable>
    );
  }

  // AI query block — interactive Claude-powered block
  if (block.type === "ai-query") {
    return (
      <AIQueryBlock
        block={block}
        phase={phase}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  // AI ghost text — looks like regular text with tiny indicator
  if (block.type === "ai-text") {
    return (
      <Commentable id={block.id}>
        <div className="group relative py-0.5">
          <div className="flex items-start gap-1.5">
            <div
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              className="flex-1 outline-none text-[15px] leading-relaxed text-onyx"
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              data-placeholder="AI-generated text"
            />
          </div>
          {/* Ghost AI indicator — only visible on hover */}
          <div className="absolute -left-6 top-1 opacity-0 group-hover:opacity-40 transition-opacity">
            <Sparkles className="w-3 h-3 text-persian-orange" />
          </div>
          {showSlash && (
            <SlashMenu
              anchorRef={editRef}
              onSelect={handleSlashSelect}
              onClose={() => setShowSlash(false)}
              filter={slashFilter}
            />
          )}
        </div>
      </Commentable>
    );
  }

  // Default: text block
  return (
    <Commentable id={block.id}>
      <div className="group relative py-0.5">
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className={`outline-none text-[15px] leading-relaxed text-onyx min-h-[1.5em] ${
            !block.content && !isFocused ? "text-muted-foreground/40" : ""
          }`}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder="Type '/' for commands..."
        />
        {!block.content && !isFocused && (
          <div className="absolute inset-0 pointer-events-none text-[15px] leading-relaxed text-muted-foreground/40">
            Type &apos;/&apos; for commands...
          </div>
        )}
        {showSlash && (
          <SlashMenu
            anchorRef={editRef}
            onSelect={handleSlashSelect}
            onClose={() => setShowSlash(false)}
            filter={slashFilter}
          />
        )}
      </div>
    </Commentable>
  );
}
