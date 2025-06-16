"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Users,
  Phone,
  Globe,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Heart,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  region?: string;
  district?: string;
  address?: string;
  phone: string;
  email: string;
  website: string;
  mapLink?: string;
  images: string[];
  openingHours: string;
  priceRange: string;
  cuisine: string;
  capacity: number;
  isFeatured: boolean;
  owner: {
    name: string;
    email: string;
  };
  tables: {
    id: string;
    number: string;
    capacity: number;
    isAvailable: boolean;
    currentStatus?: string | null;
  }[];
  totalReservations: number;
  rating: number;
  reviews: number;
}

interface ReservationData {
  restaurantId: string;
  tableId: string;
  date: string;
  time: string;
  partySize: number;
  specialNotes?: string;
}

export default function RestaurantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [specialNotes, setSpecialNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/restaurants/${resolvedParams.id}`);
      const data = await response.json();

      if (response.ok) {
        setRestaurant(data.restaurant);
      } else {
        console.error("Failed to fetch restaurant:", data.error);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableAvailability = async () => {
    if (!selectedDate || !selectedTime) {
      // If no date/time selected, refresh to show current availability
      fetchRestaurantDetails();
      return;
    }

    try {
      console.log(
        `Fetching table availability for ${selectedDate} at ${selectedTime}`
      );
      const response = await fetch(
        `/api/restaurants/${resolvedParams.id}?date=${selectedDate}&time=${selectedTime}`
      );
      const data = await response.json();

      if (response.ok) {
        setRestaurant(data.restaurant);
        console.log("Table availability updated:", data.restaurant.tables);
      } else {
        console.error("Failed to fetch table availability:", data.error);
      }
    } catch (error) {
      console.error("Error fetching table availability:", error);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchTableAvailability();
    }
  }, [selectedDate, selectedTime]);

  // Reset image index when restaurant changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [restaurant?.id]);

  // Debug: Log images when restaurant data changes
  useEffect(() => {
    if (restaurant?.images) {
      console.log("Restaurant images:", restaurant.images);
      console.log("Current image index:", currentImageIndex);
      console.log("Current image src:", restaurant.images[currentImageIndex]);
    }
  }, [restaurant?.images, currentImageIndex]);
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!selectedTable || !selectedDate || !selectedTime) {
      setBookingError("Please select a table, date, and time");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const reservationData: ReservationData = {
        restaurantId: resolvedParams.id,
        tableId: selectedTable,
        date: selectedDate,
        time: selectedTime,
        partySize,
        specialNotes: specialNotes || undefined,
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/customer/reservations");
        }, 2000);
      } else {
        setBookingError(data.error || "Failed to create reservation");
      }
    } catch (error) {
      setBookingError("An error occurred while booking");
      console.error("Booking error:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split("T")[0];
  };

  const nextImage = () => {
    if (restaurant && restaurant.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === restaurant.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (restaurant && restaurant.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? restaurant.images.length - 1 : prev - 1
      );
    }
  };

  const getAvailableTables = () => {
    if (!restaurant) return [];
    return restaurant.tables.filter(
      (table) => table.capacity >= partySize && table.isAvailable
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Restaurant not found
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            The restaurant you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/restaurants">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
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
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              {session ? (
                <Link href="/dashboard/customer/reservations">
                  <Button variant="outline" size="sm">
                    My Reservations
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Restaurant Images */}
        <div className="relative">
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl overflow-hidden">
            {restaurant.images && restaurant.images.length > 0 ? (
              <>
                <Image
                  key={`${restaurant.id}-${currentImageIndex}`}
                  src={restaurant.images[currentImageIndex]}
                  alt={`${restaurant.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  onLoad={() => {
                    console.log(
                      "Image loaded:",
                      restaurant.images[currentImageIndex]
                    );
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    console.error(
                      "Image failed to load:",
                      restaurant.images[currentImageIndex]
                    );
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  priority={currentImageIndex === 0}
                  unoptimized
                />
                {restaurant.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                      {restaurant.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Debug info */}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs z-10">
                  {currentImageIndex + 1}/{restaurant.images.length}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <span className="text-slate-500">No Images Available</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">
                        {restaurant.name}
                      </CardTitle>
                      {restaurant.isFeatured && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="space-y-1">
                            {(restaurant.region || restaurant.district) && (
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                {[restaurant.region, restaurant.district]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                            <div className="text-slate-700 dark:text-slate-200">
                              {restaurant.address || restaurant.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">
                        {restaurant.rating}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      ({restaurant.reviews} reviews)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {restaurant.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.cuisine && (
                    <Badge variant="secondary">{restaurant.cuisine}</Badge>
                  )}
                  {restaurant.priceRange && (
                    <Badge variant="outline">
                      {getPriceDisplay(restaurant.priceRange)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Capacity: {restaurant.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{restaurant.openingHours || "Hours vary"}</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{restaurant.email}</span>
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                {restaurant.mapLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(restaurant.mapLink, "_blank")}
                    className="flex mt-[20px] items-center gap-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <MapPin className="h-4 w-4" />
                    View on Map
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tables Information */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tables</CardTitle>
                <CardDescription>
                  Choose your preferred seating arrangement
                  {!selectedDate || !selectedTime
                    ? " (showing current availability)"
                    : " (for selected date/time)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Status Legend */}
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Table Status Legend:
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
                      <span className="text-green-600">Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
                      <span className="text-yellow-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div>
                      <span className="text-blue-600">Reserved</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
                      <span className="text-purple-600">Occupied</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {restaurant.tables.map((table) => {
                    const getStatusDisplay = () => {
                      if (table.isAvailable) {
                        return { text: "Available", color: "text-green-600" };
                      }

                      switch (table.currentStatus) {
                        case "PENDING":
                          return { text: "Pending", color: "text-yellow-600" };
                        case "CONFIRMED":
                          return { text: "Reserved", color: "text-blue-600" };
                        case "CHECKED_IN":
                          return { text: "Occupied", color: "text-purple-600" };
                        default:
                          return { text: "Booked", color: "text-red-600" };
                      }
                    };

                    const statusDisplay = getStatusDisplay();
                    const borderColor = table.isAvailable
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : table.currentStatus === "PENDING"
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                      : table.currentStatus === "CONFIRMED"
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                      : table.currentStatus === "CHECKED_IN"
                      ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";

                    return (
                      <div
                        key={table.id}
                        className={`p-3 rounded-lg border text-center transition-colors ${borderColor}`}
                      >
                        <div className="font-medium">Table {table.number}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {table.capacity} seats
                        </div>
                        <div
                          className={`text-xs mt-1 font-medium ${statusDisplay.color}`}
                        >
                          {statusDisplay.text}
                        </div>
                        {!table.isAvailable && selectedDate && selectedTime && (
                          <div className="text-xs text-slate-500 mt-1">
                            for selected time
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Make a Reservation
                </CardTitle>
                <CardDescription>
                  Book your table for an amazing dining experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDate && selectedTime && (
                  <div>
                    <Label htmlFor="table">Available Tables</Label>
                    <Select
                      value={selectedTable}
                      onValueChange={setSelectedTable}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTables().map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            Table {table.number} (seats {table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getAvailableTables().length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No tables available for selected date/time/party size
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or dietary requirements..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {session ? (
                  <Dialog
                    open={showBookingDialog}
                    onOpenChange={setShowBookingDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        disabled={
                          !selectedDate || !selectedTime || !selectedTable
                        }
                      >
                        Book Table
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Your Reservation</DialogTitle>
                        <DialogDescription>
                          Please review your booking details before confirming.
                        </DialogDescription>
                      </DialogHeader>

                      {bookingSuccess ? (
                        <div className="text-center py-6">
                          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-600 mb-2">
                            Reservation Confirmed!
                          </h3>
                          <p className="text-slate-600">
                            Redirecting to your dashboard...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                            <div>
                              <strong>Restaurant:</strong> {restaurant.name}
                            </div>
                            <div>
                              <strong>Date:</strong> {selectedDate}
                            </div>
                            <div>
                              <strong>Time:</strong> {selectedTime}
                            </div>
                            <div>
                              <strong>Table:</strong>{" "}
                              {
                                restaurant.tables.find(
                                  (t) => t.id === selectedTable
                                )?.number
                              }
                            </div>
                            <div>
                              <strong>Party Size:</strong> {partySize}{" "}
                              {partySize === 1 ? "person" : "people"}
                            </div>
                            {specialNotes && (
                              <div>
                                <strong>Special Notes:</strong> {specialNotes}
                              </div>
                            )}
                          </div>

                          {bookingError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{bookingError}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowBookingDialog(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleBooking}
                              disabled={bookingLoading}
                              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            >
                              {bookingLoading
                                ? "Booking..."
                                : "Confirm Booking"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Sign In to Book Table
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
