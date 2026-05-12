import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Status = "pending" | "processing" | "completed" | "failed";

const config: Record<Status, { label: string; dot: string; badge: string }> = {
  pending:    { label: "Pending",    dot: "bg-yellow-400", badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  processing: { label: "Processing", dot: "bg-blue-400 animate-pulse", badge: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  completed:  { label: "Completed",  dot: "bg-green-400", badge: "bg-green-400/10 text-green-400 border-green-400/20" },
  failed:     { label: "Failed",     dot: "bg-red-400", badge: "bg-red-400/10 text-red-400 border-red-400/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = (config[status as Status] ?? config.pending);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shrink-0", s.badge)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </motion.span>
  );
}
