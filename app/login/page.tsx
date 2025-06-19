"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AppLogo from "@/components/Logo";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message from signup
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Get the session to determine where to redirect
        const session = await getSession();
        if (session?.user.role) {
          const role = session.user.role;
          // Redirect customers to restaurants page, others to their respective dashboards
          if (role === "CUSTOMER") {
            router.push("/restaurants");
          } else {
            const dashboardRole = role.toLowerCase().replace("_", "-");
            router.push(`/dashboard/${dashboardRole}`);
          }
        } else {
          router.push("/restaurants");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
           <AppLogo />
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Sign in to your account to continue
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-300">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
            Demo Credentials - Click to auto-fill
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                fillDemoCredentials("customer@demo.com", "password123")
              }
              className="w-full text-left p-2 rounded bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
            >
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>👤 Customer:</strong> customer@demo.com / password123
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                fillDemoCredentials("admin@demo.com", "password123")
              }
              className="w-full text-left p-2 rounded bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
            >
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>🏪 Restaurant Admin:</strong> admin@demo.com /
                password123
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                fillDemoCredentials("super@demo.com", "password123")
              }
              className="w-full text-left p-2 rounded bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
            >
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>👑 Super Admin:</strong> super@demo.com / password123
              </div>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
