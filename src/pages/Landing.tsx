import { Link } from "react-router-dom";
import { Vote, Users, BarChart3, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME, SITE_CONFIG } from "@/lib/site-config";

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Voting",
      description: "End-to-end encrypted ballots with SHA-256 hash verification for complete transparency.",
    },
    {
      icon: Users,
      title: "Identity Verification",
      description: "Photo-based registration ensures only eligible voters can participate.",
    },
    {
      icon: BarChart3,
      title: "Real-time Results",
      description: "Watch live tallies as votes are counted and verified by administrators.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{SITE_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/results/public" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:-translate-y-0.5 font-medium inline-block">
              Results
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">Register</Button>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm" className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-primary">Sign In</Button>
            </Link>
          </nav>
          <Link to="/login" className="md:hidden">
            <Button variant="hero" size="sm" className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-primary">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent-teal/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent-teal/10 rounded-full blur-3xl opacity-50" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text */}
            <div className="text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                Secure & Transparent Elections
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Your Voice Matters.
                <br />
                <span className="text-primary">Vote with Confidence.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                {SITE_CONFIG.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    Register to Vote
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/results/public">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    View Results
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="relative animate-fade-in order-first lg:order-last">
              <div className="relative z-10 p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/hero-illustration.png"
                  alt="Secure Voting Illustration"
                  className="w-full h-auto rounded-2xl shadow-sm"
                />
              </div>
              {/* Decorative elements behind image */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-teal/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Trust & Transparency
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge security with user-friendly design to deliver
              elections you can trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border border-border/50 bg-card hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] transition-all duration-500">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-teal/10 group-hover:from-primary/20 group-hover:to-accent-teal/20 flex items-center justify-center mb-6 transition-colors duration-500">
                    <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent-teal p-12 md:p-20 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_60px_-10px_hsl(var(--primary)/0.6)] border border-white/20 transition-all duration-500 group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay" />
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent-teal/30 rounded-full blur-3xl" />

            <div className="relative text-center z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to Make Your Voice Heard?
              </h2>
              <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Join thousands of voters participating in secure, transparent elections.
                Registration takes less than 2 minutes.
              </p>
              <Link to="/register">
                <Button variant="glass" size="xl" className="bg-white text-primary hover:bg-white/90 border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 min-w-[200px] font-bold">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">{SITE_NAME}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              ©2025 {SITE_NAME}. Secure elections for modern organizations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
