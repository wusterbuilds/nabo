"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { clients } from "@/lib/data";
import { useRouter } from "next/navigation";

interface CmdKContextValue {
  open: () => void;
  close: () => void;
}

const CmdKContext = createContext<CmdKContextValue>({
  open: () => {},
  close: () => {},
});

export function useCmdK() {
  return useContext(CmdKContext);
}

export function CmdKProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const router = useRouter();

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setAnswer(null);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setAnswer(null);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, open, close]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setIsThinking(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      let a = "I don't have data for that query in this prototype.";
      if (q.includes("cpl") || q.includes("cost per lead")) {
        a =
          "$101.40 — that was the average CPL in the 7-day period before the audience exclusion was applied. Current CPL is $95.29 (6.0% improvement).";
      } else if (q.includes("roas")) {
        a =
          "Summit Home Services's current ROAS is 3.2x, up from 2.9x before the audience exclusion.";
      } else if (q.includes("ctr")) {
        a =
          "Summit Home Services's CTR improved from 2.38% to 2.50% after excluding past customers.";
      } else if (q.includes("summit") || q.includes("roofing")) {
        a =
          "Summit Home Services has 4 active campaigns on Meta Ads. The most recent action was an audience exclusion of 2,412 past customers.";
      }
      setAnswer(a);
      setIsThinking(false);
    }, 1500);
  };

  // Quick nav items
  const navItems = clients.map((c) => ({
    label: c.name,
    icon: <FolderOpen className="w-4 h-4" />,
    action: () => {
      router.push(`/client/${c.id}`);
      close();
    },
  }));

  return (
    <CmdKContext.Provider value={{ open, close }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(o) => (o ? open() : close())}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Command bar</DialogTitle>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {answer ? (
              <Sparkles className="w-4 h-4 text-spanish-orange shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <Input
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm placeholder:text-muted-foreground"
              placeholder="Search, navigate, or ask AI anything..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAnswer(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isThinking && (
              <div className="px-4 py-6 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-spanish-orange animate-pulse" />
                  Thinking...
                </div>
              </div>
            )}

            {answer && !isThinking && (
              <div className="px-4 py-4">
                <div className="bg-secondary/50 rounded-lg p-3 border border-persian-orange/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-spanish-orange" />
                    <span className="text-xs font-medium text-spanish-orange">
                      AI Answer
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {answer}
                  </p>
                </div>
              </div>
            )}

            {!answer && !isThinking && (
              <div className="py-2">
                <div className="px-3 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Navigate to
                  </span>
                </div>
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto" />
                  </button>
                ))}
                <div className="px-3 py-1.5 mt-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ask AI
                  </span>
                </div>
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Type a question and press Enter — e.g. &ldquo;What was Summit&apos;s CPL before the exclusion?&rdquo;
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CmdKContext.Provider>
  );
}
