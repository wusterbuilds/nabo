"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface CollapsibleSectionProps {
  /** Unique section title displayed in the header */
  title: string;
  /** Lucide icon component shown before the title */
  icon?: LucideIcon;
  /** Tailwind color class for the icon (e.g. "text-blue-600") */
  iconColor?: string;
  /** Optional badge/count element shown after the title */
  badge?: ReactNode;
  /** Extra elements rendered at the right end of the header bar */
  headerRight?: ReactNode;
  /** Whether the section starts expanded (default: true) */
  defaultOpen?: boolean;
  /** Section body */
  children: ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  iconColor = "text-muted-foreground",
  badge,
  headerRight,
  defaultOpen = true,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      {/* Clickable header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-1.5 py-1.5 text-left group/collapse"
      >
        <ChevronRight
          className={`w-3 h-3 text-muted-foreground/50 transition-transform duration-150 ${
            open ? "rotate-90" : ""
          }`}
        />
        {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
        <span className="text-[12px] font-semibold text-onyx group-hover/collapse:text-spanish-orange transition-colors">
          {title}
        </span>
        {badge && <span className="ml-0.5">{badge}</span>}
        {headerRight && <div className="ml-auto">{headerRight}</div>}
      </button>

      {/* Collapsible body */}
      {open && <div>{children}</div>}
    </div>
  );
}
