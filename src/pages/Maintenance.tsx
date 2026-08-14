import { useState, useEffect } from "react";
import { Wrench, RefreshCw, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceProps {
  title?: string;
  message?: string;
  estimatedEndTime?: string;
  onRefresh?: () => void;
  allowAdminBypass?: boolean;
}

function parseEstimatedEndTime(inputStr: string): Date | null {
  if (!inputStr || !inputStr.trim()) return null;

  const trimmed = inputStr.trim().toLowerCase();

  // 1. Pure number, e.g. "2" -> 2 hours from now
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const hours = parseFloat(trimmed);
    return new Date(Date.now() + hours * 3600 * 1000);
  }

  // 2. Hours syntax, e.g. "2h", "2 hr", "2 hours", "2.5h"
  const hourMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    return new Date(Date.now() + hours * 3600 * 1000);
  }

  // 3. Minutes syntax, e.g. "30m", "30 min", "30 mins", "45 minutes"
  const minMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
  if (minMatch) {
    const minutes = parseFloat(minMatch[1]);
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  // 4. Standard Date parse
  const parsed = new Date(inputStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

export default function Maintenance({
  title = "We’ll be back in a few hours.",
  message = "The Vora platform is offline for planned maintenance. Nothing has been lost and no action is needed on your side — everything will be waiting for you when we return.",
  estimatedEndTime = "",
  onRefresh,
  allowAdminBypass = true,
}: MaintenanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [targetTimeString, setTargetTimeString] = useState<string>("");

  const parsedTargetDate = parseEstimatedEndTime(estimatedEndTime);
  const hasEstimatedEndTime = Boolean(parsedTargetDate !== null);

  useEffect(() => {
    if (!parsedTargetDate) return;

    const targetDate = parsedTargetDate;

    // Format local and UTC time strings
    try {
      const localTimeStr = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
      const utcTimeStr = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
      setTargetTimeString(`Back online around ${localTimeStr} (${utcTimeStr})`);
    } catch {
      setTargetTimeString("Back online shortly");
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        // Auto-check status when countdown hits zero
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [estimatedEndTime, hasEstimatedEndTime]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const formatDigits = (val: number) => String(val).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-zinc-800/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center space-y-8 py-10 px-4">
        
        {/* Header Pill / Status Badge */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-[0.2em] font-medium bg-zinc-900/80 border border-zinc-800/80 px-3.5 py-1.5 rounded-full shadow-sm">
          <Wrench className="w-3.5 h-3.5 text-zinc-400" />
          <span>503</span>
          <span className="text-zinc-600">•</span>
          <span>Scheduled Maintenance</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12]">
          {title}
        </h1>

        {/* Message */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed font-normal text-center">
          {message}
        </p>

        {/* Live Digital Clock Countdown - Only Rendered If Admin Provided Estimated End Time */}
        {hasEstimatedEndTime && (
          <div className="pt-2 flex flex-col items-center">
            <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-normal tracking-[0.1em] text-white select-none">
              {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-500 font-semibold mt-3">
              Estimated time until we reopen
            </div>
            {targetTimeString && (
              <div className="text-xs sm:text-sm text-zinc-300 font-medium mt-3">
                {targetTimeString}
              </div>
            )}
          </div>
        )}

        {/* Action Button & Bypass */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white hover:bg-zinc-200 text-black text-sm font-semibold px-7 py-2.5 h-auto rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 active:scale-95 border-none"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-black" : "text-black"}`} />
            <span>{isRefreshing ? "Checking..." : "Check again"}</span>
          </Button>

          {allowAdminBypass && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 mt-2 group"
            >
              <Lock className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span>Admin Login Bypass</span>
              <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
