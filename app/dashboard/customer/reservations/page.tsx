"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Phone,
  Mail,
  Edit,
  Trash2,
} from "lucide-react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    location: string;
  };
  table: {
    id: string;
    number: string;
    capacity: number;
  };
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: "Confirmed",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle,
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: CheckCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
  },
};

export default function CustomerReservationsPage() {
  const { data: session, status } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      const data = await response.json();

      if (response.ok) {
        setReservations(data.reservations);
      } else {
        console.error("Failed to fetch reservations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);
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

  const handleCancelReservation = async (reservationId: string) => {
    setCancellingId(reservationId);

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );

      if (response.ok) {
        await fetchReservations(); // Refresh the list
      } else {
        const data = await response.json();
        console.error("Failed to cancel reservation:", data.error);
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    } finally {
      setCancellingId(null);
    }
  };

  const getFilteredReservations = (type: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);

      switch (type) {
        case "upcoming":
          return (
            reservationDate >= today &&
            !["CANCELLED", "NO_SHOW", "COMPLETED"].includes(reservation.status)
          );
        case "past":
          return (
            reservationDate < today ||
            ["COMPLETED", "NO_SHOW"].includes(reservation.status)
          );
        case "cancelled":
          return reservation.status === "CANCELLED";
        default:
          return true;
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const canCancelReservation = (reservation: Reservation) => {
    const reservationDateTime = new Date(
      `${reservation.date}T${reservation.time}`
    );
    const now = new Date();
    const hoursUntilReservation =
      (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      hoursUntilReservation > 2 &&
      !["CANCELLED", "NO_SHOW", "COMPLETED", "CHECKED_IN"].includes(
        reservation.status
      )
    );
  };

  const getUpcomingCount = () => getFilteredReservations("upcoming").length;
  const getPastCount = () => getFilteredReservations("past").length;
  const getCancelledCount = () => getFilteredReservations("cancelled").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 dark:bg-slate-700 rounded"
                ></div>
              ))}
            </div>
          </div>
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
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, {session.user.name}!
              </span>
              <Link href="/restaurants">
                <Button variant="outline" size="sm">
                  Find Restaurants
                </Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Reservations
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your restaurant bookings
          </p>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              Upcoming ({getUpcomingCount()})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              Past ({getPastCount()})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              Cancelled ({getCancelledCount()})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {getFilteredReservations("upcoming").length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No upcoming reservations
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Ready to discover some amazing restaurants?
                  </p>
                  <Link href="/restaurants">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Browse Restaurants
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              getFilteredReservations("upcoming").map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancelReservation}
                  cancelling={cancellingId === reservation.id}
                  canCancel={canCancelReservation(reservation)}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {getFilteredReservations("past").length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No past reservations
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Your dining history will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredReservations("past").map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancelReservation}
                  cancelling={false}
                  canCancel={false}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  isPast={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {getFilteredReservations("cancelled").length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No cancelled reservations
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Cancelled reservations will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredReservations("cancelled").map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancelReservation}
                  cancelling={false}
                  canCancel={false}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
  cancelling: boolean;
  canCancel: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  isPast?: boolean;
}

function ReservationCard({
  reservation,
  onCancel,
  cancelling,
  canCancel,
  formatDate,
  formatTime,
  isPast = false,
}: ReservationCardProps) {
  const status = statusConfig[reservation.status];
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {reservation.restaurant.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {reservation.restaurant.location}
            </CardDescription>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm">{formatDate(reservation.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm">{formatTime(reservation.time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-sm">
              {reservation.partySize}{" "}
              {reservation.partySize === 1 ? "guest" : "guests"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Table {reservation.table.number}
            </span>
          </div>
        </div>

        {reservation.specialNotes && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <strong>Special Notes:</strong> {reservation.specialNotes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Booked on {new Date(reservation.createdAt).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/restaurants/${reservation.restaurant.id}`}>
              <Button variant="outline" size="sm">
                View Restaurant
              </Button>
            </Link>

            {canCancel && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={cancelling}>
                    {cancelling ? "Cancelling..." : "Cancel"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Reservation</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your reservation at{" "}
                      {reservation.restaurant.name}? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                    <div>
                      <strong>Restaurant:</strong> {reservation.restaurant.name}
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(reservation.date)}
                    </div>
                    <div>
                      <strong>Time:</strong> {formatTime(reservation.time)}
                    </div>
                    <div>
                      <strong>Party Size:</strong> {reservation.partySize}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        Keep Reservation
                      </Button>
                    </DialogTrigger>
                    <Button
                      variant="destructive"
                      onClick={() => onCancel(reservation.id)}
                      disabled={cancelling}
                      className="flex-1"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isPast && reservation.status === "COMPLETED" && (
              <Button variant="outline" size="sm">
                Leave Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
