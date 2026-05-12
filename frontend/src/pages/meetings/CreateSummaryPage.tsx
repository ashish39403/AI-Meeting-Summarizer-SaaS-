import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, X, FileText, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { meetingService } from "@/services/meetingService";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  transcript: z.string().min(10, "Transcript must be at least 10 characters").max(50000, "Transcript too long"),
  duration_minutes: z.coerce.number().int().positive().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function CreateSummaryPage() {
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, updateCredits } = useAuthStore();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const transcript = watch("transcript") || "";

  const createMutation = useMutation({
    mutationFn: meetingService.create,
  });

  const onSubmit = async (values: FormValues) => {
    if ((user?.credits ?? 0) <= 0) {
      toast.error("You have no credits left. Please purchase more.");
      return;
    }

    setIsGenerating(true);
    setProgress(20);

    try {
      const meeting = await createMutation.mutateAsync({
        title: values.title,
        transcript: values.transcript,
        duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : undefined,
      });

      setProgress(50);
      await meetingService.generateSummary(meeting.id);
      setProgress(90);

      updateCredits((user?.credits ?? 1) - 1);
      qc.invalidateQueries({ queryKey: ["meetings"] });
      qc.invalidateQueries({ queryKey: ["meeting-statistics"] });

      setProgress(100);
      toast.success("Summary generated successfully!");
      setTimeout(() => navigate(`/meetings/${meeting.id}`), 500);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 402) {
        toast.error("Insufficient credits. Please purchase more.");
      } else {
        toast.error("Failed to create summary. Please try again.");
      }
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".txt")) {
      setDroppedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setValue("transcript", ev.target?.result as string);
      reader.readAsText(file);
    } else if (file) {
      setDroppedFile(file);
      toast.info("Only .txt files are auto-parsed. Paste your transcript above.");
    }
  }, [setValue]);

  const noCredits = (user?.credits ?? 0) <= 0;

  return (
    <DashboardLayout title="New Meeting Summary">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {isGenerating ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/30 bg-card p-10 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-2">AI is generating your summary</h2>
            <p className="text-sm text-muted-foreground mb-6">Usually takes 5–15 seconds...</p>
            <Progress value={progress} className="mb-3" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Credit info */}
            <div className={`flex items-center gap-3 rounded-xl border px-5 py-3 ${noCredits ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
              <Zap className={`h-4 w-4 shrink-0 ${noCredits ? "text-destructive" : "text-primary"}`} />
              {noCredits ? (
                <p className="text-sm text-destructive">You have no credits left.{" "}
                  <button type="button" onClick={() => navigate("/credits")} className="underline font-medium">Buy more</button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This summary will use <strong className="text-foreground">1 credit</strong>.{" "}
                  <span className="text-primary font-medium">{user?.credits} remaining</span>
                </p>
              )}
              <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3.5 w-3.5" /> ~5–15s
              </div>
            </div>

            {/* Title & Duration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input id="title" placeholder="Q4 Planning Sync" className="mt-1" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="duration">Duration <span className="text-muted-foreground">(minutes, optional)</span></Label>
                <Input id="duration" type="number" placeholder="60" min={1} className="mt-1" {...register("duration_minutes")} />
              </div>
            </div>

            {/* Transcript */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="transcript">Meeting Transcript</Label>
                <span className="text-xs text-muted-foreground">{transcript.length.toLocaleString()} / 50,000 chars</span>
              </div>
              <Textarea
                id="transcript"
                placeholder="Paste your meeting transcript here. Speaker labels like 'Alex: ...' help the AI produce better results."
                className="min-h-48 font-mono text-sm leading-relaxed resize-y"
                {...register("transcript")}
              />
              {errors.transcript && <p className="text-xs text-destructive mt-1">{errors.transcript.message}</p>}
            </div>

            {/* File upload */}
            <div>
              <Label className="mb-2 block">Or upload a .txt file</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"}`}
              >
                <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setDroppedFile(f); toast.info("File selected. For .txt files, content is auto-loaded."); }
                  }} />
                <AnimatePresence mode="wait">
                  {droppedFile ? (
                    <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{droppedFile.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setDroppedFile(null); }}
                        className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Drop a file here or click to browse</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">.txt, .pdf, .docx</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full gradient-bg text-white border-0 h-12 text-base font-medium"
              disabled={createMutation.isPending || noCredits}>
              {createMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Zap className="mr-2 h-4 w-4" /> Generate Summary — 1 Credit</>
              )}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
