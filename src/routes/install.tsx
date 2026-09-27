import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  MonitorSmartphone,
  Smartphone,
  Apple,
  Chrome,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Install DebtFree on your phone" },
      {
        name: "description",
        content:
          "Add DebtFree to your home screen in under a minute — works on iPhone, Android and desktop, no app store needed.",
      },
      { property: "og:title", content: "Install DebtFree on your phone" },
      {
        property: "og:description",
        content: "Add DebtFree to your home screen in under a minute — no app store needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstallPage,
});

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function nativeInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result?.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-md px-5 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
            ⏣
          </div>
          <span className="font-display font-bold text-lg tracking-tight">DebtFree</span>
        </Link>
      </header>

      <main className="mx-auto max-w-md px-5 pt-8 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold mb-4">
          <Download className="h-3.5 w-3.5" /> Install the app
        </div>
        <h1 className="font-display text-[32px] leading-[1.1] tracking-tight font-extrabold text-balance">
          Put DebtFree on your home screen
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          No app store, no download waiting. It takes under a minute and works on iPhone, Android
          and computer — the app then opens full screen, just like a native app.
        </p>

        {installed && (
          <div className="mt-5 rounded-2xl bg-primary-soft/60 border border-primary/20 p-4 flex items-center gap-3">
            <CircleCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium">
              Looks like the app is already installed. You're all set!
            </p>
          </div>
        )}

        {/* One-tap install where the browser supports it */}
        {installEvent && !installed && (
          <Button
            size="lg"
            onClick={nativeInstall}
            className="mt-6 w-full rounded-2xl h-14 text-base font-bold shadow-lift"
          >
            <Download className="h-5 w-5" /> Install now — one tap
          </Button>
        )}

        {/* Platform picker */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {(
            [
              { id: "ios", label: "iPhone", icon: Apple },
              { id: "android", label: "Android", icon: Smartphone },
              { id: "desktop", label: "Computer", icon: MonitorSmartphone },
            ] as const
          ).map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={cn(
                  "rounded-2xl border p-3 flex flex-col items-center gap-1.5 text-xs font-semibold transition-all",
                  platform === p.id
                    ? "bg-primary-soft border-primary/40 text-primary"
                    : "bg-surface border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {p.label}
                {detectPlatform() === p.id && (
                  <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Steps */}
        <div className="mt-6 rounded-3xl bg-surface border border-border p-5">
          {platform === "ios" && <IosSteps />}
          {platform === "android" && <AndroidSteps />}
          {platform === "desktop" && <DesktopSteps />}
        </div>

        {platform === "ios" && (
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Tip: on newer iPhones, Chrome works too — tap the Share button in Chrome and choose
            "Add to Home Screen". If you don't see it there, open the site in Safari and follow
            the steps above.
          </p>
        )}

        <div className="mt-8">
          <Link to="/">
            <Button variant="outline" className="w-full h-12 rounded-2xl font-semibold">
              Back to home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold text-sm shrink-0">
        {n}
      </div>
      <div className="pt-0.5">
        <p className="font-semibold text-[15px]">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}

function IosSteps() {
  return (
    <div className="space-y-6">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
        <Apple className="h-3.5 w-3.5" /> iPhone & iPad · Safari
      </p>
      <Step n={1} title="Open DebtFree in Safari" body="Type the app's address in Safari. Make sure you're on the site itself." />
      <Step n={2} title="Tap the Share button" body="The square with an arrow pointing up, at the bottom of the screen." />
      <Step n={3} title="Choose “Add to Home Screen”" body="Scroll down the share menu until you see it, then tap it." />
      <Step n={4} title="Tap “Add”" body="Done — the DebtFree icon appears on your home screen and opens full screen." />
    </div>
  );
}

function AndroidSteps() {
  return (
    <div className="space-y-6">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
        <Chrome className="h-3.5 w-3.5" /> Android · Chrome
      </p>
      <Step n={1} title="Open DebtFree in Chrome" body="Type the app's address in the Chrome address bar." />
      <Step n={2} title="Tap the ⋮ menu" body="The three dots in the top-right corner of Chrome." />
      <Step n={3} title="Tap “Install app” or “Add to Home screen”" body="Chrome may also show a small install banner at the bottom — that works too." />
      <Step n={4} title="Confirm “Install”" body="Done — DebtFree is on your home screen and opens full screen like a native app." />
    </div>
  );
}

function DesktopSteps() {
  return (
    <div className="space-y-6">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
        <MonitorSmartphone className="h-3.5 w-3.5" /> Windows, Mac & Linux · Chrome or Edge
      </p>
      <Step n={1} title="Open DebtFree in your browser" body="Chrome or Edge both work." />
      <Step n={2} title="Look for the install icon" body="A small screen-with-arrow icon appears at the right end of the address bar. Click it." />
      <Step n={3} title="Click “Install”" body="Or use the ⋮ menu → “Install DebtFree”." />
      <Step n={4} title="Open it like an app" body="DebtFree gets its own window and icon in your dock or taskbar." />
    </div>
  );
}
