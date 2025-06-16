"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [showSuccess, setShowSuccess] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "4242 4242 4242 4242", // Pre-filled for demo
    expiryDate: "12/25",
    cvv: "123",
    cardholderName: "",
    billingAddress: {
      street: "",
      city: "",
      country: "Uzbekistan",
      zipCode: "",
    },
  });

  const planId = searchParams.get("plan");

  useEffect(() => {
    if (session?.user?.name) {
      setPaymentForm((prev) => ({
        ...prev,
        cardholderName: session.user.name || "",
      }));
    }
  }, [session]);

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

  const calculatePrice = () => {
    if (!plan) return 0;
    if (billingPeriod === "yearly") {
      return Math.round(plan.price * 12 * 0.8); // 20% discount for yearly
    }
    return plan.price;
  };

  const handlePayment = async () => {
    if (!plan || !session?.user?.id) return;

    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create subscription
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod,
          paymentDetails: {
            cardLast4: paymentForm.cardNumber.slice(-4),
            paymentMethod: "credit_card",
          },
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        const error = await response.json();
        alert(error.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setPaymentForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        [field]: value,
      }));
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
    router.push("/login?redirect=/checkout");
    return null;
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/pricing"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Plans</span>
            </Link>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Complete Your Purchase
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Review your subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {plan.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{plan.billingPeriod}</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Billing Period</Label>
                  <Select
                    value={billingPeriod}
                    onValueChange={setBillingPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      $
                      {billingPeriod === "yearly"
                        ? plan.price * 12
                        : plan.price}
                    </span>
                  </div>

                  {billingPeriod === "yearly" && (
                    <div className="flex justify-between text-green-600">
                      <span>Yearly Discount (20%)</span>
                      <span>-${plan.price * 12 - calculatePrice()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${calculatePrice()}</span>
                  </div>

                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-green-600 font-medium">
                      You save ${plan.price * 12 - calculatePrice()} annually
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Your payment information is encrypted and secure. This is a
                  demo environment with simulated payments.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Details</span>
                </CardTitle>
                <CardDescription>
                  Demo environment - payment is simulated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    placeholder="1234 5678 9012 3456"
                    className="bg-slate-100 dark:bg-slate-800"
                    readOnly
                  />
                  <p className="text-xs text-slate-500">
                    Demo card number - do not use real cards
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={(e) =>
                      handleInputChange("cardholderName", e.target.value)
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Billing Address</h4>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={paymentForm.billingAddress.street}
                      onChange={(e) =>
                        handleInputChange(
                          "billingAddress.street",
                          e.target.value
                        )
                      }
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={paymentForm.billingAddress.city}
                        onChange={(e) =>
                          handleInputChange(
                            "billingAddress.city",
                            e.target.value
                          )
                        }
                        placeholder="Tashkent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={paymentForm.billingAddress.zipCode}
                        onChange={(e) =>
                          handleInputChange(
                            "billingAddress.zipCode",
                            e.target.value
                          )
                        }
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handlePayment}
                  disabled={
                    processing ||
                    !paymentForm.cardholderName ||
                    !paymentForm.billingAddress.street
                  }
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment - ${calculatePrice()}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
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
              Payment Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your subscription to the {plan.name} plan has been activated. You
              can now access all the premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
                router.push("/dashboard/restaurant-admin/subscription")
              }
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
