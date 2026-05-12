import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, User, Lock, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  old_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "At least 8 characters"),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });
type PasswordValues = z.infer<typeof passwordSchema>;

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [summaryNotif, setSummaryNotif] = useState(true);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "MW";

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", email: user?.email ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: "", new_password: "", confirm: "" },
  });

  const profileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => { setUser(data); toast.success("Profile updated"); },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => { toast.success("Password changed successfully"); passwordForm.reset(); },
    onError: () => toast.error("Failed to change password. Check your current password."),
  });

  return (
    <DashboardLayout title="Settings">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6">
          <SectionHeader icon={User} title="Profile" />
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary font-medium mt-0.5">{user?.credits} credits remaining</p>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit((v) => profileMutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input className="mt-1" {...profileForm.register("first_name")} />
                {profileForm.formState.errors.first_name && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label>Last name</Label>
                <Input className="mt-1" {...profileForm.register("last_name")} />
              </div>
            </div>
            <div>
              <Label>Email address</Label>
              <Input type="email" className="mt-1" {...profileForm.register("email")} />
              {profileForm.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="gradient-bg text-white border-0" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </form>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-6">
          <SectionHeader icon={Lock} title="Change Password" />
          <form onSubmit={passwordForm.handleSubmit((v) => passwordMutation.mutate({ old_password: v.old_password, new_password: v.new_password }))}
            className="space-y-4">
            <div>
              <Label>Current password</Label>
              <div className="relative mt-1">
                <Input type={showOld ? "text" : "password"} className="pr-10" {...passwordForm.register("old_password")} />
                <button type="button" onClick={() => setShowOld(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.old_password && (
                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.old_password.message}</p>
              )}
            </div>
            <div>
              <Label>New password</Label>
              <div className="relative mt-1">
                <Input type={showNew ? "text" : "password"} className="pr-10" {...passwordForm.register("new_password")} />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.new_password && (
                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.new_password.message}</p>
              )}
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input type="password" className="mt-1" {...passwordForm.register("confirm")} />
              {passwordForm.formState.errors.confirm && (
                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirm.message}</p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
            </Button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6">
          <SectionHeader icon={Bell} title="Notifications" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive updates about your summaries via email</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Summary ready alerts</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified when your AI summary is complete</p>
              </div>
              <Switch checked={summaryNotif} onCheckedChange={setSummaryNotif} />
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("Preferences saved")}>
              Save preferences
            </Button>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated meetings and summaries.
          </p>
          <DeleteConfirmModal
            title="Delete account permanently?"
            description="This will delete your account, all meetings, summaries, and credits. This cannot be undone."
            onConfirm={() => toast.error("Account deletion is disabled in this demo.")}
          >
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete account
            </Button>
          </DeleteConfirmModal>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
