import { Outlet } from "react-router-dom";
import { Vote } from "lucide-react";
import { SITE_NAME, SITE_CONFIG } from "@/lib/site-config";
import MeshGradientBackground from "@/components/MeshGradientBackground";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex relative isolate">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Mesh Gradient Background - Confined to Left Panel */}
        <MeshGradientBackground className="absolute inset-0" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{SITE_NAME}</h1>
              <p className="text-muted-foreground text-sm">{SITE_CONFIG.tagline}</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-violet-600">
              Secure. Transparent.
              <br />
              Democratic.
            </span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-md">
            {SITE_CONFIG.description}
          </p>

          {/* Features list */}
          <div className="mt-12 space-y-4">
            {['End-to-end encrypted voting', 'Real-time result tracking', 'Verified voter identity'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Vote className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{SITE_NAME}</h1>
              <p className="text-muted-foreground text-sm">{SITE_CONFIG.tagline}</p>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
