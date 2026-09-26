"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Command, Settings, Bell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCmdK } from "@/components/cmd-k";
import { useDemoStore } from "@/lib/demo-store";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (segments[0] === "client" && segments[1]) {
    const clientName = decodeURIComponent(segments[1])
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    crumbs.push({ label: clientName, href: `/client/${segments[1]}` });

    if (segments[2] === "note") {
      crumbs.push({
        label: "Note",
        href: `/client/${segments[1]}/note`,
      });
    }
  }

  if (segments[0] === "settings") {
    crumbs.push({ label: "Settings", href: "/settings" });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function TopBar() {
  const { open } = useCmdK();
  const { liveMode, toggleLiveMode } = useDemoStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border h-14 flex items-center px-6 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-spanish-orange flex items-center justify-center text-white font-bold text-sm">
          N
        </div>
        <span className="font-semibold text-onyx text-lg tracking-tight">
          Nabo
        </span>
      </Link>

      {/* Breadcrumbs */}
      <div className="ml-4">
        <Breadcrumbs />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live / Demo Mode Toggle */}
      <button
        onClick={toggleLiveMode}
        className={`
          flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium transition-all border
          ${
            liveMode
              ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
          }
        `}
        title={liveMode ? "Live Mode: Deploys to real Meta Ads" : "Demo Mode: Simulated deployment"}
      >
        {liveMode ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </>
        ) : (
          <>
            <Zap className="w-3 h-3" />
            Demo
          </>
        )}
      </button>

      {/* Cmd+K trigger */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground h-8 px-3 border-border"
        onClick={open}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search or ask AI...</span>
        <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
          <Command className="w-2.5 h-2.5 inline" />K
        </kbd>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <Bell className="w-4 h-4" />
      </Button>

      {/* Settings */}
      <Link href="/settings">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </Link>

      {/* User avatar */}
      <div className="w-7 h-7 rounded-full bg-persian-orange flex items-center justify-center text-white text-xs font-medium">
        AW
      </div>
    </header>
  );
}
