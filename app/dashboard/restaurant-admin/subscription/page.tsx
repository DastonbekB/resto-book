"use client";

import AppLogo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string;
  maxTables: number | null;
  maxReservationsPerMonth: number | null;
  hasAnalytics: boolean;
  hasSMSNotifications: boolean;
  hasAPIAccess: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  reservationsUsed: number;
  plan: SubscriptionPlan;
}

interface Restaurant {
  id: string;
  name: string;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setRestaurant(data.restaurant);
      } else {
        console.error("Failed to fetch subscription");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscription();
      fetchAvailablePlans();
    }
  }, [session?.user?.id]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
    return null;
  }

  const handleSubscriptionAction = async (action: string, planId?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, planId }),
      });

      if (response.ok) {
        await fetchSubscription();
        setShowUpgradeDialog(false);
        setShowCancelDialog(false);
        alert(`Subscription ${action}d successfully!`);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
      alert(`Error ${action}ing subscription`);
    } finally {
      setActionLoading(false);
    }
  };

  // const subscribeToNewPlan = async (planId: string) => {
  //   setActionLoading(true);
  //   try {
  //     const response = await fetch("/api/subscriptions", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ planId }),
  //     });

  //     if (response.ok) {
  //       await fetchSubscription();
  //       setShowUpgradeDialog(false);
  //       alert("Successfully subscribed to new plan!");
  //     } else {
  //       const error = await response.json();
  //       alert(error.error || "Failed to subscribe to plan");
  //     }
  //   } catch (error) {
  //     console.error("Error subscribing to plan:", error);
  //     alert("Error subscribing to plan");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-100 text-green-700",
        label: "Active",
        icon: CheckCircle,
      },
      TRIAL: {
        color: "bg-blue-100 text-blue-700",
        label: "Trial",
        icon: Clock,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-700",
        label: "Cancelled",
        icon: X,
      },
      EXPIRED: {
        color: "bg-gray-100 text-gray-700",
        label: "Expired",
        icon: AlertTriangle,
      },
      PAST_DUE: {
        color: "bg-orange-100 text-orange-700",
        label: "Past Due",
        icon: AlertTriangle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getUsagePercentage = () => {
    if (!subscription?.plan?.maxReservationsPerMonth) return 0;
    return Math.min(
      (subscription.reservationsUsed /
        subscription.plan.maxReservationsPerMonth) *
        100,
      100
    );
  };

  const getDaysUntilTrialEnd = () => {
    if (!subscription?.trialEndsAt) return 0;
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard/restaurant-admin">
               <AppLogo />
              </Link>
            
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Restaurant Admin
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {restaurant?.name} - Welcome, {session.user.name}!
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Subscription Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your restaurant's subscription plan and features
          </p>
        </div>

        {subscription ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        <span>{subscription.plan.name} Plan</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {subscription.plan.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Trial Warning */}
                  {subscription.isTrialActive && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            Trial Period
                          </h4>
                          <p className="text-blue-700 text-sm">
                            Your free trial ends in {getDaysUntilTrialEnd()}{" "}
                            days. Upgrade to continue enjoying all features.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Tracking */}
                  {subscription.plan.maxReservationsPerMonth && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Monthly Reservations
                        </span>
                        <span className="text-sm text-slate-600">
                          {subscription.reservationsUsed} /{" "}
                          {subscription.plan.maxReservationsPerMonth}
                        </span>
                      </div>
                      <Progress value={getUsagePercentage()} className="h-2" />
                      {getUsagePercentage() > 80 && (
                        <p className="text-sm text-orange-600 mt-1">
                          You're approaching your monthly limit. Consider
                          upgrading your plan.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Plan Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Your Plan Includes:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.maxReservationsPerMonth
                              ? "text-green-500"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm">
                          {subscription.plan.maxReservationsPerMonth
                            ? `${subscription.plan.maxReservationsPerMonth} reservations/month`
                            : "Unlimited reservations"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.maxTables
                              ? "text-green-500"
                              : "text-green-500"
                          }`}
                        />
                        <span className="text-sm">
                          {subscription.plan.maxTables
                            ? `Up to ${subscription.plan.maxTables} tables`
                            : "Unlimited tables"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.hasAnalytics
                              ? "text-green-500"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm">Advanced Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.hasSMSNotifications
                              ? "text-green-500"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm">SMS Notifications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.hasAPIAccess
                              ? "text-green-500"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm">API Access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`w-4 h-4 ${
                            subscription.plan.hasPrioritySupport
                              ? "text-green-500"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="text-sm">Priority Support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex space-x-3">
                  <Dialog
                    open={showUpgradeDialog}
                    onOpenChange={setShowUpgradeDialog}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Change Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Choose a New Plan</DialogTitle>
                        <DialogDescription>
                          Select a plan that best fits your restaurant's needs
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 max-h-96 overflow-y-auto">
                        {availablePlans.map((plan) => (
                          <Card
                            key={plan.id}
                            className={`cursor-pointer border-2 ${
                              selectedPlan?.id === plan.id
                                ? "border-green-500 bg-green-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {plan.name}
                                  </CardTitle>
                                  <CardDescription>
                                    {plan.description}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">
                                    {plan.price === 0
                                      ? "Free"
                                      : `$${plan.price}/month`}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowUpgradeDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            selectedPlan &&
                            handleSubscriptionAction("upgrade", selectedPlan.id)
                          }
                          disabled={!selectedPlan || actionLoading}
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        >
                          {actionLoading ? "Processing..." : "Change Plan"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {subscription.status === "ACTIVE" && (
                    <Dialog
                      open={showCancelDialog}
                      onOpenChange={setShowCancelDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Cancel Subscription
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Subscription</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your subscription?
                            You'll lose access to premium features.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                          >
                            Keep Subscription
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleSubscriptionAction("cancel")}
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? "Processing..."
                              : "Cancel Subscription"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {subscription.status === "CANCELLED" && (
                    <Button
                      onClick={() => handleSubscriptionAction("reactivate")}
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      {actionLoading
                        ? "Processing..."
                        : "Reactivate Subscription"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* Billing Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Current Plan
                    </p>
                    <p className="text-lg font-semibold">
                      {subscription.plan.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Monthly Cost
                    </p>
                    <p className="text-lg font-semibold">
                      {subscription.plan.price === 0
                        ? "Free"
                        : `$${subscription.plan.price}`}
                    </p>
                  </div>
                  {subscription.nextBillingDate && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Next Billing Date
                      </p>
                      <p className="text-lg font-semibold">
                        {new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Status
                    </p>
                    <div className="mt-1">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Have questions about your subscription or need to make
                    changes?
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // No Subscription - Show Plans
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Active Subscription
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Choose a plan to get started with RestoBook's premium features
            </p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                <Zap className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
