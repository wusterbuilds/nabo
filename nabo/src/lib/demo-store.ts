import { create } from "zustand";
import { ActionItem, CampaignConfigData, CampaignSpec, AdSetSpec, AdSpec, defaultCampaignConfig } from "./data";

// ============================================================
// Demo State Machine
// Manages the interactive walkthrough state for the demo note
// ============================================================

export type PhaseId = "strategize" | "plan" | "live" | "monitor";

export interface DemoNote {
  id: string;
  title: string;
  sourceTag: string;
  createdAt: string;
}

// Agent log entry for live deployment
export interface AgentLogEntry {
  type: "status" | "creating" | "campaign_created" | "adset_created" | "ad_created" | "image_uploaded" | "creative_created" | "complete" | "error";
  message: string;
  campaignId?: string | null;
  campaignName?: string;
  progress?: number;
  timestamp: number;
}

// Created campaign reference (with child IDs)
export interface CreatedCampaign {
  name: string;
  id: string | null;
  objective: string;
  adSets?: { name: string; id: string | null; ads?: { name: string; id: string | null }[] }[];
}

interface DemoState {
  // Whether a demo note has been created
  demoNoteCreated: boolean;
  demoNote: DemoNote | null;

  // Phase unlock status
  unlockedPhases: PhaseId[];
  currentPhase: PhaseId;

  // Strategize phase
  transcriptImported: boolean;
  transcriptStreaming: boolean;
  strategyBriefGenerated: boolean;
  strategyBriefStreaming: boolean;
  strategyBriefAccepted: boolean;
  strategizeApproved: boolean;

  // Plan Action phase
  actionPlanGenerated: boolean;
  actionPlanStreaming: boolean;
  actionPlanAccepted: boolean;
  actionItems: ActionItem[];
  discussionVisible: boolean;
  gapAnalysisGenerated: boolean;
  gapAnalysisStreaming: boolean;
  planApproved: boolean;

  // Campaign configuration (structured, drives deployment)
  campaignConfig: CampaignConfigData;

  // Go Live phase
  campaignConfigGenerated: boolean;
  campaignConfigStreaming: boolean;
  validationGenerated: boolean;
  validationStreaming: boolean;
  deployed: boolean;
  deploying: boolean;
  deployProgress: number;
  executionStatuses: Record<string, "not-started" | "in-progress" | "done" | "live">;

  // Live mode (real Meta Ads deployment)
  liveMode: boolean;
  agentLog: AgentLogEntry[];
  createdCampaigns: CreatedCampaign[];
  adsManagerUrl: string | null;
  deployError: string | null;

  // Monitor phase
  dashboardLoaded: boolean;
  insightsGenerated: boolean;
  insightsStreaming: boolean;
  reportGenerated: boolean;
  reportStreaming: boolean;
  slackSent: boolean;

  // Cmd+K
  cmdKOpen: boolean;
  cmdKQuery: string;
  cmdKAnswer: string | null;

  // Actions
  createDemoNote: (title: string, sourceTag: string) => void;
  importTranscript: () => void;
  generateStrategyBrief: () => void;
  acceptStrategyBrief: () => void;
  approveStrategize: () => void;
  generateActionPlan: () => void;
  acceptActionPlan: () => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  addActionItem: (assignee?: string) => void;
  deleteActionItem: (id: string) => void;
  generateGapAnalysis: () => void;
  approvePlan: () => void;
  updateCampaignConfig: (config: CampaignConfigData) => void;
  updateCampaign: (campaignId: string, updates: Partial<CampaignSpec>) => void;
  updateAdSet: (campaignId: string, adSetId: string, updates: Partial<AdSetSpec>) => void;
  updateAd: (campaignId: string, adSetId: string, adId: string, updates: Partial<AdSpec>) => void;
  generateCampaignConfig: () => void;
  generateValidation: () => void;
  deployAll: () => void;
  deployLive: () => void;
  stopDeploy: () => void;
  revertDeploy: () => void;
  toggleLiveMode: () => void;
  generateInsights: () => void;
  generateReport: () => void;
  sendViaSlack: () => void;
  openCmdK: () => void;
  closeCmdK: () => void;
  setCmdKQuery: (q: string) => void;
  submitCmdK: () => void;
  resetDemo: () => void;
}

// Refs for cancellation (outside Zustand — not serializable)
let _deployAbort: AbortController | null = null;
let _deployInterval: ReturnType<typeof setInterval> | null = null;

export const useDemoStore = create<DemoState>((set, get) => ({
  demoNoteCreated: false,
  demoNote: null,
  unlockedPhases: ["strategize"],
  currentPhase: "strategize",

  transcriptImported: false,
  transcriptStreaming: false,
  strategyBriefGenerated: false,
  strategyBriefStreaming: false,
  strategyBriefAccepted: false,
  strategizeApproved: false,

  actionPlanGenerated: false,
  actionPlanStreaming: false,
  actionPlanAccepted: false,
  actionItems: [],
  discussionVisible: false,
  gapAnalysisGenerated: false,
  gapAnalysisStreaming: false,
  planApproved: false,

  campaignConfig: structuredClone(defaultCampaignConfig),

  campaignConfigGenerated: false,
  campaignConfigStreaming: false,
  validationGenerated: false,
  validationStreaming: false,
  deployed: false,
  deploying: false,
  deployProgress: 0,
  executionStatuses: {
    "ap-1": "not-started",
    "ap-2": "not-started",
    "ap-3": "not-started",
    "ap-4": "not-started",
    "ap-5": "not-started",
    "ap-6": "not-started",
  },

  // Live mode state
  liveMode: false,
  agentLog: [],
  createdCampaigns: [],
  adsManagerUrl: null,
  deployError: null,

  dashboardLoaded: false,
  insightsGenerated: false,
  insightsStreaming: false,
  reportGenerated: false,
  reportStreaming: false,
  slackSent: false,

  cmdKOpen: false,
  cmdKQuery: "",
  cmdKAnswer: null,

  createDemoNote: (title, sourceTag) => {
    set({
      demoNoteCreated: true,
      demoNote: {
        id: "demo-note-1",
        title,
        sourceTag,
        createdAt: "Feb 9, 2026",
      },
      unlockedPhases: ["strategize"],
      currentPhase: "strategize",
    });
  },

  importTranscript: () => {
    set({ transcriptStreaming: true });
    setTimeout(() => {
      set({ transcriptStreaming: false, transcriptImported: true });
    }, 2000);
  },

  generateStrategyBrief: () => {
    set({ strategyBriefStreaming: true });
    setTimeout(() => {
      set({ strategyBriefStreaming: false, strategyBriefGenerated: true });
    }, 2500);
  },

  acceptStrategyBrief: () => {
    set({ strategyBriefAccepted: true });
  },

  approveStrategize: () => {
    set({
      strategizeApproved: true,
      unlockedPhases: ["strategize", "plan"],
      currentPhase: "plan",
    });
  },

  generateActionPlan: () => {
    set({ actionPlanStreaming: true });
    setTimeout(() => {
      set({
        actionPlanStreaming: false,
        actionPlanGenerated: true,
        actionItems: [
          // Human tasks
          { id: "ap-1", title: "Receive customer list CSV from client", assignee: "Sarah", dueDate: "Feb 7", status: "pending" as const, actionType: "upload" as const, actionLabel: "Upload CSV" },
          { id: "ap-6", title: "Confirm with client that exclusion is live", assignee: "Sarah", dueDate: "Feb 11", status: "pending" as const },
          // AI tasks
          { id: "ap-2", title: "Validate CSV format (confirm email + phone columns match Meta requirements)", assignee: "AI", dueDate: "Feb 7", status: "pending" as const, actionType: "run" as const },
          { id: "ap-3", title: "Create Custom Audience exclusion list in Meta Business Manager", assignee: "AI", dueDate: "Feb 10", status: "pending" as const, actionType: "run" as const, subItems: ['List name: "Summit Home Services — Past Customers Exclusion"', "Type: Static customer list (CSV upload)"] },
          { id: "ap-4", title: "Apply exclusion list to all active campaigns", assignee: "AI", dueDate: "Feb 10", status: "pending" as const, actionType: "run" as const, subItems: ["Summit — Search Lead Gen", "Summit — Retargeting Warm Leads", "Summit — Lookalike Expansion", "Summit — Local Awareness"] },
          { id: "ap-5", title: "Verify exclusion is active and audience sizes updated", assignee: "AI", dueDate: "Feb 11", status: "pending" as const, actionType: "run" as const },
        ],
      });
    }, 2500);
  },

  acceptActionPlan: () => {
    set({ actionPlanAccepted: true, discussionVisible: true });
  },

  updateActionItem: (id, updates) => {
    const items = get().actionItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ actionItems: items });
  },

  addActionItem: (assignee = "Sarah") => {
    const newItem: ActionItem = {
      id: `ap-new-${Date.now()}`,
      title: "",
      assignee,
      dueDate: "",
      status: "pending",
    };
    set({ actionItems: [...get().actionItems, newItem] });
  },

  deleteActionItem: (id) => {
    set({ actionItems: get().actionItems.filter((item) => item.id !== id) });
  },

  generateGapAnalysis: () => {
    set({ gapAnalysisStreaming: true });
    setTimeout(() => {
      set({ gapAnalysisStreaming: false, gapAnalysisGenerated: true });
    }, 2000);
  },

  approvePlan: () => {
    set({
      planApproved: true,
      unlockedPhases: ["strategize", "plan", "live"],
      currentPhase: "live",
      executionStatuses: {
        "ap-1": "done",
        "ap-2": "done",
        "ap-3": "not-started",
        "ap-4": "not-started",
        "ap-5": "not-started",
        "ap-6": "not-started",
      },
    });
  },

  // ── Campaign config update actions ─────────────────────
  updateCampaignConfig: (config) => set({ campaignConfig: config }),

  updateCampaign: (campaignId, updates) => {
    set((s) => ({
      campaignConfig: {
        ...s.campaignConfig,
        campaigns: s.campaignConfig.campaigns.map((c) =>
          c.id === campaignId ? { ...c, ...updates } : c
        ),
      },
    }));
  },

  updateAdSet: (campaignId, adSetId, updates) => {
    set((s) => ({
      campaignConfig: {
        ...s.campaignConfig,
        campaigns: s.campaignConfig.campaigns.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                adSets: c.adSets.map((as) =>
                  as.id === adSetId ? { ...as, ...updates } : as
                ),
              }
            : c
        ),
      },
    }));
  },

  updateAd: (campaignId, adSetId, adId, updates) => {
    set((s) => ({
      campaignConfig: {
        ...s.campaignConfig,
        campaigns: s.campaignConfig.campaigns.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                adSets: c.adSets.map((as) =>
                  as.id === adSetId
                    ? {
                        ...as,
                        ads: as.ads.map((a) =>
                          a.id === adId ? { ...a, ...updates } : a
                        ),
                      }
                    : as
                ),
              }
            : c
        ),
      },
    }));
  },

  generateCampaignConfig: () => {
    set({ campaignConfigStreaming: true });
    setTimeout(() => {
      set({ campaignConfigStreaming: false, campaignConfigGenerated: true });
    }, 2000);
  },

  generateValidation: () => {
    set({ validationStreaming: true });
    setTimeout(() => {
      set({ validationStreaming: false, validationGenerated: true });
    }, 2000);
  },

  deployAll: () => {
    const { liveMode } = get();
    if (liveMode) {
      // Use live deployment via Meta Ads MCP
      get().deployLive();
      return;
    }

    // Mock deployment (original demo flow)
    set({ deploying: true, deployProgress: 0 });
    _deployInterval = setInterval(() => {
      const current = get().deployProgress;
      if (current >= 100) {
        if (_deployInterval) clearInterval(_deployInterval);
        _deployInterval = null;
        set({
          deploying: false,
          deployed: true,
          deployProgress: 100,
          executionStatuses: {
            "ap-1": "done",
            "ap-2": "done",
            "ap-3": "done",
            "ap-4": "live",
            "ap-5": "done",
            "ap-6": "done",
          },
          unlockedPhases: ["strategize", "plan", "live", "monitor"],
          currentPhase: "monitor",
        });
      } else {
        set({ deployProgress: Math.min(current + 20, 100) });
      }
    }, 500);
  },

  deployLive: async () => {
    _deployAbort = new AbortController();
    set({
      deploying: true,
      deployProgress: 0,
      agentLog: [],
      createdCampaigns: [],
      adsManagerUrl: null,
      deployError: null,
    });

    try {
      const config = get().campaignConfig;
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
        signal: _deployAbort.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            const logEntry: AgentLogEntry = {
              type: event.type,
              message: event.message || "",
              timestamp: Date.now(),
            };

            if (event.type === "status" || event.type === "creating") {
              set((s) => ({ agentLog: [...s.agentLog, logEntry] }));
            } else if (event.type === "campaign_created") {
              logEntry.campaignId = event.id;
              logEntry.campaignName = event.name;
              logEntry.message = `Campaign: ${event.name}${event.id ? ` (${event.id})` : ""}`;
              set((s) => ({
                agentLog: [...s.agentLog, logEntry],
                deployProgress: event.progress || s.deployProgress,
                createdCampaigns: [
                  ...s.createdCampaigns,
                  { name: event.name, id: event.id, objective: event.objective, adSets: [] },
                ],
              }));
            } else if (event.type === "adset_created") {
              logEntry.message = `Ad Set: ${event.name}${event.id ? ` (${event.id})` : ""}`;
              set((s) => {
                // Attach ad set to last campaign
                const campaigns = [...s.createdCampaigns];
                const lastCamp = campaigns[campaigns.length - 1];
                if (lastCamp) {
                  lastCamp.adSets = [...(lastCamp.adSets || []), { name: event.name, id: event.id, ads: [] }];
                }
                return {
                  agentLog: [...s.agentLog, logEntry],
                  deployProgress: event.progress || s.deployProgress,
                  createdCampaigns: campaigns,
                };
              });
            } else if (event.type === "ad_created") {
              logEntry.message = `Ad: ${event.name}${event.id ? ` (${event.id})` : ""}`;
              set((s) => {
                // Attach ad to last ad set of last campaign
                const campaigns = [...s.createdCampaigns];
                const lastCamp = campaigns[campaigns.length - 1];
                const lastAdSet = lastCamp?.adSets?.[(lastCamp.adSets?.length || 0) - 1];
                if (lastAdSet) {
                  lastAdSet.ads = [...(lastAdSet.ads || []), { name: event.name, id: event.id }];
                }
                return {
                  agentLog: [...s.agentLog, logEntry],
                  deployProgress: event.progress || s.deployProgress,
                  createdCampaigns: campaigns,
                };
              });
            } else if (event.type === "image_uploaded" || event.type === "creative_created") {
              set((s) => ({
                agentLog: [...s.agentLog, logEntry],
                deployProgress: event.progress || s.deployProgress,
              }));
            } else if (event.type === "complete") {
              // Use full campaign tree from server if available
              const serverCampaigns = event.campaigns || get().createdCampaigns;
              set({
                deploying: false,
                deployed: true,
                deployProgress: 100,
                adsManagerUrl: event.adsManagerUrl || null,
                createdCampaigns: serverCampaigns,
                agentLog: [
                  ...get().agentLog,
                  { type: "complete" as const, message: event.message, timestamp: Date.now() },
                ],
                executionStatuses: {
                  "ap-1": "done",
                  "ap-2": "done",
                  "ap-3": "done",
                  "ap-4": "live",
                  "ap-5": "done",
                  "ap-6": "done",
                },
                unlockedPhases: ["strategize", "plan", "live", "monitor"],
                currentPhase: "monitor",
              });
            } else if (event.type === "error") {
              // Non-fatal errors (e.g. a single ad failed) — just log them, don't stop
              set((s) => ({
                agentLog: [
                  ...s.agentLog,
                  { type: "error" as const, message: event.message, timestamp: Date.now() },
                ],
              }));
            }
          } catch {
            // Skip malformed SSE events
          }
        }
      }
    } catch (error) {
      // If the user hit Stop, the AbortController fires an AbortError — don't treat it as a failure
      if (error instanceof DOMException && error.name === "AbortError") {
        // Already handled by stopDeploy — nothing more to do
        return;
      }
      const msg = error instanceof Error ? error.message : "Unknown error";
      set({
        deploying: false,
        deployError: msg,
        agentLog: [
          ...get().agentLog,
          { type: "error", message: `Connection failed: ${msg}`, timestamp: Date.now() },
        ],
      });
    } finally {
      _deployAbort = null;
    }
  },

  stopDeploy: () => {
    // Cancel live fetch
    if (_deployAbort) {
      _deployAbort.abort();
      _deployAbort = null;
    }
    // Cancel mock interval
    if (_deployInterval) {
      clearInterval(_deployInterval);
      _deployInterval = null;
    }
    set((s) => ({
      deploying: false,
      agentLog: [
        ...s.agentLog,
        { type: "error" as const, message: "Deployment stopped by user", timestamp: Date.now() },
      ],
    }));
  },

  revertDeploy: async () => {
    set((s) => ({
      deploying: true,
      deployProgress: 0,
      agentLog: [
        ...s.agentLog,
        { type: "status" as const, message: "Reverting deployment...", timestamp: Date.now() },
      ],
    }));

    try {
      const response = await fetch("/api/deploy/cleanup", { method: "DELETE" });
      if (!response.ok) throw new Error(`Cleanup API error: ${response.status}`);

      set((s) => ({
        deploying: false,
        deployed: false,
        deployProgress: 0,
        createdCampaigns: [],
        adsManagerUrl: null,
        deployError: null,
        executionStatuses: {
          "ap-1": "done",
          "ap-2": "done",
          "ap-3": "not-started",
          "ap-4": "not-started",
          "ap-5": "not-started",
          "ap-6": "not-started",
        },
        agentLog: [
          ...s.agentLog,
          { type: "complete" as const, message: "Deployment reverted successfully", timestamp: Date.now() },
        ],
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      set((s) => ({
        deploying: false,
        deployError: msg,
        agentLog: [
          ...s.agentLog,
          { type: "error" as const, message: `Revert failed: ${msg}`, timestamp: Date.now() },
        ],
      }));
    }
  },

  toggleLiveMode: () => {
    set((s) => ({ liveMode: !s.liveMode }));
  },

  generateInsights: () => {
    set({ insightsStreaming: true });
    setTimeout(() => {
      set({ insightsStreaming: false, insightsGenerated: true });
    }, 2500);
  },

  generateReport: () => {
    set({ reportStreaming: true });
    setTimeout(() => {
      set({ reportStreaming: false, reportGenerated: true });
    }, 2500);
  },

  sendViaSlack: () => {
    set({ slackSent: true });
    setTimeout(() => set({ slackSent: false }), 3000);
  },

  openCmdK: () => set({ cmdKOpen: true, cmdKQuery: "", cmdKAnswer: null }),
  closeCmdK: () => set({ cmdKOpen: false }),
  setCmdKQuery: (q) => set({ cmdKQuery: q }),
  submitCmdK: () => {
    const q = get().cmdKQuery.toLowerCase();
    let answer = "I don't have data for that query yet.";
    if (q.includes("cpl") || q.includes("cost per lead")) {
      answer =
        "$101.40 — that was the average CPL in the 7-day period before the audience exclusion was applied. Current CPL is $95.29 (6.0% improvement).";
    } else if (q.includes("roas")) {
      answer =
        "Summit Home Services's current ROAS is 3.2x, up from 2.9x before the audience exclusion.";
    } else if (q.includes("ctr")) {
      answer =
        "Summit Home Services's CTR improved from 2.38% to 2.50% after excluding past customers.";
    } else if (q.includes("summit") || q.includes("roofing")) {
      answer =
        "Summit Home Services has 4 active campaigns on Meta Ads. The most recent action was an audience exclusion of 2,412 past customers, deployed Feb 10, 2026.";
    }
    set({ cmdKAnswer: answer });
  },

  resetDemo: () => {
    const { liveMode } = get(); // preserve live mode toggle across resets
    set({
      demoNoteCreated: false,
      demoNote: null,
      unlockedPhases: ["strategize"],
      currentPhase: "strategize",
      transcriptImported: false,
      transcriptStreaming: false,
      strategyBriefGenerated: false,
      strategyBriefStreaming: false,
      strategyBriefAccepted: false,
      strategizeApproved: false,
      actionPlanGenerated: false,
      actionPlanStreaming: false,
      actionPlanAccepted: false,
      actionItems: [],
      discussionVisible: false,
      gapAnalysisGenerated: false,
      gapAnalysisStreaming: false,
      planApproved: false,
      campaignConfigGenerated: false,
      campaignConfigStreaming: false,
      validationGenerated: false,
      validationStreaming: false,
      deployed: false,
      deploying: false,
      deployProgress: 0,
      executionStatuses: {
        "ap-1": "not-started",
        "ap-2": "not-started",
        "ap-3": "not-started",
        "ap-4": "not-started",
        "ap-5": "not-started",
        "ap-6": "not-started",
      },
      liveMode,
      agentLog: [],
      createdCampaigns: [],
      adsManagerUrl: null,
      deployError: null,
      dashboardLoaded: false,
      insightsGenerated: false,
      insightsStreaming: false,
      reportGenerated: false,
      reportStreaming: false,
      slackSent: false,
      cmdKOpen: false,
      cmdKQuery: "",
      cmdKAnswer: null,
    });
  },
}));
