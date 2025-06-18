"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  Building,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Plus,
  CreditCard,
} from "lucide-react";
import { Reservation } from "@prisma/client";
import AppLogo from "@/components/Logo";

export default function RestaurantAdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    todayReservations: 0,
    totalTables: 0,
    staffMembers: 0,
    monthlyReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session?.user?.id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
    return null; // Ensure component doesn't continue rendering
  }

  const fetchStats = async () => {
    try {
      const [reservationsRes, tablesRes, staffRes] = await Promise.all([
        fetch("/api/reservations/restaurant"),
        fetch("/api/tables"),
        fetch("/api/staff"),
      ]);

      const reservations = reservationsRes.ok
        ? await reservationsRes.json()
        : [];
      const tables = tablesRes.ok ? await tablesRes.json() : [];
      const staff = staffRes.ok ? await staffRes.json() : [];

      const today = new Date().toDateString();
      const todayReservations = reservations.filter(
        (r: Reservation) => new Date(r.date).toDateString() === today
      ).length;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyReservations = reservations.filter((r: any) => {
        const reservationDate = new Date(r.date);
        return (
          reservationDate.getMonth() === currentMonth &&
          reservationDate.getFullYear() === currentYear
        );
      }).length;

      setStats({
        todayReservations,
        totalTables: tables.length,
        staffMembers: staff.length,
        monthlyReservations,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              
              <AppLogo />
              <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Restaurant Admin
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, {session.user.name}!
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
            Restaurant Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your restaurant, reservations, and staff
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Today's Reservations
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.todayReservations}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Total Tables
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.totalTables}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Staff Members
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.staffMembers}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  This Month
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.monthlyReservations}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Restaurant Profile
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Manage details
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Update your restaurant information, photos, and operating hours
            </p>
            <Link href="/dashboard/restaurant-admin/profile">
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Setup Restaurant
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Reservations
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  View & manage
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              View incoming reservations and manage booking status
            </p>
            <Link href="/dashboard/restaurant-admin/reservations">
              <Button className="w-full" variant="outline">
                View All Reservations
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Staff Management
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Assign roles
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Add reception staff and manage team permissions
            </p>
            <Link href="/dashboard/restaurant-admin/staff">
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Table Management
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Setup tables
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Configure your restaurant's seating layout and capacity
            </p>
            <Link href="/dashboard/restaurant-admin/tables">
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Tables
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Analytics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  View insights
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Track reservation trends and restaurant performance
            </p>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Subscription
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Manage plan
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              View your current plan, usage, and billing information
            </p>
            <Link href="/dashboard/restaurant-admin/subscription">
              <Button className="w-full" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Settings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Configure options
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Manage restaurant settings and preferences
            </p>
            <Button className="w-full" variant="outline">
              Open Settings
            </Button>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Welcome to RestoBook!</h2>
          <p className="text-orange-100 mb-6">
            Get started by setting up your restaurant profile and adding your
            first tables. Once configured, customers will be able to discover
            and book reservations at your restaurant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/restaurant-admin/profile">
              <Button
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Setup Restaurant Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-orange-500 hover:bg-white hover:text-white"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
