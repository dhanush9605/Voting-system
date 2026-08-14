import { useState } from "react";
import { Wrench, RefreshCw, Clock, ShieldCheck, ArrowRight, CheckCircle, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MaintenanceProps {
  title?: string;
  message?: string;
  estimatedEndTime?: string;
  onRefresh?: () => void;
  allowAdminBypass?: boolean;
}

export default function Maintenance({
  title = "System Under Maintenance",
  message = "Vora is currently undergoing scheduled system maintenance to enhance platform security and performance. Please check back shortly.",
  estimatedEndTime = "",
  onRefresh,
  allowAdminBypass = true,
}: MaintenanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background text-foreground overflow-hidden">
      {/* Dynamic Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-8 p-8 md:p-12 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/5">
        
        {/* Header Icon with Glowing Halo */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <Wrench className="w-10 h-10 text-amber-500 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Maintenance In Progress
          </Badge>
        </div>

        {/* Title & Message */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            {message}
          </p>
        </div>

        {/* Estimated Time Pill (If Provided) */}
        {estimatedEndTime && (
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-secondary/60 border border-border/60 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Estimated End Time:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{estimatedEndTime}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="lg"
            className="w-full sm:w-auto font-semibold shadow-lg gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking Status...' : 'Check Status'}
          </Button>

          {allowAdminBypass && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/login'}
              className="w-full sm:w-auto gap-2 border-border/60 hover:bg-secondary/50 font-medium"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Features Protection Note */}
        <div className="pt-6 border-t border-border/40 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Data Integrity Secured</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span>Votes & Ledger Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
}
