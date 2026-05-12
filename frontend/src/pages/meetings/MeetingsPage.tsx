import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, LayoutGrid, List, Plus, FileText, ChevronLeft, ChevronRight, Filter, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { meetingService } from "@/services/meetingService";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { MeetingCardSkeleton, TableRowSkeleton } from "@/components/LoadingSkeleton";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import type { MeetingFilters } from "@/types";

type ViewMode = "grid" | "table";

export default function MeetingsPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<MeetingFilters>({ page: 1 });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => meetingService.list(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: meetingService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    },
    onError: () => toast.error("Failed to delete meeting"),
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters(f => ({ ...f, search: e.target.value, page: 1 }));
  };

  const meetings = data?.results ?? [];
  const total = data?.count ?? 0;
  const page = filters.page ?? 1;
  const totalPages = Math.ceil(total / 12);

  return (
    <DashboardLayout title="Meetings">
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search meetings..." className="pl-9" value={search} onChange={handleSearch} />
          </div>
          <Select onValueChange={(v) => setFilters(f => ({ ...f, status: v === "all" ? undefined : v, page: 1 }))}>
            <SelectTrigger className="w-40">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("grid")}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("table")}>
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button className="gradient-bg text-white border-0 shrink-0" onClick={() => navigate("/meetings/new")}>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>

        {!isLoading && <p className="text-xs text-muted-foreground">{total} meeting{total !== 1 ? "s" : ""}</p>}

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <MeetingCardSkeleton key={i} />) :
            meetings.length > 0 ? meetings.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="rounded-xl border border-border bg-card p-5 hover:bg-secondary/40 transition-colors h-full group relative">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <button onClick={() => navigate(`/meetings/${m.id}`)} className="font-medium leading-snug line-clamp-2 text-left hover:text-primary transition-colors flex-1">
                      {m.title}
                    </button>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </p>
                  {m.word_count > 0 && <p className="text-xs text-muted-foreground mt-1">{m.word_count} words</p>}
                  {m.duration_minutes && <p className="text-xs text-muted-foreground">{m.duration_minutes} min</p>}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/meetings/${m.id}`)}>View</DropdownMenuItem>
                        <DeleteConfirmModal
                          title="Delete meeting?"
                          description="This will permanently delete this meeting and its summary."
                          onConfirm={() => deleteMutation.mutate(m.id)}
                          isLoading={deleteMutation.isPending}
                        >
                          <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DeleteConfirmModal>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium mb-1">No meetings found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or create a new summary.</p>
                <Button size="sm" className="gradient-bg text-white border-0" onClick={() => navigate("/meetings/new")}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New Summary
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {view === "table" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Words</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                meetings.length > 0 ? meetings.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{m.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{m.word_count || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{format(new Date(m.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/meetings/${m.id}`)}>View</Button>
                        <DeleteConfirmModal onConfirm={() => deleteMutation.mutate(m.id)} isLoading={deleteMutation.isPending} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No meetings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFilters(f => ({ ...f, page: Math.max(1, page - 1) }))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, page + 1) }))} disabled={page >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
