// ============================================================
// Nabo Mock Data — Clients, Notes, and Scripted Demo Content
// ============================================================

export interface Client {
  id: string;
  name: string;
  logo: string; // emoji or initials for mockup
  color: string;
  activeNotes: number;
  archivedNotes: number;
  lastActivity: string;
}

export interface NoteCard {
  id: string;
  clientId: string;
  title: string;
  phase: "strategize" | "plan" | "live" | "monitor";
  phaseLabel: string;
  status: "active" | "archived";
  lastUpdated: string;
  collaborators: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;       // team member name or "AI"
  dueDate: string;
  status: "pending" | "complete";
  subItems?: string[];
  actionType?: "upload" | "external" | "run";  // contextual action button
  actionLabel?: string;   // override label for the action button
  actionUrl?: string;     // URL for external links
}

export interface MetricData {
  label: string;
  value: string;
  delta: string;
  deltaType: "positive" | "negative" | "neutral";
  sparkline: number[];
}

// ============================================================
// Campaign Config Types (structured, used by config form + deploy)
// ============================================================

export interface AdSpec {
  id: string;
  name: string;
  headline: string;
  body: string;
  description: string;
  callToAction: string;
  linkUrl: string;
  imageUrl: string;       // preview URL (data URL or remote URL)
  imageHash?: string;     // populated after upload during deploy
}

export interface AdSetSpec {
  id: string;
  name: string;
  optimizationGoal: string;   // LEAD_GENERATION, LINK_CLICKS, REACH, etc.
  billingEvent: string;       // IMPRESSIONS
  dailyBudget: number;        // in cents
  targeting: {
    geoLocations: { countries?: string[]; cities?: { key: string; name: string }[] };
    ageMin: number;
    ageMax: number;
    genders: number[];        // 0=all, 1=male, 2=female
    interests: { id: string; name: string }[];
    excludedCustomAudiences: { id: string; name: string }[];
  };
  destinationType?: string;   // ON_AD for lead gen
  ads: AdSpec[];
}

export interface CampaignSpec {
  id: string;
  name: string;
  objective: string;          // OUTCOME_LEADS, OUTCOME_AWARENESS, etc.
  dailyBudget: number;        // in cents
  status: string;             // PAUSED
  specialAdCategories: string[];
  adSets: AdSetSpec[];
}

export interface CampaignConfigData {
  accountId: string;
  pageId: string;
  campaigns: CampaignSpec[];
}

export const defaultCampaignConfig: CampaignConfigData = {
  accountId: "act_717619928006490",
  pageId: "818018421395627",
  campaigns: [
    {
      id: "camp-1",
      name: "Summit — Local Awareness",
      objective: "OUTCOME_AWARENESS",
      dailyBudget: 5000,   // $50/day
      status: "PAUSED",
      specialAdCategories: [],
      adSets: [
        {
          id: "as-1",
          name: "Dallas Homeowners 35-65",
          optimizationGoal: "REACH",
          billingEvent: "IMPRESSIONS",
          dailyBudget: 5000,
          targeting: {
            geoLocations: {
              cities: [{ key: "2420587", name: "Dallas, TX" }],
            },
            ageMin: 35,
            ageMax: 65,
            genders: [0],
            interests: [
              { id: "6003234413249", name: "Home improvement" },
              { id: "6003009740281", name: "Roofing Contractor" },
            ],
            excludedCustomAudiences: [],
          },
          ads: [
            {
              id: "ad-1",
              name: "Storm Season CTA",
              headline: "Free Roof Inspection — Dallas",
              body: "Dallas storm season is here. Summit Home Services offers free inspections and same-week estimates. Trusted by 2,400+ homeowners.",
              description: "Free inspection, no obligation",
              callToAction: "LEARN_MORE",
              linkUrl: "https://example.com/free-inspection",
              imageUrl: "",
            },
          ],
        },
      ],
    },
    {
      id: "camp-2",
      name: "Summit — Retargeting Awareness",
      objective: "OUTCOME_AWARENESS",
      dailyBudget: 3000,   // $30/day
      status: "PAUSED",
      specialAdCategories: [],
      adSets: [
        {
          id: "as-2",
          name: "Website Visitors Retarget",
          optimizationGoal: "REACH",
          billingEvent: "IMPRESSIONS",
          dailyBudget: 3000,
          targeting: {
            geoLocations: {
              countries: ["US"],
            },
            ageMin: 25,
            ageMax: 65,
            genders: [0],
            interests: [
              { id: "6003234413249", name: "Home improvement" },
            ],
            excludedCustomAudiences: [],
          },
          ads: [
            {
              id: "ad-2",
              name: "Limited Time Offer",
              headline: "Get $500 Off Your New Roof",
              body: "You visited Summit Home Services — now save $500 on any full roof replacement. Licensed, insured, 5-star rated. Offer expires soon.",
              description: "Limited time offer",
              callToAction: "LEARN_MORE",
              linkUrl: "https://example.com/offer",
              imageUrl: "",
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================
// Clients
// ============================================================

export const clients: Client[] = [
  {
    id: "summit-home",
    name: "Summit Home Services",
    logo: "🏠",
    color: "#F0660D",
    activeNotes: 0,
    archivedNotes: 3,
    lastActivity: "Feb 5, 2026",
  },
  {
    id: "greenleaf",
    name: "Greenleaf Landscaping",
    logo: "🌿",
    color: "#4A7C59",
    activeNotes: 0,
    archivedNotes: 2,
    lastActivity: "Jan 22, 2026",
  },
  {
    id: "brightsmile",
    name: "BrightSmile Dental",
    logo: "🦷",
    color: "#4A90D9",
    activeNotes: 0,
    archivedNotes: 1,
    lastActivity: "Jan 10, 2026",
  },
  {
    id: "metro-fitness",
    name: "Metro Fitness",
    logo: "💪",
    color: "#7C3AED",
    activeNotes: 0,
    archivedNotes: 0,
    lastActivity: "—",
  },
];

// ============================================================
// Archived Notes (Static, non-interactive)
// ============================================================

export const archivedNotes: Record<string, NoteCard[]> = {
  "summit-home": [
    {
      id: "sr-archive-1",
      clientId: "summit-home",
      title: "Q4 2025 — Holiday Promo Campaign",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Dec 18, 2025",
      collaborators: ["Sarah", "Mike"],
    },
    {
      id: "sr-archive-2",
      clientId: "summit-home",
      title: "Q3 2025 — Brand Awareness Push",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Oct 12, 2025",
      collaborators: ["Sarah", "Alex"],
    },
    {
      id: "sr-archive-3",
      clientId: "summit-home",
      title: "Q2 2025 — Spring Lead Gen Relaunch",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Jul 8, 2025",
      collaborators: ["Sarah", "Mike", "Alex"],
    },
  ],
  greenleaf: [
    {
      id: "gl-archive-1",
      clientId: "greenleaf",
      title: "Fall Cleanup Special Campaign",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Nov 30, 2025",
      collaborators: ["Sarah"],
    },
    {
      id: "gl-archive-2",
      clientId: "greenleaf",
      title: "Summer Lawn Care Promo",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Aug 15, 2025",
      collaborators: ["Alex"],
    },
  ],
  brightsmile: [
    {
      id: "bs-archive-1",
      clientId: "brightsmile",
      title: "New Patient Special — Q4",
      phase: "monitor",
      phaseLabel: "Complete",
      status: "archived",
      lastUpdated: "Dec 5, 2025",
      collaborators: ["Sarah", "Mike"],
    },
  ],
  "metro-fitness": [],
};

// ============================================================
// Scripted Demo Content for Summit Home Services Scenario
// ============================================================

export const demoTranscript = `Zoom Meeting Transcript — Summit Home Services Bi-Weekly Check-in — Feb 5, 2026

Casey (Summit Home Services): So one thing that's been bugging us — we're getting complaints from past customers who keep seeing our ads. These are people who already hired us. It's not a great look and honestly we're wasting money on them.

Sarah (Agency): That makes sense. We can definitely exclude them. Do you have a list of those customers?

Casey: Yeah, we can pull a list from our CRM. It's about 2,400 people — we have their emails and phone numbers.

Sarah: Perfect. If you can export that as a CSV, we can upload it to Meta as an exclusion audience. That way they'll be removed from all your campaigns.

Casey: Great, I'll have our office manager send that over by end of this week.

Sarah: Sounds good. Once we get it, we can probably have the exclusion live within a couple days. I'll loop in Mike on the technical setup.`;

export const demoStrategyBrief = `**Objective:** Exclude past customers (first-party data) from all active Summit Home Services ad campaigns to reduce wasted spend and stop serving ads to people who have already converted.

**Source data:** CSV list of ~2,400 past customers (emails + phone numbers), to be exported from client CRM.

**Platforms affected:** Meta Ads — 4 active campaigns.

**Expected impact:** Modest improvement in ROAS and CTR by removing non-converting impressions. No change to lead volume targets.

**Timeline:** Execute within 1 week of receiving the customer list.

**Risk:** CSV format must match Meta's requirements (email/phone columns). Confirm format with client before upload.`;

export const demoActionPlan: ActionItem[] = [
  // ── Human tasks ───────────────
  {
    id: "ap-1",
    title: "Receive customer list CSV from client",
    assignee: "Sarah",
    dueDate: "Feb 7",
    status: "pending",
    actionType: "upload",
    actionLabel: "Upload CSV",
  },
  {
    id: "ap-6",
    title: "Confirm with client that exclusion is live",
    assignee: "Sarah",
    dueDate: "Feb 11",
    status: "pending",
  },
  // ── AI tasks ──────────────────
  {
    id: "ap-2",
    title: "Validate CSV format (confirm email + phone columns match Meta requirements)",
    assignee: "AI",
    dueDate: "Feb 7",
    status: "pending",
    actionType: "run",
  },
  {
    id: "ap-3",
    title: "Create Custom Audience exclusion list in Meta Business Manager",
    assignee: "AI",
    dueDate: "Feb 10",
    status: "pending",
    actionType: "run",
    subItems: [
      'List name: "Summit Home Services — Past Customers Exclusion"',
      "Type: Static customer list (CSV upload)",
    ],
  },
  {
    id: "ap-4",
    title: "Apply exclusion list to all active campaigns",
    assignee: "AI",
    dueDate: "Feb 10",
    status: "pending",
    actionType: "run",
    subItems: [
      "Summit — Search Lead Gen",
      "Summit — Retargeting Warm Leads",
      "Summit — Lookalike Expansion",
      "Summit — Local Awareness",
    ],
  },
  {
    id: "ap-5",
    title: "Verify exclusion is active and audience sizes updated",
    assignee: "AI",
    dueDate: "Feb 11",
    status: "pending",
    actionType: "run",
  },
];

export const demoDiscussionThread = [
  {
    author: "Sarah",
    avatar: "S",
    message:
      "Casey sent the CSV. 2,412 rows — emails and phone numbers. Looks clean. @Mike ready for upload?",
  },
  {
    author: "Mike",
    avatar: "M",
    message:
      "Quick question — static list or dynamic sync? Static means we'd need to re-upload if they add more customers later.",
  },
  {
    author: "Sarah",
    avatar: "S",
    message:
      "Checked with Casey. Static is fine for now, they'll send updated lists quarterly.",
  },
  {
    author: "Mike",
    avatar: "M",
    message:
      "Perfect. I'll create the audience in Business Manager and apply to all 4 campaigns tomorrow morning.",
  },
];

export const demoGapAnalysis = `Plan looks complete. One suggestion: consider adding a step to document the audience match rate after upload — this helps set client expectations if not all contacts can be matched on Meta (typical match rates are 60-90%).`;

export const demoCampaignConfig = `**Platform:** Meta Ads
**Account:** Summit Home Services — BM #18294756
**Audience List:** "Summit Home Services — Past Customers Exclusion"
**Type:** Static customer list (CSV upload)
**Contacts:** 2,412 uploaded / 2,156 matched (89.4% match rate)
**Apply to:**
• Summit — Search Lead Gen
• Summit — Retargeting Warm Leads
• Summit — Lookalike Expansion
• Summit — Local Awareness`;

export const demoValidation = `All configurations check out. The exclusion list is correctly scoped to the ad set level for all campaigns. One note: the "Local Awareness" campaign uses a broad geo-targeted audience — applying the exclusion here will have minimal impact (~0.3% of audience) but is still recommended for consistency.`;

export const demoMetrics: MetricData[] = [
  {
    label: "Spend",
    value: "$3,240",
    delta: "-4.2%",
    deltaType: "neutral",
    sparkline: [3450, 3400, 3380, 3350, 3300, 3270, 3240],
  },
  {
    label: "Impressions",
    value: "48,200",
    delta: "-6.1%",
    deltaType: "neutral",
    sparkline: [52000, 51200, 50500, 49800, 49200, 48700, 48200],
  },
  {
    label: "Clicks",
    value: "1,205",
    delta: "-2.3%",
    deltaType: "neutral",
    sparkline: [1250, 1240, 1230, 1225, 1215, 1210, 1205],
  },
  {
    label: "CTR",
    value: "2.50%",
    delta: "+5.0%",
    deltaType: "positive",
    sparkline: [2.38, 2.4, 2.42, 2.44, 2.46, 2.48, 2.5],
  },
  {
    label: "Leads",
    value: "34",
    delta: "+9.7%",
    deltaType: "positive",
    sparkline: [31, 31, 32, 32, 33, 33, 34],
  },
  {
    label: "Cost per Lead",
    value: "$95.29",
    delta: "-6.0%",
    deltaType: "positive",
    sparkline: [101.4, 100.2, 99.1, 98.0, 96.8, 96.0, 95.29],
  },
  {
    label: "ROAS",
    value: "3.2x",
    delta: "+10.3%",
    deltaType: "positive",
    sparkline: [2.9, 2.95, 3.0, 3.05, 3.1, 3.15, 3.2],
  },
];

export const demoInsights = `7-day performance after excluding past customers from all campaigns:

• **CTR improved 5.0%** (2.38% → 2.50%) — fewer wasted impressions on non-converting past customers
• **Cost per Lead decreased 6.0%** ($101.40 → $95.29) — budget now fully focused on prospecting audience
• **ROAS improved from 2.9x to 3.2x** — efficiency gain from cleaner targeting
• **Impression volume decreased as expected** — smaller audience after exclusion, but lead volume actually increased

**Recommendation:** The exclusion is working as intended. Performance is positive — a quick confirmation to the client is sufficient. Consider scheduling a quarterly CSV re-upload to keep the list current.`;

export const demoClientReport = `Hi Casey,

Quick update on the audience exclusion we discussed — your past customer list (2,412 contacts) has been excluded from all 4 active campaigns on Meta as of Feb 10.

Early results look strong:
• Cost per lead improved from $101.40 to $95.29 (6% decrease)
• Lead volume held steady — actually up slightly (34 vs. 31 prior week)
• Overall ROAS improved from 2.9x to 3.2x

No complaints reported since the change. We'll plan to re-upload an updated list next quarter as discussed.

Let me know if you have any questions!

Best,
Sarah`;

// Team members for assignee dropdowns
export const teamMembers = ["Sarah", "Mike", "Alex"];

// Source tag options
export const sourceTags = [
  "Client Meeting",
  "Slack Message",
  "Performance Insight",
  "Internal Idea",
] as const;

// Phase definitions
export const phases = [
  {
    id: "strategize" as const,
    label: "Strategize",
    color: "#E0926B",
    description: "Capture the strategic spark",
  },
  {
    id: "plan" as const,
    label: "Plan Action",
    color: "#9A3B12",
    description: "Turn strategy into concrete actions",
  },
  {
    id: "live" as const,
    label: "Go Live",
    color: "#F0660D",
    description: "Execute and deploy",
  },
  {
    id: "monitor" as const,
    label: "Monitor & Analyze",
    color: "#454545",
    description: "Track, analyze, and report",
  },
];
