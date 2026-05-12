import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, FileText, CheckSquare, BarChart2, ArrowRight, Star, Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TypingAnimation } from "@/components/TypingAnimation";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Zap, title: "Instant AI Processing", desc: "Transform hours of meeting recordings into crisp summaries in under 10 seconds." },
  { icon: FileText, title: "Smart Summaries", desc: "Get structured output: decisions, action items, and takeaways — all organized." },
  { icon: CheckSquare, title: "Action Item Extraction", desc: "Every commitment captured and attributed automatically — never miss a task." },
  { icon: BarChart2, title: "Meeting Analytics", desc: "Track patterns across meetings: sentiment, topics, and engagement over time." },
];

const pricing = [
  { name: "Free", price: "$0", credits: "10 summaries/mo", features: ["10 AI summaries/month", "Action item extraction", "Email export", "7-day history"], cta: "Get Started Free", highlight: false },
  { name: "Pro", price: "$9.99", credits: "100 summaries/mo", features: ["100 AI summaries/month", "Everything in Free", "PDF export", "Unlimited history", "Priority support"], cta: "Start Pro Trial", highlight: true },
  { name: "Enterprise", price: "Custom", credits: "Unlimited", features: ["Unlimited summaries", "Everything in Pro", "SSO / SAML", "Dedicated support", "SLA guarantee"], cta: "Contact Sales", highlight: false },
];

const testimonials = [
  { name: "Sarah Chen", role: "Product Lead, Vercel", text: "MeetWise cut our post-meeting admin time by 80%. Our team ships faster.", init: "SC" },
  { name: "Marcus Rivera", role: "Engineering Manager, Stripe", text: "I used to dread long standups. Now I get a clean action list before I leave the call.", init: "MR" },
  { name: "Priya Nair", role: "Founder, Luma AI", text: "The sentiment analysis is surprisingly accurate. We can see which meetings drain the team.", init: "PN" },
];

const DEMO_SUMMARY = `**Q4 Planning Summary**

Key decisions made during this sync:
• Analytics dashboard: November 15th launch
• Beta limited to 50 users for feedback management

**Action Items**
✓ Marcus: Approve chart components by Friday EOD
✓ Engineering: Fix data pipeline by October 25th
✓ Design: Final QA pass on mobile views

**Sentiment**: Positive — team aligned on priorities`;

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDemoStarted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Floating gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">MeetWise</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="gradient-bg text-white border-0 hidden md:inline-flex" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 space-y-2 bg-background">
            <Link to="/login"><p className="py-2 text-sm text-muted-foreground">Sign in</p></Link>
            <Button size="sm" className="w-full gradient-bg text-white border-0" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary font-medium mb-8">
            <Zap className="h-3 w-3" /> AI-powered meeting intelligence
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="gradient-text">Turn Your Meetings</span>
            <br />
            <span>into Actionable Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AI-powered meeting summaries, action items, and decisions in seconds. Stop taking notes. Start shipping.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gradient-bg text-white border-0 h-12 px-8 text-base" asChild>
              <Link to="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <a href="#demo">Watch Demo</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required. 10 free summaries/month.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[["10k+", "Teams using MeetWise"], ["2M+", "Summaries generated"], ["< 10s", "Processing time"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{num}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">See it in action</h2>
            <p className="text-muted-foreground">Paste a transcript. Get a structured summary instantly.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">transcript.txt</span>
              </div>
              <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono text-left">
{`Alex: Let's kick off Q4 planning.

Marcus: Analytics dashboard is on track 
for Nov 15. AI feature delayed 2 weeks.

Sarah: Design mockups complete. Need 
sign-off by Friday EOD.

Alex: Decision — beta to 50 users on 
Nov 15. Engineering fixes pipeline by 
Oct 25.`}
              </pre>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-primary/30 bg-card p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 pointer-events-none" />
              <div className="flex items-center gap-2 mb-4 relative">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">AI Summary</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap relative">
                {demoStarted ? <TypingAnimation text={DEMO_SUMMARY} speed={12} /> : <span className="opacity-30">Waiting...</span>}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything your team needs</h2>
          <p className="text-muted-foreground">Powerful features that make meetings actually useful.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border bg-card p-6 group cursor-default">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:gradient-bg group-hover:text-white transition-all">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. Scale when you need to.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, credits, features: feats, cta, highlight }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border p-6 relative ${highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-bg px-3 py-0.5 text-xs text-white font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-lg">{name}</h3>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-3xl font-bold">{price}</span>
                    {price !== "Custom" && <span className="text-muted-foreground text-sm mb-1">/month</span>}
                  </div>
                  <p className="text-xs text-primary font-medium mt-1">{credits}</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {feats.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${highlight ? "gradient-bg text-white border-0" : ""}`}
                  variant={highlight ? "default" : "outline"} asChild>
                  <Link to="/register">{cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Loved by productive teams</h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
            <span className="text-sm text-muted-foreground ml-2">4.9/5 across 800+ reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, init }, i) => (
            <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">{init}</div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-2xl gradient-bg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to reclaim your time?</h2>
          <p className="text-white/80 mb-8">Join 10,000+ teams who ship faster with MeetWise.</p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-0 h-12 px-8 font-medium" asChild>
            <Link to="/register">Start for Free — No Card Needed</Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-bold gradient-text text-base">MeetWise</span>
          <p>© {new Date().getFullYear()} MeetWise. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
