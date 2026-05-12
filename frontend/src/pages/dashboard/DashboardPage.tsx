import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, CheckCircle, CreditCard, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { meetingService } from "@/services/meetingService";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCardSkeleton, MeetingCardSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

function StatCard({ label, value, icon: Icon, desc, delay = 0 }: {
  label: string; value: number | string; icon: React.ElementType; desc?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["meeting-statistics"],
    queryFn: meetingService.getStatistics,
  });

  const { data: recentData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["meetings", { page: 1 }],
    queryFn: () => meetingService.list({ page: 1 }),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Good {greeting()}, {user?.first_name ?? "there"}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening with your meetings.</p>
          </div>
          <Button className="gradient-bg text-white border-0 shrink-0" onClick={() => navigate("/meetings/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Meeting Summary
          </Button>
        </motion.div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Meetings" value={stats?.total_meetings ?? 0} icon={FileText} delay={0} />
            <StatCard label="Completed" value={stats?.completed_meetings ?? 0} icon={CheckCircle} desc="With summaries" delay={0.05} />
            <StatCard label="Credits Used" value={stats?.credits_used ?? 0} icon={TrendingUp} delay={0.1} />
            <StatCard label="Credits Left" value={user?.credits ?? 0} icon={CreditCard} desc="This period" delay={0.15} />
          </div>
        )}

        {/* Credit bar */}
        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Credit Usage</p>
              <button onClick={() => navigate("/credits")} className="text-xs text-primary hover:underline">Buy more</button>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((stats.credits_used / Math.max(stats.credits_used + (user?.credits ?? 0), 1)) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full gradient-bg"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{stats.credits_used} used</span>
              <span>{user?.credits ?? 0} remaining</span>
            </div>
          </motion.div>
        )}

        {/* Recent meetings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent Meetings</h3>
            <button onClick={() => navigate("/meetings")}
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {meetingsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)}</div>
          ) : recentData?.results && recentData.results.length > 0 ? (
            <div className="space-y-3">
              {recentData.results.slice(0, 5).map((meeting, i) => (
                <motion.div key={meeting.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <button onClick={() => navigate(`/meetings/${meeting.id}`)} className="w-full text-left">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })}
                          {meeting.word_count > 0 && ` · ${meeting.word_count} words`}
                        </p>
                      </div>
                      <StatusBadge status={meeting.status} />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">No meetings yet</p>
              <p className="text-xs text-muted-foreground mb-4">Create your first AI-powered meeting summary.</p>
              <Button size="sm" className="gradient-bg text-white border-0" onClick={() => navigate("/meetings/new")}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Summary
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
