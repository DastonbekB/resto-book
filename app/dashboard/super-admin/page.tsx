"use client";

import AppLogo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  Database,
  MapPin,
  Settings,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalRestaurants: number;
    totalReservations: number;
    totalTables: number;
    userGrowth: number;
    restaurantGrowth: number;
    reservationGrowth: number;
    userGrowthPercentage: number;
  };
  breakdowns: {
    usersByRole: Record<string, number>;
    restaurantsByStatus: Array<{
      isActive: boolean;
      isFeatured: boolean;
      count: number;
    }>;
    reservationsByStatus: Record<string, number>;
  };
  insights: {
    recentActivity: Array<{
      id: string;
      userName: string | null;
      restaurantName: string;
      date: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });
      const data = await response.json();

      console.log("Analytics API response status:", response.status);
      console.log("Analytics API response data:", data);

      if (response.ok) {
        setStats(data);
      } else {
        console.error("Error fetching analytics:", data);
        // If it's a 403 error, the user might not be authenticated as super admin
        if (response.status === 403) {
          console.error("Access denied - super admin required");
        }
      }
    } catch (error) {
      console.error("Network error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "SUPER_ADMIN") {
      fetchAnalytics();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
    return null; // Ensure component doesn't continue rendering
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AppLogo />
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                <Shield className="inline-block w-3 h-3 mr-1" />
                Super Admin
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
            System Administration
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage the entire RestoBook platform, users, and restaurants
          </p>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.overview.totalUsers || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />+
                  {loading ? "..." : stats?.overview.userGrowth || 0} this week
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.overview.totalRestaurants || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />+
                  {loading ? "..." : stats?.overview.restaurantGrowth || 0} this
                  week
                </p>
              </div>
              <Building className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Total Reservations
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats?.overview.totalReservations || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <Calendar className="inline w-3 h-3 mr-1" />+
                  {loading ? "..." : stats?.overview.reservationGrowth || 0}{" "}
                  this week
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  System Health
                </p>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-green-600 mt-1">
                  <CheckCircle className="inline w-3 h-3 mr-1" />
                  All systems operational
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    User Management
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Manage all platform users
                  </p>
                </div>
              </div>
              <Link href="/dashboard/super-admin/users">
                <Button size="sm" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Super Admins
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Full system access
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats?.breakdowns.usersByRole?.SUPER_ADMIN || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Building className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Restaurant Admins
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Restaurant owners
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats?.breakdowns.usersByRole?.RESTAURANT_ADMIN || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Reception Staff
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Front desk access
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats?.breakdowns.usersByRole?.RECEPTION_ADMIN || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Customers
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Regular users
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats?.breakdowns.usersByRole?.CUSTOMER || 0}
                </span>
              </div>
            </div>

            <Link href="/dashboard/super-admin/users">
              <Button className="w-full mt-4" variant="outline">
                View All Users
              </Button>
            </Link>
          </div>

          {/* Restaurant Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Restaurant Management
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Platform restaurants
                  </p>
                </div>
              </div>
              <Link href="/dashboard/super-admin/restaurants">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Loading restaurants...
                </p>
              </div>
            ) : !stats?.overview.totalRestaurants ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Restaurants Yet
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  Restaurant owners need to complete their setup process
                </p>
                <div className="text-xs text-slate-500 mb-4">
                  Debug: totalRestaurants = {stats?.overview.totalRestaurants},
                  stats = {JSON.stringify(stats?.overview)}
                </div>
                <Link href="/dashboard/super-admin/restaurants">
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Setup Progress
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.overview.totalRestaurants}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Total Restaurants
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.breakdowns.restaurantsByStatus.reduce(
                          (acc, item) => acc + (item.isActive ? item.count : 0),
                          0
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Active
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/super-admin/restaurants">
                  <Button className="w-full" variant="outline">
                    Manage All Restaurants
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* System Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Database Management
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  System data
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Monitor database performance, run backups, and manage data
              integrity
            </p>
            <Button className="w-full" variant="outline">
              Access Database Tools
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Analytics & Reports
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Platform insights
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              View detailed analytics, user behavior, and generate system
              reports
            </p>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  System Settings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Platform config
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Configure system settings, manage integrations, and update
              platform features
            </p>
            <Button className="w-full" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Open Settings
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Platform Status
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                System is running smoothly. All services are operational and
                ready for restaurant onboarding.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
