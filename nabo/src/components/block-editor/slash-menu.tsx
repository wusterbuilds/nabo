"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Type,
  Heading1,
  CheckSquare,
  List,
  Minus,
  Sparkles,
} from "lucide-react";

export interface SlashMenuItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  type: string;
}

const menuItems: SlashMenuItem[] = [
  {
    label: "Text",
    description: "Plain text block",
    icon: <Type className="w-4 h-4" />,
    type: "text",
  },
  {
    label: "Heading",
    description: "Section heading",
    icon: <Heading1 className="w-4 h-4" />,
    type: "heading",
  },
  {
    label: "Checklist",
    description: "To-do item with checkbox",
    icon: <CheckSquare className="w-4 h-4" />,
    type: "checklist",
  },
  {
    label: "Bullet List",
    description: "Bulleted list item",
    icon: <List className="w-4 h-4" />,
    type: "bullet",
  },
  {
    label: "Divider",
    description: "Horizontal divider",
    icon: <Minus className="w-4 h-4" />,
    type: "divider",
  },
  {
    label: "Ask AI",
    description: "Ask a question — pulls real data",
    icon: <Sparkles className="w-4 h-4 text-spanish-orange" />,
    type: "ai-query",
  },
];

interface SlashMenuProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (type: string) => void;
  onClose: () => void;
  filter?: string;
}

export function SlashMenu({ anchorRef, onSelect, onClose, filter = "" }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const filtered = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.label.toLowerCase().includes(filter.toLowerCase()) ||
          item.type.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter]
  );

  // Recalculate position from anchor element — keeps menu attached on scroll
  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !menuRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight || 220;
    const menuWidth = 224; // w-56 = 14rem = 224px
    const pad = 8;

    let top = rect.bottom + 4;
    let left = rect.left;

    // Clamp bottom: if menu overflows viewport, show above the block
    if (top + menuHeight + pad > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    // Clamp top: never above viewport
    if (top < pad) top = pad;

    // Clamp right: never overflow right edge
    if (left + menuWidth + pad > window.innerWidth) {
      left = window.innerWidth - menuWidth - pad;
    }
    // Clamp left
    if (left < pad) left = pad;

    setPos({ top, left });
  }, [anchorRef]);

  // Position on mount + update on scroll / resize
  useEffect(() => {
    // Use rAF to avoid synchronous setState in effect body
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("scroll", updatePosition, true); // capture phase for nested scrolls
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  // Clamp selectedIndex to filtered length
  const clampedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

  const handleSelect = useCallback(
    (type: string) => {
      onSelect(type);
    },
    [onSelect]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[clampedIndex]) {
          handleSelect(filtered[clampedIndex].type);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clampedIndex, filtered, handleSelect, onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-border rounded-lg shadow-lg py-1 w-56 animate-fade-in-up"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        Insert block
      </div>
      {filtered.map((item, i) => (
        <button
          key={item.type}
          onClick={() => handleSelect(item.type)}
          className={`w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors ${
            i === clampedIndex
              ? "bg-persian-orange/5 text-onyx"
              : "text-onyx hover:bg-muted/50"
          }`}
        >
          <span className="text-muted-foreground">{item.icon}</span>
          <div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
