import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Copy, Download, RefreshCw, ChevronDown, CheckSquare,
  Square, Zap, Clock, Users, TrendingUp, Share2
} from "lucide-react";
import { toast } from "sonner";
import { meetingService } from "@/services/meetingService";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { SummaryDetailSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-5 py-4 font-semibold text-left hover:bg-secondary/30 transition-colors">
        {title}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionItemList({ items }: { items: Array<{ task: string; owner: string }> }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setChecked(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 cursor-pointer group" onClick={() => toggle(i)}>
          {checked.has(i) ? (
            <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
          )}
          <div className={`text-sm ${checked.has(i) ? "line-through text-muted-foreground" : ""}`}>
            <span>{item.task}</span>
            {item.owner && <span className="ml-2 text-xs text-primary font-medium">@{item.owner}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400";
  const bg = pct >= 70 ? "bg-green-400" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";
  const label = pct >= 70 ? "Positive 😊" : pct >= 40 ? "Neutral 😐" : "Negative 😔";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: meeting, isLoading: meetingLoading } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => meetingService.get(meetingId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status === "processing" || status === "pending" ? 3000 : false;
    },
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["meeting-summary", meetingId],
    queryFn: () => meetingService.getSummary(meetingId),
    enabled: meeting?.status === "completed",
  });

  const generateMutation = useMutation({
    mutationFn: () => meetingService.generateSummary(meetingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meeting", meetingId] });
      toast.success("Regeneration started — 1 credit used");
    },
    onError: () => toast.error("Failed to generate summary"),
  });

  const isLoading = meetingLoading || summaryLoading;

  const copy = () => {
    if (!summary) return;
    const text = [
      summary.content,
      `\nKey Points:\n${summary.key_points?.map(p => `• ${p}`).join("\n")}`,
      `\nAction Items:\n${summary.action_items?.map(a => `• ${a.task} (@${a.owner})`).join("\n")}`,
      `\nDecisions:\n${summary.decisions?.map(d => `• ${d}`).join("\n")}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <button onClick={() => navigate("/meetings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to meetings
        </button>

        {isLoading ? <SummaryDetailSkeleton /> : meeting ? (
          <>
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-tight mb-2">{meeting.title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={meeting.status} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(meeting.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    {meeting.duration_minutes && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {meeting.duration_minutes} min
                      </span>
                    )}
                    {meeting.word_count > 0 && (
                      <span className="text-xs text-muted-foreground">{meeting.word_count} words</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            {summary && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {summary.total_tokens} tokens</span>
                  <span className="text-xs text-primary font-medium">{summary.model_used}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copy}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
                    <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${generateMutation.isPending ? "animate-spin" : ""}`} /> Regenerate
                  </Button>
                </div>
              </div>
            )}

            {/* Status panels */}
            {meeting.status === "pending" && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-center">
                <p className="text-sm text-yellow-400 mb-3">Summary not yet generated.</p>
                <Button className="gradient-bg text-white border-0" size="sm"
                  onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  <Zap className="mr-1.5 h-3.5 w-3.5" /> Generate Summary — 1 Credit
                </Button>
              </div>
            )}
            {meeting.status === "processing" && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 text-center">
                <div className="h-6 w-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-sm text-blue-400">AI is generating your summary...</p>
              </div>
            )}
            {meeting.status === "failed" && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                <p className="text-sm text-red-400 mb-3">{meeting.error_message || "Summary generation failed."}</p>
                <Button size="sm" variant="outline" onClick={() => generateMutation.mutate()}>Retry — 1 Credit</Button>
              </div>
            )}

            {/* Summary sections */}
            {summary && (
              <div className="space-y-3">
                <Section title="Summary" defaultOpen>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary.content}</p>
                  {summary.short_summary && (
                    <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">TL;DR</p>
                      <p className="text-sm">{summary.short_summary}</p>
                    </div>
                  )}
                </Section>

                {summary.sentiment_score !== undefined && (
                  <Section title="Sentiment Analysis" defaultOpen>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Meeting Sentiment</p>
                        <SentimentBar score={summary.sentiment_score} />
                      </div>
                      {summary.confidence_score !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Confidence</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full gradient-bg" style={{ width: `${Math.round(summary.confidence_score * 100)}%` }} />
                            </div>
                            <span className="text-sm font-medium">{Math.round(summary.confidence_score * 100)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {summary.key_points?.length > 0 && (
                  <Section title="Key Points" defaultOpen>
                    <ul className="space-y-1.5">
                      {summary.key_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />{point}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {summary.action_items?.length > 0 && (
                  <Section title="Action Items" defaultOpen>
                    <ActionItemList items={summary.action_items} />
                  </Section>
                )}

                {summary.decisions?.length > 0 && (
                  <Section title="Decisions" defaultOpen={false}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {summary.decisions.map((d, i) => (
                        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">{d}</div>
                      ))}
                    </div>
                  </Section>
                )}

                {summary.attendees?.length > 0 && (
                  <Section title="Attendees" defaultOpen={false}>
                    <div className="flex flex-wrap gap-2">
                      {summary.attendees.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
                          <Users className="h-3 w-3 text-primary" />{a}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Token usage */}
                <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-6 text-xs text-muted-foreground">
                  <span><span className="font-medium text-foreground">{summary.prompt_tokens}</span> prompt tokens</span>
                  <span><span className="font-medium text-foreground">{summary.completion_tokens}</span> completion tokens</span>
                  <span><span className="font-medium text-foreground">{summary.total_tokens}</span> total tokens</span>
                  <span>Model: <span className="font-medium text-primary">{summary.model_used}</span></span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">Meeting not found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
