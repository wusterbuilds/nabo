// Block types for the Notion-style editor

export type BlockType =
  | "text"
  | "heading"
  | "checklist"
  | "bullet"
  | "divider"
  | "ai-text"       // Ghost AI-generated text with faint indicator
  | "ai-query"      // Interactive AI block: accepts questions, streams Claude responses
  | "import"        // Integration import widget (Zoom, Slack, Email)
  | "action-items"  // Interactive action items checklist widget
  | "discussion"    // Discussion thread widget
  | "campaign-config" // Campaign configuration card widget
  | "metrics"       // Performance metrics dashboard widget
  | "deploy"        // Deploy button widget
  | "report"        // Client report widget
  | "empty"         // Empty placeholder block (click to type)
  ;

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;        // For checklist items
  level?: number;           // For heading level (1, 2, 3)
  meta?: Record<string, unknown>; // Extra data for widgets
}

export interface PhaseSection {
  id: string;
  phase: "strategize" | "plan" | "live" | "monitor";
  label: string;
  color: string;
  expanded: boolean;
  blocks: Block[];
}

let _blockCounter = 0;
export function createBlockId(): string {
  _blockCounter++;
  return `block-${Date.now()}-${_blockCounter}`;
}

export function createBlock(type: BlockType, content: string = "", meta?: Record<string, unknown>): Block {
  return {
    id: createBlockId(),
    type,
    content,
    meta,
  };
}
