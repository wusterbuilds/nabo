"use client";

import { useState, useRef, useCallback } from "react";
import { useDemoStore } from "@/lib/demo-store";
import type { CampaignSpec, AdSetSpec, AdSpec } from "@/lib/data";
import { CollapsibleSection } from "./collapsible-section";
import { Commentable } from "./commentable";
import {
  Megaphone,
  Target,
  Image as ImageIcon,
  Plus,
  MapPin,
  Users,
  Tag,
  ShieldX,
  Upload,
  X,
} from "lucide-react";

// ─── Dropdown options ────────────────────────────────────────

const OBJECTIVES = [
  { value: "OUTCOME_LEADS", label: "Leads" },
  { value: "OUTCOME_AWARENESS", label: "Awareness" },
  { value: "OUTCOME_TRAFFIC", label: "Traffic" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement" },
  { value: "OUTCOME_SALES", label: "Sales" },
  { value: "OUTCOME_APP_PROMOTION", label: "App Promotion" },
];

const OPTIMIZATION_GOALS = [
  { value: "LEAD_GENERATION", label: "Lead Generation" },
  { value: "LINK_CLICKS", label: "Link Clicks" },
  { value: "REACH", label: "Reach" },
  { value: "IMPRESSIONS", label: "Impressions" },
  { value: "CONVERSIONS", label: "Conversions" },
  { value: "LANDING_PAGE_VIEWS", label: "Landing Page Views" },
];

const CTA_TYPES = [
  { value: "GET_QUOTE", label: "Get Quote" },
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "BOOK_NOW", label: "Book Now" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "SUBSCRIBE", label: "Subscribe" },
];

// ─── Shared field components ─────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-[11px] text-muted-foreground font-medium w-[100px] shrink-0 pt-1 text-right">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-[13px] px-2 py-1 rounded-md border border-border/60 bg-white outline-none focus:ring-1 focus:ring-persian-orange/30 focus:border-persian-orange/40 transition-colors ${className}`}
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className={`text-[13px] px-2 py-1 rounded-md border border-border/60 bg-white outline-none focus:ring-1 focus:ring-persian-orange/30 focus:border-persian-orange/40 transition-colors w-24 ${className}`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-[13px] px-2 py-1 rounded-md border border-border/60 bg-white outline-none focus:ring-1 focus:ring-persian-orange/30 cursor-pointer ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full text-[13px] px-2 py-1 rounded-md border border-border/60 bg-white outline-none focus:ring-1 focus:ring-persian-orange/30 focus:border-persian-orange/40 transition-colors resize-none"
    />
  );
}

// ─── Tag component ───────────────────────────────────────────

function TagPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-red-500 transition-colors">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

// ─── Ad Level ────────────────────────────────────────────────

function AdForm({
  ad,
  campaignId,
  adSetId,
}: {
  ad: AdSpec;
  campaignId: string;
  adSetId: string;
}) {
  const { updateAd } = useDemoStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (updates: Partial<AdSpec>) => updateAd(campaignId, adSetId, ad.id, updates),
    [campaignId, adSetId, ad.id, updateAd]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        update({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [update]
  );

  return (
    <div className="space-y-0.5">
      <FieldRow label="Headline">
        <TextInput value={ad.headline} onChange={(v) => update({ headline: v })} placeholder="Ad headline" />
      </FieldRow>
      <FieldRow label="Body">
        <TextArea value={ad.body} onChange={(v) => update({ body: v })} placeholder="Ad body copy" rows={3} />
      </FieldRow>
      <FieldRow label="Description">
        <TextInput value={ad.description} onChange={(v) => update({ description: v })} placeholder="Short description" />
      </FieldRow>
      <FieldRow label="CTA">
        <SelectInput value={ad.callToAction} onChange={(v) => update({ callToAction: v })} options={CTA_TYPES} />
      </FieldRow>
      <FieldRow label="Link URL">
        <TextInput value={ad.linkUrl} onChange={(v) => update({ linkUrl: v })} placeholder="https://..." />
      </FieldRow>
      <FieldRow label="Image">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium border border-border/60 bg-white hover:bg-snow transition-colors text-onyx"
          >
            <Upload className="w-3 h-3" />
            {ad.imageUrl ? "Change" : "Upload"}
          </button>
          {ad.imageUrl && (
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt="preview"
                className="w-8 h-8 rounded object-cover border border-border/40"
              />
              <button
                onClick={() => update({ imageUrl: "" })}
                className="text-[10px] text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          {!ad.imageUrl && (
            <span className="text-[11px] text-muted-foreground/50">No image (optional)</span>
          )}
        </div>
      </FieldRow>
    </div>
  );
}

// ─── Ad Set Level ────────────────────────────────────────────

function AdSetForm({
  adSet,
  campaignId,
}: {
  adSet: AdSetSpec;
  campaignId: string;
}) {
  const { updateAdSet } = useDemoStore();
  const [newInterest, setNewInterest] = useState("");
  const [newAudienceId, setNewAudienceId] = useState("");
  const [newAudienceName, setNewAudienceName] = useState("");

  const update = useCallback(
    (updates: Partial<AdSetSpec>) => updateAdSet(campaignId, adSet.id, updates),
    [campaignId, adSet.id, updateAdSet]
  );

  const updateTargeting = useCallback(
    (targetingUpdates: Partial<AdSetSpec["targeting"]>) => {
      update({ targeting: { ...adSet.targeting, ...targetingUpdates } });
    },
    [adSet.targeting, update]
  );

  const locationDisplay = (() => {
    const parts: string[] = [];
    if (adSet.targeting.geoLocations.countries) {
      parts.push(...adSet.targeting.geoLocations.countries);
    }
    if (adSet.targeting.geoLocations.cities) {
      parts.push(...adSet.targeting.geoLocations.cities.map((c) => c.name));
    }
    return parts.join(", ") || "Not set";
  })();

  return (
    <div className="space-y-0.5">
      <FieldRow label="Name">
        <TextInput value={adSet.name} onChange={(v) => update({ name: v })} />
      </FieldRow>
      <FieldRow label="Optimization">
        <SelectInput value={adSet.optimizationGoal} onChange={(v) => update({ optimizationGoal: v })} options={OPTIMIZATION_GOALS} />
      </FieldRow>
      <FieldRow label="Daily Budget">
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-muted-foreground">$</span>
          <NumberInput
            value={adSet.dailyBudget / 100}
            onChange={(v) => update({ dailyBudget: Math.round(v * 100) })}
            min={1}
            step={1}
          />
          <span className="text-[11px] text-muted-foreground/50">/day</span>
        </div>
      </FieldRow>

      {/* Targeting */}
      <div className="mt-2 mb-1 px-2 py-1.5 rounded-md bg-snow/50 border border-border/30">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <Target className="w-3 h-3" /> Targeting
        </div>

        <FieldRow label="Location">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-[13px] text-onyx">{locationDisplay}</span>
          </div>
        </FieldRow>

        <FieldRow label="Age">
          <div className="flex items-center gap-1.5">
            <NumberInput value={adSet.targeting.ageMin} onChange={(v) => updateTargeting({ ageMin: v })} min={18} max={65} className="w-16" />
            <span className="text-[11px] text-muted-foreground">to</span>
            <NumberInput value={adSet.targeting.ageMax} onChange={(v) => updateTargeting({ ageMax: v })} min={18} max={65} className="w-16" />
          </div>
        </FieldRow>

        <FieldRow label="Gender">
          <div className="flex items-center gap-3">
            {[
              { value: 0, label: "All" },
              { value: 1, label: "Male" },
              { value: 2, label: "Female" },
            ].map((g) => (
              <label key={g.value} className="flex items-center gap-1 text-[12px] text-onyx cursor-pointer">
                <input
                  type="radio"
                  name={`gender-${adSet.id}`}
                  checked={adSet.targeting.genders[0] === g.value}
                  onChange={() => updateTargeting({ genders: [g.value] })}
                  className="w-3 h-3 accent-persian-orange"
                />
                {g.label}
              </label>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Interests">
          <div className="flex flex-wrap items-center gap-1">
            {adSet.targeting.interests.map((int) => (
              <TagPill
                key={int.id}
                label={int.name}
                onRemove={() =>
                  updateTargeting({
                    interests: adSet.targeting.interests.filter((i) => i.id !== int.id),
                  })
                }
              />
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add interest..."
                className="text-[11px] px-1.5 py-0.5 rounded border border-border/40 bg-white outline-none w-28 focus:ring-1 focus:ring-persian-orange/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newInterest.trim()) {
                    updateTargeting({
                      interests: [
                        ...adSet.targeting.interests,
                        { id: `custom-${Date.now()}`, name: newInterest.trim() },
                      ],
                    });
                    setNewInterest("");
                  }
                }}
              />
            </div>
          </div>
        </FieldRow>

        <FieldRow label="Exclusions">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <ShieldX className="w-3 h-3" />
              Custom Audience Exclusions
            </div>
            {adSet.targeting.excludedCustomAudiences.map((aud) => (
              <div key={aud.id} className="flex items-center gap-1.5">
                <TagPill
                  label={`${aud.name} (${aud.id})`}
                  onRemove={() =>
                    updateTargeting({
                      excludedCustomAudiences: adSet.targeting.excludedCustomAudiences.filter(
                        (a) => a.id !== aud.id
                      ),
                    })
                  }
                />
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newAudienceId}
                onChange={(e) => setNewAudienceId(e.target.value)}
                placeholder="Audience ID"
                className="text-[11px] px-1.5 py-0.5 rounded border border-border/40 bg-white outline-none w-32 focus:ring-1 focus:ring-persian-orange/20"
              />
              <input
                type="text"
                value={newAudienceName}
                onChange={(e) => setNewAudienceName(e.target.value)}
                placeholder="Name"
                className="text-[11px] px-1.5 py-0.5 rounded border border-border/40 bg-white outline-none w-32 focus:ring-1 focus:ring-persian-orange/20"
              />
              <button
                onClick={() => {
                  if (newAudienceId.trim()) {
                    updateTargeting({
                      excludedCustomAudiences: [
                        ...adSet.targeting.excludedCustomAudiences,
                        { id: newAudienceId.trim(), name: newAudienceName.trim() || newAudienceId.trim() },
                      ],
                    });
                    setNewAudienceId("");
                    setNewAudienceName("");
                  }
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </FieldRow>
      </div>

      {/* Ads within this ad set */}
      {adSet.ads.map((ad) => (
        <div key={ad.id} className="mt-1.5">
          <CollapsibleSection
            title={ad.name || "Untitled Ad"}
            icon={ImageIcon}
            iconColor="text-pink-500"
          >
            <AdForm ad={ad} campaignId={campaignId} adSetId={adSet.id} />
          </CollapsibleSection>
        </div>
      ))}
    </div>
  );
}

// ─── Campaign Level ──────────────────────────────────────────

function CampaignForm({ campaign }: { campaign: CampaignSpec }) {
  const { updateCampaign } = useDemoStore();

  const update = useCallback(
    (updates: Partial<CampaignSpec>) => updateCampaign(campaign.id, updates),
    [campaign.id, updateCampaign]
  );

  return (
    <div className="space-y-0.5">
      <FieldRow label="Name">
        <TextInput value={campaign.name} onChange={(v) => update({ name: v })} />
      </FieldRow>
      <FieldRow label="Objective">
        <SelectInput value={campaign.objective} onChange={(v) => update({ objective: v })} options={OBJECTIVES} />
      </FieldRow>
      <FieldRow label="Daily Budget">
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-muted-foreground">$</span>
          <NumberInput
            value={campaign.dailyBudget / 100}
            onChange={(v) => update({ dailyBudget: Math.round(v * 100) })}
            min={1}
            step={1}
          />
          <span className="text-[11px] text-muted-foreground/50">/day</span>
        </div>
      </FieldRow>
      <FieldRow label="Status">
        <SelectInput
          value={campaign.status}
          onChange={(v) => update({ status: v })}
          options={[
            { value: "PAUSED", label: "Paused" },
            { value: "ACTIVE", label: "Active" },
          ]}
        />
      </FieldRow>

      {/* Ad Sets within this campaign */}
      {campaign.adSets.map((adSet) => (
        <div key={adSet.id} className="mt-2">
          <CollapsibleSection
            title={adSet.name || "Untitled Ad Set"}
            icon={Users}
            iconColor="text-emerald-600"
            badge={
              <span className="text-[10px] text-muted-foreground/40">
                {adSet.ads.length} ad{adSet.ads.length !== 1 ? "s" : ""}
              </span>
            }
          >
            <AdSetForm adSet={adSet} campaignId={campaign.id} />
          </CollapsibleSection>
        </div>
      ))}
    </div>
  );
}

// ─── Main Config Form ────────────────────────────────────────

export function CampaignConfigForm() {
  const { campaignConfig, updateCampaignConfig } = useDemoStore();

  return (
    <Commentable id="campaign-config-form">
      <CollapsibleSection
        title="Campaign Configuration"
        icon={Tag}
        iconColor="text-spanish-orange"
        badge={
          <span className="text-[10px] text-muted-foreground/50">
            {campaignConfig.campaigns.length} campaign{campaignConfig.campaigns.length !== 1 ? "s" : ""}
          </span>
        }
        className="my-3"
      >
        <div className="rounded-lg border border-border/60 bg-white overflow-hidden">
          <div className="px-3 py-2 space-y-1">
          {/* Account-level fields */}
          <FieldRow label="Account ID">
            <TextInput
              value={campaignConfig.accountId}
              onChange={(v) => updateCampaignConfig({ ...campaignConfig, accountId: v })}
              placeholder="act_XXXXXXXXX"
            />
          </FieldRow>
          <FieldRow label="Page ID">
            <TextInput
              value={campaignConfig.pageId}
              onChange={(v) => updateCampaignConfig({ ...campaignConfig, pageId: v })}
              placeholder="Facebook Page ID"
            />
          </FieldRow>

          {/* Campaigns */}
          {campaignConfig.campaigns.map((campaign) => (
            <div key={campaign.id} className="mt-2">
              <CollapsibleSection
                title={campaign.name || "Untitled Campaign"}
                icon={Megaphone}
                iconColor="text-spanish-orange"
                badge={
                  <span className="text-[10px] text-muted-foreground/40">
                    {campaign.adSets.length} ad set{campaign.adSets.length !== 1 ? "s" : ""}
                  </span>
                }
              >
                <div className="ml-1 pl-2 border-l-2 border-border/30">
                  <CampaignForm campaign={campaign} />
                </div>
              </CollapsibleSection>
            </div>
          ))}

          {/* Add campaign button */}
          <button
            onClick={() => {
              const newId = `camp-${Date.now()}`;
              updateCampaignConfig({
                ...campaignConfig,
                campaigns: [
                  ...campaignConfig.campaigns,
                  {
                    id: newId,
                    name: "New Campaign",
                    objective: "OUTCOME_LEADS",
                    dailyBudget: 2000,
                    status: "PAUSED",
                    specialAdCategories: [],
                    adSets: [
                      {
                        id: `as-${Date.now()}`,
                        name: "New Ad Set",
                        optimizationGoal: "LEAD_GENERATION",
                        billingEvent: "IMPRESSIONS",
                        dailyBudget: 2000,
                        targeting: {
                          geoLocations: { countries: ["US"] },
                          ageMin: 25,
                          ageMax: 65,
                          genders: [0],
                          interests: [],
                          excludedCustomAudiences: [],
                        },
                        destinationType: "ON_AD",
                        ads: [
                          {
                            id: `ad-${Date.now()}`,
                            name: "New Ad",
                            headline: "",
                            body: "",
                            description: "",
                            callToAction: "LEARN_MORE",
                            linkUrl: "",
                            imageUrl: "",
                          },
                        ],
                      },
                    ],
                  },
                ],
              });
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 text-[12px] text-muted-foreground/50 hover:text-muted-foreground hover:bg-snow/50 rounded-md border border-dashed border-border/40 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Campaign
          </button>
          </div>
        </div>
      </CollapsibleSection>
    </Commentable>
  );
}
