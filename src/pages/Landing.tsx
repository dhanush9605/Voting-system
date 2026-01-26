import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, Shield, CheckCircle2, ArrowRight, Smartphone, Lock, Globe, Database, Server, Cpu, Fingerprint, Code, HelpCircle, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE_NAME } from "@/lib/site-config";
import MeshGradientBackground from "@/components/MeshGradientBackground";
import IntroAnimation from "@/components/IntroAnimation";
import { useState, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

// Module-level variable to track intro state across navigation
let hasSeenIntro = false;

const Landing = () => {
  const [showIntro, setShowIntro] = useState(() => {
    if (hasSeenIntro) return false;

    // Check for back/forward navigation explicitly
    try {
      const navEntries = window.performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        if (navEntry.type === 'back_forward') {
          hasSeenIntro = true;
          return false;
        }
      }
    } catch (e) {
      // Ignore
    }

    return true;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    hasSeenIntro = true;
  };

  const { scrollY } = useScroll();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest < 50) {
      setHeaderVisible(true);
    } else if (latest > lastScrollY && latest > 100) {
      setHeaderVisible(false);
    } else if (latest < lastScrollY) {
      setHeaderVisible(true);
    }
    setLastScrollY(latest);
  });

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {!showIntro && (
        <div className="min-h-screen text-foreground font-sans selection:bg-primary/10 relative overflow-hidden animate-fade-in">
          {/* Premium UI: Mesh Gradient Background - Fixed Full Page */}
          <MeshGradientBackground />

          {/* Navigation - Transparent */}
          <header
            className={cn(
              "fixed top-0 w-full z-50 bg-background/0 backdrop-blur-none border-none transition-all duration-500 ease-in-out",
              !headerVisible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-foreground group-hover:opacity-80 transition-opacity">{SITE_NAME}</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground px-2 sm:px-4">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="font-semibold px-4 sm:px-6 bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all">Get Started</Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </header>

          <main className="bg-grain relative isolate">


            {/* Hero Section - Swiss Style Centered */}
            <section
              className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-6 text-center overflow-hidden"
            >
              <div className="container max-w-4xl mx-auto relative z-10">
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.2 }
                    }
                  }}
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-secondary-foreground text-xs font-medium mb-6 md:mb-8 hover:bg-secondary/80 transition-colors cursor-default"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Secure Election Protocol v2.0
                  </motion.div>

                  <h1 className="font-space text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.9] sm:leading-[0.95] md:leading-[1] mb-6 md:mb-12 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center"
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Elections.</span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Evolved.</span>
                    </motion.div>
                  </h1>

                  <motion.p
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed px-4"
                  >
                    Step out of the dark ages. Experience the speed and security of digital democracy.
                  </motion.p>

                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
                  >
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button size="xl" className="h-14 px-8 text-lg w-full shadow-lg hover-magnetic bg-foreground text-background hover:bg-foreground/90 transition-all duration-300">
                        Register to Vote <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/results/public" className="w-full sm:w-auto">
                      <Button variant="secondary" size="xl" className="h-14 px-8 text-lg w-full hover-magnetic transition-all duration-300">
                        View Live Results
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {/* Subtle background gradient splash */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-3xl -z-10 opacity-60" />
            </section>

            {/* What is VØRA Section */}
            <section className="relative py-24 md:py-32 bg-gradient-to-br from-blue-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-violet-950">
              <div className="container mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="max-w-4xl mx-auto text-center"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                    What is VØRA?
                  </h2>

                  <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
                    VØRA isn't just a name—it's a promise encoded in every letter.
                  </p>

                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-blue-700">
                        V
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Vote · Voice</h3>
                      <p className="text-sm text-muted-foreground">
                        Your democratic power to choose and be heard.
                      </p>
                    </motion.div>

                    <motion.div
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:border-violet-500/50 transition-all duration-300"
                    >
                      <div className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-violet-600 to-violet-700">
                        Ø
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Zero Tampering</h3>
                      <p className="text-sm text-muted-foreground">
                        No manipulation. No fraud. No compromise.
                      </p>
                    </motion.div>

                    <motion.div
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-purple-700">
                        RA
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Authority · Power</h3>
                      <p className="text-sm text-muted-foreground">
                        Legitimate governance through transparent consensus.
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="max-w-3xl mx-auto"
                  >
                    <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/80">
                      Built on blockchain technology, VØRA delivers absolute transparency and trust.
                      Every vote is cryptographically secured, immutably recorded, and independently verifiable—
                      eliminating doubt and restoring faith in the democratic process.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </section>



            {/* Feature Grid - Bento Box Style */}
            <section className="py-20 md:py-32 px-4 md:px-6">
              <div className="container max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-12 md:mb-20 text-center md:text-left"
                >
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6">Designed for <br className="hidden md:block" />Absolute Trust.</h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0">
                    We stripped away the complexity and rebuilt the voting process on four pillars of security and transparency.
                  </p>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
                >
                  {/* Feature 1 - Large */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                    }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                      borderColor: "rgba(59, 130, 246, 0.4)"
                    }}
                    className="md:col-span-2 bg-secondary/30 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 hover:bg-secondary/50 hover:shadow-lg group border border-transparent"
                  >
                    <div className="h-14 w-14 md:h-16 md:w-16 bg-background rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Shield className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Cryptographic Verification</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
                      Every vote is hashed, signed, and immutable. Verification isn't just a promise—it's mathematically proven.
                    </p>
                  </motion.div>

                  {/* Feature 2 - Tall */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      show: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
                    }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 0 40px rgba(255, 255, 255, 0.15)",
                    }}
                    className="md:row-span-2 bg-primary text-primary-foreground rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 flex flex-col justify-between shadow-xl hover:shadow-2xl"
                  >
                    <div>
                      <div className="h-14 w-14 md:h-16 md:w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8 backdrop-blur-sm">
                        <Smartphone className="w-7 h-7 md:w-8 md:h-8" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mobile First</h3>
                      <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed">
                        Vote from anywhere, on any device. The interface adapts perfectly to your life.
                      </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl md:text-4xl font-bold">100%</span>
                        <span className="text-xs md:text-sm opacity-70">Verified<br />on-chain</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Feature 3 */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 25px rgba(249, 115, 22, 0.2)",
                      borderColor: "rgba(249, 115, 22, 0.4)"
                    }}
                    className="bg-secondary/30 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:bg-secondary/50 hover:shadow-lg group border border-transparent"
                  >
                    <div className="h-12 w-12 bg-background/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6 md:w-8 md:h-8 mb-0" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Identity Lock</h3>
                    <p className="text-muted-foreground text-sm md:text-base">Biometric matching ensures one person, one vote.</p>
                  </motion.div>

                  {/* Feature 4 */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 25px rgba(16, 185, 129, 0.2)",
                      borderColor: "rgba(16, 185, 129, 0.4)"
                    }}
                    className="bg-secondary/30 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:bg-secondary/50 hover:shadow-lg group border border-transparent"
                  >
                    <div className="h-12 w-12 bg-background/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 md:w-8 md:h-8 mb-0" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Global Scale</h3>
                    <p className="text-muted-foreground text-sm md:text-base">Built to handle millions of concurrent voters.</p>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Tech Stack / Under the Hood */}
            <section className="py-20 md:py-32 px-4 md:px-6 bg-secondary/10">
              <div className="container max-w-5xl mx-auto text-center md:text-left">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      <Code className="w-4 h-4" />
                      <span>Open Source Infrastructure</span>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-3xl md:text-5xl font-bold tracking-tight"
                    >
                      Built on the <br />Modern Web.
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-lg text-muted-foreground leading-relaxed"
                    >
                      We leverage the most advanced technologies to ensure speed, security, and immutability. No black boxes—just clean, verifiable code.
                    </motion.p>

                    <motion.div
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: { staggerChildren: 0.15 }
                        }
                      }}
                      className="grid grid-cols-2 gap-4 mt-8"
                    >
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-background p-4 rounded-xl border border-border/40 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Database className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">MongoDB</div>
                          <div className="text-xs text-muted-foreground">Scalable Data</div>
                        </div>
                      </motion.div>
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-background p-4 rounded-xl border border-border/40 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                          <Server className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">Node.js</div>
                          <div className="text-xs text-muted-foreground">High Performance</div>
                        </div>
                      </motion.div>
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-background p-4 rounded-xl border border-border/40 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">React</div>
                          <div className="text-xs text-muted-foreground">Dynamic UI</div>
                        </div>
                      </motion.div>
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-background p-4 rounded-xl border border-border/40 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Fingerprint className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">FaceAPI</div>
                          <div className="text-xs text-muted-foreground">Biometric Auth</div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Abstract Visual Representation */}
                  <div className="flex-1 relative h-[300px] md:h-[400px] w-full flex items-center justify-center bg-transparent">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl rounded-full opacity-50"></div>
                    <motion.div
                      animate={{
                        y: [0, -15, 0],
                        rotate: [1, -1, 1]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative z-10 grid grid-cols-2 gap-6 p-8 border border-border/40 rounded-3xl bg-background/50 backdrop-blur-xl shadow-2xl"
                    >
                      <div className="w-24 h-24 bg-background rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <span className="text-xs font-bold">Verified</span>
                      </div>
                      <div className="w-24 h-24 bg-background rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                        <Lock className="w-8 h-8 text-primary" />
                        <span className="text-xs font-bold">Secured</span>
                      </div>
                      <div className="w-24 h-24 bg-background rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                        <Globe className="w-8 h-8 text-blue-500" />
                        <span className="text-xs font-bold">Distributed</span>
                      </div>
                      <div className="w-24 h-24 bg-background rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                        <Shield className="w-8 h-8 text-orange-500" />
                        <span className="text-xs font-bold">Immutable</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works - Horizontal Cards */}
            <section className="py-24 md:py-32 px-6 bg-secondary/20 border-y border-border/40">
              <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-16 md:mb-24">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Simple & Secure</h2>
                  <h3 className="text-3xl md:text-5xl font-bold">How Voting Works</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Connector Line (Desktop) */}
                  <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                  {/* Step 1 */}
                  <div className="group relative">
                    <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-secondary/50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative z-10">
                      <Fingerprint className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center px-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-bold mb-4">STEP 01</div>
                      <h4 className="text-xl font-bold mb-3">Register & Verify</h4>
                      <p className="text-muted-foreground">Create secure account with biometric verification. We ensure eligibility in seconds.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="group relative">
                    <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-secondary/50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative z-10">
                      <Vote className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center px-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-bold mb-4">STEP 02</div>
                      <h4 className="text-xl font-bold mb-3">Cast Your Ballot</h4>
                      <p className="text-muted-foreground">Select your candidates. Your vote is instantly encrypted and signed on your device.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="group relative">
                    <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-secondary/50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative z-10">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center px-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-bold mb-4">STEP 03</div>
                      <h4 className="text-xl font-bold mb-3">Verify & Watch</h4>
                      <p className="text-muted-foreground">Receive a tracking hash. Watch live results update on the blockchain in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section with Accordion */}
            <section className="py-20 md:py-32 px-6">
              <div className="container max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-4">
                    <HelpCircle className="w-4 h-4" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Common Questions</h2>
                  <p className="text-muted-foreground text-lg">Everything you need to know about the platform.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg">How do I register to vote?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Registration is simple. Click the "Register" button, allow camera access for biometric verification, and fill in your details. Our system instantly verifies your eligibility against government records.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg">Is my vote anonymous?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Yes. While we verify your identity to ensure eligibility, your actual vote is encrypted and decoupled from your identity before it hits the blockchain. No one—not even the admins—can trace a vote back to you.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg">Can I vote from my mobile phone?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Absolutely. Our platform is mobile-first, meaning it's designed to work perfectly on any smartphone with a camera and internet connection. No app download required.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-lg">What happens if the internet goes down?</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      Votes are cached securely on your device until a connection is re-established. Our distributed node network ensures that the voting system itself remains online even if individual servers fail.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 text-center">
              <div className="container max-w-3xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-6xl font-bold tracking-tight mb-8"
                >
                  Ready to shape the future?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground mb-12"
                >
                  Join the next generation of digital democracy today.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Link to="/register">
                    <Button size="xl" className="h-16 px-10 text-xl shadow-2xl hover:scale-105 transition-transform">
                      Start Voting Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="relative z-10 py-12">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M16.5 3H20.5L12 21L3.5 3H7.5L12 13.5L16.5 3Z" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-bold text-lg">{SITE_NAME}</span>
              </div>


              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>&copy; 2025 {SITE_NAME}</span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium">System Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </div >
      )}
    </>
  );
};

export default Landing;
