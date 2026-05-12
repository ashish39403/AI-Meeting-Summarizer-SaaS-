import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ChevronRight, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

const packages = [
  { id: "starter", name: "Starter", price: "$5", credits: 50, pricePerCredit: "0.10", highlight: false },
  { id: "pro", name: "Pro", price: "$10", credits: 120, pricePerCredit: "0.08", highlight: true },
  { id: "enterprise", name: "Enterprise", price: "$25", credits: 350, pricePerCredit: "0.07", highlight: false },
];

export default function CreditsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handlePurchase = (pkg: typeof packages[0]) => {
    toast.info(`Stripe integration required to purchase ${pkg.credits} credits for ${pkg.price}.`);
  };

  return (
    <DashboardLayout title="Credits & Pricing">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Balance card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-bold gradient-text">{user?.credits ?? 0}</span>
                <span className="text-muted-foreground text-sm pb-2">credits remaining</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Each AI summary uses <strong className="text-foreground">1 credit</strong>
              </p>
            </div>
            {/* Radial visual */}
            <div className="hidden sm:flex h-24 w-24 shrink-0 rounded-full border-4 border-primary/20 items-center justify-center relative">
              <Zap className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-glow opacity-30" />
            </div>
          </div>
        </motion.div>

        {/* Packages */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {packages.map(({ id, name, price, credits, pricePerCredit, highlight }, i) => (
              <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-xl border p-5 relative ${highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                {highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full gradient-bg px-3 py-0.5 text-xs text-white font-medium">
                    Best Value
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold">{name}</h3>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-bold">{price}</span>
                  </div>
                  <p className="text-sm text-primary font-medium mt-1">{credits} credits</p>
                  <p className="text-xs text-muted-foreground">${pricePerCredit} per credit</p>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {["AI meeting summaries", "Action item extraction", "Sentiment analysis"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${highlight ? "gradient-bg text-white border-0" : ""}`}
                  variant={highlight ? "default" : "outline"} onClick={() => handlePurchase({ id, name, price, credits, pricePerCredit, highlight })}>
                  Buy {credits} Credits
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Secure payment via Stripe. Credits never expire.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold mb-4">How credits work</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: "1 credit = 1 summary", desc: "Each AI-generated meeting summary costs exactly 1 credit, regardless of transcript length." },
              { icon: Gift, title: "10 free credits", desc: "Every new account starts with 10 free credits. No credit card required." },
              { icon: ArrowDownLeft, title: "Credits never expire", desc: "Unused credits roll over indefinitely. Buy in bulk and save more per credit." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <p className="font-medium text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Need unlimited credits?</p>
            <p className="text-sm text-muted-foreground mt-1">Talk to us about an Enterprise plan with custom pricing.</p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => toast.info("Contact sales@meetwise.ai for Enterprise pricing.")}>
            Contact Sales <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
