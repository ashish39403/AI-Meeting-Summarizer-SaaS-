import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),

    last_name: z.string().min(1, "Last name is required"),

    email: z.string().email("Enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    password2: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

type FormValues = z.infer<typeof schema>;

function pwStrength(pw: string) {
  let score = 0;

  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  return score;
}

const strengthColors = [
  "",
  "bg-red-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
];

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const password = watch("password") || "";
  const strength = pwStrength(password);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const response = await authService.register(values);

      login(
        response.user,
        response.access,
        response.refresh
      );

      toast.success(
        "Account created successfully! You received 10 free credits."
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.detail ||
        "Registration failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold gradient-text"
        >
          MeetWise
        </Link>

        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">
                Create your account
              </h1>

              <p className="text-muted-foreground text-sm">
                Start summarizing meetings with AI
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">
                    First Name
                  </Label>

                  <Input
                    id="first_name"
                    placeholder="John"
                    className="mt-1"
                    {...register("first_name")}
                  />

                  {errors.first_name && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">
                    Last Name
                  </Label>

                  <Input
                    id="last_name"
                    placeholder="Doe"
                    className="mt-1"
                    {...register("last_name")}
                  />

                  {errors.last_name && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">
                  Password
                </Label>

                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter password"
                    className="pr-10"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPw(!showPw)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all",
                            i <= strength
                              ? strengthColors[strength]
                              : "bg-muted"
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password2">
                  Confirm Password
                </Label>

                <div className="relative mt-1">
                  <Input
                    id="password2"
                    type={
                      showConfirmPw
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm password"
                    className="pr-10"
                    {...register("password2")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPw(!showConfirmPw)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password2 && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password2.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 gradient-bg text-white border-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}