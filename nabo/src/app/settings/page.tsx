"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Search as GoogleIcon,
  Music2,
  Linkedin,
  MessageSquare,
  Mail,
  Video,
} from "lucide-react";
import { useState } from "react";

interface Integration {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: "ads" | "communication";
}

const integrations: Integration[] = [
  {
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    icon: <Facebook className="w-5 h-5" />,
    connected: true,
    category: "ads",
  },
  {
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    icon: <GoogleIcon className="w-5 h-5" />,
    connected: true,
    category: "ads",
  },
  {
    name: "TikTok Ads",
    description: "TikTok advertising platform",
    icon: <Music2 className="w-5 h-5" />,
    connected: false,
    category: "ads",
  },
  {
    name: "LinkedIn Ads",
    description: "LinkedIn advertising platform",
    icon: <Linkedin className="w-5 h-5" />,
    connected: false,
    category: "ads",
  },
  {
    name: "Slack",
    description: "Import messages, send reports",
    icon: <MessageSquare className="w-5 h-5" />,
    connected: true,
    category: "communication",
  },
  {
    name: "Email",
    description: "Send reports via email",
    icon: <Mail className="w-5 h-5" />,
    connected: true,
    category: "communication",
  },
  {
    name: "Zoom",
    description: "Import meeting transcripts",
    icon: <Video className="w-5 h-5" />,
    connected: true,
    category: "communication",
  },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.name, i.connected]))
  );

  const adsPlatforms = integrations.filter((i) => i.category === "ads");
  const commPlatforms = integrations.filter(
    (i) => i.category === "communication"
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-onyx tracking-tight mb-1">
        Settings
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage your integrations and connected platforms
      </p>

      {/* Ad Platforms */}
      <div className="mb-10">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Ad Platforms
        </h2>
        <div className="space-y-3">
          {adsPlatforms.map((platform) => (
            <IntegrationRow
              key={platform.name}
              platform={platform}
              enabled={toggles[platform.name]}
              onToggle={() =>
                setToggles((prev) => ({
                  ...prev,
                  [platform.name]: !prev[platform.name],
                }))
              }
            />
          ))}
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Communication */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Communication
        </h2>
        <div className="space-y-3">
          {commPlatforms.map((platform) => (
            <IntegrationRow
              key={platform.name}
              platform={platform}
              enabled={toggles[platform.name]}
              onToggle={() =>
                setToggles((prev) => ({
                  ...prev,
                  [platform.name]: !prev[platform.name],
                }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({
  platform,
  enabled,
  onToggle,
}: {
  platform: Integration;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          enabled ? "bg-persian-orange/10 text-persian-orange" : "bg-muted text-muted-foreground"
        }`}
      >
        {platform.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-onyx">{platform.name}</h3>
        <p className="text-xs text-muted-foreground">{platform.description}</p>
      </div>
      <div className="flex items-center gap-3">
        {enabled && (
          <Badge className="bg-green-50 text-green-700 text-[10px]">
            Connected
          </Badge>
        )}
        {/* Toggle switch */}
        <button
          onClick={onToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            enabled ? "bg-spanish-orange" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-[18px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
