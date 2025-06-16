"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { Calendar, Clock, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import logo from "../assets/logo.svg" 

export default function CustomerDashboard() {
  const { data: session, status } = useSession();

  // Handle loading and authentication states without early returns
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <img className="w-[160px]" src={logo.src}/> 
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, {session.user.name}!
              </span>
              <Link href="/restaurants">
                <Button variant="outline" size="sm">
                  Browse Restaurants
                </Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Your Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your reservations and discover new restaurants
          </p>
        </div>

        {/* Featured Action - Find Restaurants */}
        <div className="mb-8">
          <Link href="/restaurants" className="group block">
            <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-2xl border-0 p-8 group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Find Restaurants
                      </h3>
                      <p className="text-orange-100">
                        Discover amazing dining experiences
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="text-white/90 text-lg mb-4 leading-relaxed">
                  Browse our curated collection of restaurants by location,
                  cuisine, and availability. Find your perfect dining experience
                  just a click away.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-orange-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Real-time availability</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Instant booking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Best prices</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Book Action */}
        <div className="mb-8">
          <Link href="/dashboard/customer/quick-book" className="group block">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 group-hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Quick Book
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Book a table for today or tomorrow at your favorite spots
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/customer/reservations" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 group-hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Manage Reservations
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    View & modify bookings
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                View your upcoming reservations, cancel bookings, and check your
                dining history
              </p>
            </div>
          </Link>

          <Link href="/dashboard/customer/profile" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 group-hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Profile Settings
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Update preferences
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Manage your account details, preferences, and notification
                settings
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Ready to dine?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Discover amazing restaurants and make your next reservation!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/restaurants">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Restaurants
                </Button>
              </Link>
              <Link href="/dashboard/customer/reservations">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Reservations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
