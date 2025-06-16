"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuickBooking {
  restaurant: {
    id: string;
    name: string;
    location: string;
    cuisine: string;
    rating: number;
    priceRange: string;
    images: string[];
  };
  table: {
    id: string;
    number: string;
    capacity: number;
  };
  availableSlots: string[];
}

export default function QuickBookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availableBookings, setAvailableBookings] = useState<QuickBooking[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("today");
  const [partySize, setPartySize] = useState(2);
  const [location, setLocation] = useState("Tashkent");
  const [cuisine, setCuisine] = useState("");
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const searchQuickBookings = async () => {
    setLoading(true);
    try {
      // Simulate fetching quick booking options
      // In a real app, this would call an API that finds available slots for today/tomorrow
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockBookings: QuickBooking[] = [
        {
          restaurant: {
            id: "1",
            name: "Bella Vista",
            location: "Downtown",
            cuisine: "Italian",
            rating: 4.5,
            priceRange: "$$",
            images: [],
          },
          table: {
            id: "table1",
            number: "5",
            capacity: 4,
          },
          availableSlots: ["12:00", "12:30", "18:00", "18:30", "19:00"],
        },
        {
          restaurant: {
            id: "2",
            name: "Sakura Gardens",
            location: "Midtown",
            cuisine: "Japanese",
            rating: 4.7,
            priceRange: "$$$",
            images: [],
          },
          table: {
            id: "table2",
            number: "3",
            capacity: 2,
          },
          availableSlots: ["17:30", "18:00", "19:30", "20:00"],
        },
        {
          restaurant: {
            id: "3",
            name: "Spice Route",
            location: "Uptown",
            cuisine: "Indian",
            rating: 4.3,
            priceRange: "$$",
            images: [],
          },
          table: {
            id: "table3",
            number: "8",
            capacity: 6,
          },
          availableSlots: ["13:00", "17:00", "19:00", "20:30"],
        },
      ];

      // Filter based on party size and location/cuisine
      const filtered = mockBookings.filter((booking) => {
        const matchesSize = booking.table.capacity >= partySize;
        const matchesLocation =
          !location ||
          booking.restaurant.location
            .toLowerCase()
            .includes(location.toLowerCase());
        const matchesCuisine =
          !cuisine ||
          booking.restaurant.cuisine
            .toLowerCase()
            .includes(cuisine.toLowerCase());
        return matchesSize && matchesLocation && matchesCuisine;
      });

      setAvailableBookings(filtered);
    } catch (error) {
      console.error("Error fetching quick bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBook = async (booking: QuickBooking, timeSlot: string) => {
    setBookingLoading(`${booking.restaurant.id}-${timeSlot}`);

    try {
      const bookingDate =
        selectedDate === "today"
          ? new Date().toISOString().split("T")[0]
          : new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: booking.restaurant.id,
          tableId: booking.table.id,
          date: bookingDate,
          time: timeSlot,
          partySize,
          specialNotes: "Quick booking",
        }),
      });

      if (response.ok) {
        // Show success and redirect
        setTimeout(() => {
          router.push("/dashboard/customer/reservations");
        }, 1500);
      } else {
        const data = await response.json();
        console.error("Booking failed:", data.error);
      }
    } catch (error) {
      console.error("Error making quick booking:", error);
    } finally {
      setBookingLoading(null);
    }
  };

  const getDateLabel = () => {
    if (selectedDate === "today") {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } else {
      const tomorrow = new Date(Date.now() + 86400000);
      return tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPriceDisplay = (priceRange: string) => {
    const ranges = {
      $: "$",
      $$: "$$",
      $$$: "$$$",
      $$$$: "$$$$",
    };
    return ranges[priceRange as keyof typeof ranges] || priceRange;
  };

  useEffect(() => {
    searchQuickBookings();
  }, [selectedDate, partySize, location, cuisine]);

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
            <Link
              href="/restaurants"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Restaurants</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, {session.user.name}!
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Quick Book
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Find and book available tables for {getDateLabel()}
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Search Preferences
            </CardTitle>
            <CardDescription>
              Customize your quick booking search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="partySize">Party Size</Label>
                <Select
                  value={partySize.toString()}
                  onValueChange={(value) => setPartySize(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? "person" : "people"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter area..."
                />
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine (Optional)</Label>
                <Input
                  id="cuisine"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="Enter cuisine..."
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchQuickBookings}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {loading ? "Searching..." : "Update Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Bookings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Available Tables ({availableBookings.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        {[...Array(4)].map((_, j) => (
                          <div
                            key={j}
                            className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No quick bookings available
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Try adjusting your preferences or browse all restaurants
                </p>
                <Link href="/restaurants">
                  <Button>Browse All Restaurants</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {availableBookings.map((booking) => (
                <Card
                  key={`${booking.restaurant.id}-${booking.table.id}`}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                          {booking.restaurant.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.restaurant.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{booking.restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              Table {booking.table.number} (seats{" "}
                              {booking.table.capacity})
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {booking.restaurant.cuisine}
                          </Badge>
                          <Badge variant="outline">
                            {getPriceDisplay(booking.restaurant.priceRange)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                        Available Times
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.availableSlots.map((slot) => {
                          const isBooking =
                            bookingLoading ===
                            `${booking.restaurant.id}-${slot}`;

                          return (
                            <Button
                              key={slot}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickBook(booking, slot)}
                              disabled={isBooking || bookingLoading !== null}
                              className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 dark:hover:bg-orange-900/20"
                            >
                              {isBooking ? (
                                <div className="flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border border-orange-500 border-t-transparent"></div>
                                  <span>Booking...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(slot)}</span>
                                </div>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <Link href={`/restaurants/${booking.restaurant.id}`}>
                        <Button variant="ghost" size="sm">
                          View Restaurant Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
