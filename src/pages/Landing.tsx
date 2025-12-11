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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{SITE_NAME}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/results/public" className="text-muted-foreground hover:text-foreground transition-colors">
              Results
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm">Register</Button>
            </Link>
            <Link to="/login">
              <Button variant="hero" size="sm">Sign In</Button>
            </Link>
          </nav>
          <Link to="/login" className="md:hidden">
            <Button variant="hero" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent-teal/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent-teal/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8">
              <CheckCircle className="w-4 h-4" />
              Secure & Transparent Elections
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Voice Matters.
              <br />
              <span className="text-primary">Vote with Confidence.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {SITE_CONFIG.description}
            </p>
            
            {/* Centered Register to Vote button */}
            <div className="flex justify-center">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Register to Vote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
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
              <Card key={index} className="border-0 shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-primary p-12 md:p-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent-teal opacity-90" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
            
            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Make Your Voice Heard?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands of voters participating in secure, transparent elections.
                Registration takes less than 2 minutes.
              </p>
              <Link to="/register">
                <Button variant="glass" size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
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
              © 2024 {SITE_NAME}. Secure elections for modern organizations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
