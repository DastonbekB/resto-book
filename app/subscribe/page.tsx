"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, ArrowLeft, Loader2, Crown, Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string;
}

function SubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const planId = searchParams.get("plan");

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      if (response.ok) {
        const data = await response.json();
        const selectedPlan = data.plans.find(
          (p: SubscriptionPlan) => p.id === planId
        );
        if (selectedPlan) {
          setPlan(selectedPlan);
          // Redirect to checkout if it's a paid plan
          if (selectedPlan.price > 0) {
            router.push(`/checkout?plan=${planId}`);
            return;
          }
        } else {
          router.push("/pricing");
        }
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan || !session?.user?.id) return;

    setProcessing(true);

    try {
      // Create free subscription
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod: "monthly",
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        const error = await response.json();
        alert(
          error.error || "Failed to activate subscription. Please try again."
        );
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to activate subscription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login?redirect=/subscribe");
    return null;
  }

  if (!plan) {
    return null;
  }

  const features = JSON.parse(plan.features || "[]");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/pricing"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pricing</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                RestoBook
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Activate Your Free Plan
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Get started with RestoBook's free plan - no credit card required
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{plan.name} Plan</CardTitle>
              <CardDescription className="text-lg mt-2">
                {plan.description}
              </CardDescription>
              <div className="text-4xl font-bold text-green-600 mt-4">
                Free Forever
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 text-center">
                  What's Included:
                </h3>
                <div className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">No Credit Card Required</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Start using all features immediately. Upgrade anytime when
                  you're ready to scale.
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleSubscribe}
                disabled={processing}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Activating Plan...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Activate Free Plan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Welcome to RestoBook!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your {plan.name} plan has been activated successfully. You can now
              access all the features and start managing your restaurant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => router.push("/dashboard/restaurant-admin")}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
