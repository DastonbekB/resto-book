"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import logo from "../assets/logo.svg" 
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Table,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface ReservationActivity {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  tableNumber?: string;
  createdAt: string;
}

interface TodayUpcoming {
  id: string;
  customerName: string;
  customerEmail: string;
  time: string;
  partySize: number;
  status: string;
  tableNumber?: string;
  specialNotes?: string;
}

export default function ReceptionAdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    todayReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    checkedInReservations: 0,
    weeklyReservations: 0,
    monthlyReservations: 0,
    totalTables: 0,
    activeTables: 0,
    todayOccupancy: 0,
    restaurantName: "",
    restaurantCapacity: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ReservationActivity[]>(
    []
  );
  const [todayUpcoming, setTodayUpcoming] = useState<TodayUpcoming[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session?.user?.id]);

  if (status === "loading") {
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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reception/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
        setTodayUpcoming(data.todayUpcoming || []);
      } else {
        console.error("Failed to fetch stats");
        // Fallback to default values
        setStats({
          todayReservations: 0,
          pendingReservations: 0,
          confirmedReservations: 0,
          cancelledReservations: 0,
          checkedInReservations: 0,
          weeklyReservations: 0,
          monthlyReservations: 0,
          totalTables: 0,
          activeTables: 0,
          todayOccupancy: 0,
          restaurantName: "",
          restaurantCapacity: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default values with same structure as above
      setStats({
        todayReservations: 0,
        pendingReservations: 0,
        confirmedReservations: 0,
        cancelledReservations: 0,
        checkedInReservations: 0,
        weeklyReservations: 0,
        monthlyReservations: 0,
        totalTables: 0,
        activeTables: 0,
        todayOccupancy: 0,
        restaurantName: "",
        restaurantCapacity: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CONFIRMED":
        return "text-green-600 bg-green-100";
      case "CHECKED_IN":
        return "text-blue-600 bg-blue-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      case "COMPLETED":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTime = (time: string) => {
    // Assuming time is in HH:MM format
    return time;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              < img className=" width=[120px]" src="logo.svg">
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Reception Admin
              </span>
              {stats.restaurantName && (
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  - {stats.restaurantName}
                </span>
              )}
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
            Reception Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage reservations and guest services
          </p>
        </div>

        {/* Primary Stats Grid */}
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
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Pending
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.pendingReservations}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Confirmed
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.confirmedReservations}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Checked In
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.checkedInReservations}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Weekly Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.weeklyReservations}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Monthly Total
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : stats.monthlyReservations}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Active Tables
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : `${stats.activeTables}/${stats.totalTables}`}
                </p>
              </div>
              <Table className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Today's Occupancy
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "..." : `${stats.todayOccupancy}%`}
                </p>
              </div>
              <Users className="h-8 w-8 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Today's Upcoming Reservations */}
        {todayUpcoming.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Today's Upcoming Reservations
            </h2>
            <div className="space-y-3">
              {todayUpcoming.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {reservation.customerName?.charAt(0) || "G"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {reservation.customerName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatTime(reservation.time)} • {reservation.partySize}{" "}
                        guests
                        {reservation.tableNumber &&
                          ` • Table ${reservation.tableNumber}`}
                      </p>
                      {reservation.specialNotes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Note: {reservation.specialNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Reservations
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Manage bookings
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              View, confirm, modify, and cancel customer reservations
            </p>
            <Link href="/dashboard/reception-admin/reservations">
              <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                Manage Reservations
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Guest Services
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Customer support
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Handle customer inquiries and special requests
            </p>
            <Button variant="outline" className="w-full">
              Guest Services
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Alerts & updates
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              Manage system notifications and alerts
            </p>
            <Button variant="outline" className="w-full">
              View Notifications
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {activity.customerName?.charAt(0) || "G"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {activity.customerName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(activity.date)} at{" "}
                        {formatTime(activity.time)} • {activity.partySize}{" "}
                        guests
                        {activity.tableNumber &&
                          ` • Table ${activity.tableNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Recent Activity
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Recent reservations and activities will appear here
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/reception-admin/reservations">
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Reservations
                  </Button>
                </Link>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Guest Services
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
