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
  BarChart3,
  Calendar,
  Check,
  Crown,
  MessageSquare,
  Settings,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for small restaurants getting started",
    price: 0,
    originalPrice: null,
    badge: null,
    features: [
      "Up to 50 reservations/month",
      "Up to 10 tables",
      "Basic table management",
      "Email notifications",
      "Basic customer management",
      "Standard support",
    ],
    limitations: [
      "No SMS notifications",
      "No analytics",
      "No API access",
      "Basic reporting only",
    ],
    maxTables: 10,
    maxReservationsPerMonth: 50,
    hasAnalytics: false,
    hasSMSNotifications: false,
    hasAPIAccess: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    icon: Calendar,
    color: "border-slate-200",
    buttonColor: "bg-slate-600 hover:bg-slate-700",
  },
  {
    id: "basic",
    name: "Basic",
    description: "Ideal for small restaurants managing reservations manually",
    price: 19,
    originalPrice: null,
    badge: null,
    features: [
      "Up to 200 reservations/month",
      "Manual booking management",
      "Single-location support",
      "Admin panel access",
      "2 staff accounts",
      "Email notifications",
      "Monthly CSV booking reports",
      "Embeddable website widget",
      "Printable reservation log"
    ],
    limitations: [
      "No SMS notifications",
      "No analytics dashboard",
      "No API access",
      "No multi-branch support",
      "Limited customization"
    ],
    maxTables: null,
    maxReservationsPerMonth: 200,
    hasAnalytics: false,
    hasSMSNotifications: false,
    hasAPIAccess: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    icon: Calendar,
    color: "border-yellow-300",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600"
  }
  ,
  {
    id: "professional",
    name: "Professional",
    description: "Ideal for growing restaurants with advanced needs",
    price: 29,
    originalPrice: null,
    badge: "Most Popular",
    features: [
      "Unlimited reservations",
      "Unlimited tables",
      "Advanced table management",
      "Email & SMS notifications",
      "Advanced customer management",
      "Detailed analytics & reporting",
      "Priority support",
      "Custom reservation forms",
    ],
    limitations: [],
    maxTables: null,
    maxReservationsPerMonth: null,
    hasAnalytics: true,
    hasSMSNotifications: true,
    hasAPIAccess: false,
    hasCustomBranding: false,
    hasPrioritySupport: true,
    icon: BarChart3,
    color: "border-green-500",
    buttonColor:
      "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "Complete solution for restaurant chains and large establishments",
    price: 99,
    originalPrice: null,
    badge: "Best Value",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "API access & integrations",
      "Custom branding",
      "Advanced integrations",
      "Dedicated account manager",
      "Custom reporting",
      "White-label options",
      "24/7 priority support",
    ],
    limitations: [],
    maxTables: null,
    maxReservationsPerMonth: null,
    hasAnalytics: true,
    hasSMSNotifications: true,
    hasAPIAccess: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
    icon: Crown,
    color: "border-purple-500",
    buttonColor:
      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  },
];

const additionalFeatures = [
  {
    icon: Calendar,
    title: "Smart Reservations",
    description: "Intelligent booking system with automated confirmations",
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Complete customer profiles and booking history",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed insights into your restaurant performance",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Full mobile app for staff and customers",
  },
  {
    icon: MessageSquare,
    title: "Multi-Channel Notifications",
    description: "Email, SMS, and push notifications",
  },
  {
    icon: Settings,
    title: "Easy Integration",
    description: "Connect with your existing restaurant systems",
  },
];

interface DatabasePlan {
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
  isActive: boolean;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [dbPlans, setDbPlans] = useState<DatabasePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscriptions/plans");
        if (response.ok) {
          const data = await response.json();
          setDbPlans(data.plans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPrice = (price: number) => {
    if (billingPeriod === "yearly") {
      return Math.round(price * 12 * 0.8); // 20% discount for yearly
    }
    return price;
  };

  const getPriceLabel = (price: number) => {
    if (price === 0) return "Free";
    const finalPrice = getPrice(price);
    const period = billingPeriod === "yearly" ? "year" : "month";
    return `$${finalPrice}/${period}`;
  };

  // Merge static display data with database IDs
  const getDisplayPlans = () => {
    if (loading || dbPlans.length === 0) return plans;

    return plans.map((staticPlan) => {
      const dbPlan = dbPlans.find(
        (db) => db.name.toLowerCase() === staticPlan.id
      );
      return {
        ...staticPlan,
        id: dbPlan ? dbPlan.id : staticPlan.id,
        // Use database values for accuracy
        price: dbPlan ? dbPlan.price : staticPlan.price,
        description: dbPlan ? dbPlan.description : staticPlan.description,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <AppLogo />
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              From small cafes to large restaurant chains, we have the perfect
              solution for your business
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span
                className={`text-sm ${billingPeriod === "monthly"
                    ? "text-slate-900 dark:text-white font-medium"
                    : "text-slate-500"
                  }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingPeriod(
                    billingPeriod === "monthly" ? "yearly" : "monthly"
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingPeriod === "yearly" ? "bg-green-500" : "bg-slate-200"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingPeriod === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                    }`}
                />
              </button>
              <span
                className={`text-sm ${billingPeriod === "yearly"
                    ? "text-slate-900 dark:text-white font-medium"
                    : "text-slate-500"
                  }`}
              >
                Yearly
              </span>
              {billingPeriod === "yearly" && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {getDisplayPlans().map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.color} ${plan.id === "professional"
                        ? "scale-105 shadow-2xl"
                        : "shadow-lg"
                      }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 px-4 py-2">
                          <Zap className="w-3 h-3 mr-1" />
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300 mt-2">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-6">
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">
                          {getPriceLabel(plan.price)}
                        </div>
                        {billingPeriod === "yearly" && plan.price > 0 && (
                          <div className="text-sm text-slate-500 mt-1">
                            ${plan.price}/month billed annually
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-8">
                      <Link
                        href={
                          plan.price === 0
                            ? `/subscribe?plan=${plan.id}`
                            : `/checkout?plan=${plan.id}`
                        }
                      >
                        <Button className={`w-full ${plan.buttonColor}`}>
                          {plan.price === 0
                            ? "Start Free Trial"
                            : "Get Started"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our platform provides all the tools you need to manage your
              restaurant reservations efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Can I change plans at any time?
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately, and we'll prorate any billing
                  differences.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Is there a free trial available?
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Yes, all paid plans come with a 14-day free trial. No credit
                  card required to start your trial.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  We accept all major credit cards, PayPal, and bank transfers
                  for annual subscriptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-teal-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of restaurants already using RestoBook to manage
              their reservations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-50"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-green-600 hover:bg-white hover:text-green-600"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <AppLogo />
          </div>
          <div className="text-center text-slate-400">
            <p>&copy; 2025 RestoBook. All rights reserved.</p>
            <p className="mt-2">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              {" • "}
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
