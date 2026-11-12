import { useState, useRef, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, Send, X, Bot, RotateCcw, Sparkles, Utensils, Users, Bell, HeartHandshake } from "lucide-react";
import { askCanteenBot, useServerFn } from "@/lib/server.functions";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  { label: "🍲 Today's Menu & Rates", query: "Aaj menu me kya-kya dishes aur price hai?" },
  { label: "🪑 Free Seats Count", query: "Canteen me abhi kitni seats khali hain?" },
  { label: "⏰ Lunch Timetable", query: "What are the branch-wise lunch break timings?" },
  { label: "🍱 NGO Surplus Claim", query: "Surplus food donation kaise kaam karta hai?" },
];

export function ChatBot() {
  const ask = useServerFn(askCanteenBot);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "👋 **Hello! Welcome to the Smart Canteen Executive AI.**\n\nI provide 100% verified real-time information on:\n• 🍲 **Daily Menu & Exact Rates**\n• 🪑 **Live Cafeteria Seating Counter**\n• ⏰ **Staggered Lunch Break Timetable**\n• 🍱 **NGO Surplus Redistribution Tracking**\n\nAsk me anything in English or Hindi!",
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs, open, busy]);

  // Do not show AI assistant on login / sign-in / reset-password pages
  if (pathname.includes("/login") || pathname.includes("/reset-password")) {
    return null;
  }

  async function handleSend(userQuery?: string) {
    const query = userQuery || text.trim();
    if (!query || busy) return;

    const next: Msg[] = [...msgs, { role: "user", content: query }];
    setMsgs(next);
    if (!userQuery) setText("");
    setBusy(true);

    try {
      const r = await ask({ data: { messages: next.slice(-12) } });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch (e) {
      setMsgs([
        ...next,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function formatContent(content: string) {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Bold syntax replacer: **bold text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.trim() === "" ? "h-2" : "leading-relaxed"}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </div>
      );
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#004E64] text-white px-4 py-2.5 sm:py-3 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer font-semibold text-xs sm:text-sm border-2 border-[#FF6B35]"
        aria-label="Open AI Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
        </span>
        <img src="/app-logo.png" alt="Smart Canteen" className="h-6 w-6 rounded-md object-contain shrink-0 bg-white p-0.5 shadow-xs" />
        <span>Ask Canteen AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 right-2 sm:right-5 z-50 flex h-[32rem] max-h-[75vh] md:max-h-[85vh] w-[min(25rem,calc(100vw-1rem))] flex-col rounded-2xl border-2 border-[#004E64]/30 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden ring-1 ring-black/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Frame Header: Deep Teal (#004E64) with Vibrant Orange Accent */}
      <div className="flex items-center justify-between bg-[#004E64] px-4 py-3 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center p-0.5">
            <img src="/app-logo.png" alt="Smart Canteen AI" className="h-7 w-7 rounded-md object-contain bg-white p-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">Smart Canteen AI</span>
              <span className="h-2 w-2 rounded-full bg-[#10B981] inline-block" />
            </div>
            <div className="text-[11px] opacity-80 leading-none mt-0.5">Live Menu & Seating Assistant</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setMsgs([
                {
                  role: "assistant",
                  content:
                    "Chat reset. Ask me about today's menu, seating, or campus food announcements!",
                },
              ])
            }
            title="Reset conversation"
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            title="Close Assistant"
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-zinc-50 dark:bg-zinc-950/60 text-xs sm:text-sm">
        {msgs.map((m, i) => (
          <div key={i} className="flex flex-col">
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-tr-xs"
                  : "mr-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-foreground rounded-tl-xs"
              }`}
            >
              {formatContent(m.content)}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 w-fit">
            <Bot className="h-3.5 w-3.5 text-primary animate-bounce" />
            <span>Checking live canteen system...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestion Chips */}
      {msgs.length <= 3 && !busy && (
        <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">Quick questions:</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSend(s.query)}
                className="text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md transition-colors text-left"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <form
        className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="flex-1 h-9 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask e.g. 'What is on menu?' or 'Seats khali hain?'"
          disabled={busy}
        />
        <Button
          size="sm"
          type="submit"
          disabled={busy || !text.trim()}
          className="h-9 w-9 p-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
