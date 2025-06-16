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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  specialNotes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  table?: {
    id: string;
    number: string;
    capacity: number;
  };
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

const statusIcons = {
  PENDING: AlertCircle,
  CONFIRMED: CheckCircle,
  CHECKED_IN: UserCheck,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
  NO_SHOW: XCircle,
};

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations/restaurant");
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const updateReservationStatus = async (
    reservationId: string,
    newStatus: string
  ) => {
    try {
      console.log(
        `Updating reservation ${reservationId} to status: ${newStatus}`
      );

      const response = await fetch(
        `/api/reservations/${reservationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        // Update the reservation in the local state
        setReservations((prev) =>
          prev.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status: newStatus }
              : reservation
          )
        );

        // Show success message
        console.log(`Reservation status updated to ${newStatus} successfully`);
      } else {
        console.error("Failed to update reservation status:", data.error);
        alert(`Failed to update reservation: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert("An error occurred while updating the reservation");
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.table?.number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    const today = new Date();
    const reservationDate = new Date(reservation.date);
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = reservationDate.toDateString() === today.toDateString();
    } else if (dateFilter === "upcoming") {
      matchesDate = reservationDate >= today;
    } else if (dateFilter === "past") {
      matchesDate = reservationDate < today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusCounts = () => {
    const counts = {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "PENDING").length,
      confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
      checkedIn: reservations.filter((r) => r.status === "CHECKED_IN").length,
      today: reservations.filter(
        (r) => new Date(r.date).toDateString() === new Date().toDateString()
      ).length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/restaurant-admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Reservations
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage customer reservations and bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Total Reservations
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {counts.total}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Today's Reservations
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {counts.today}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {counts.pending}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Checked In
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {counts.checkedIn}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by customer name, email, or table..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-filter">Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
            <CardDescription>
              Manage and track all customer reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No reservations found
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {reservations.length === 0
                    ? "No reservations have been made yet."
                    : "Try adjusting your filters to see more results."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => {
                    const StatusIcon =
                      statusIcons[
                        reservation.status as keyof typeof statusIcons
                      ];
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.user.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {reservation.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(reservation.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-500">
                              {reservation.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.table ? (
                            <Badge variant="outline">
                              Table {reservation.table.number}
                            </Badge>
                          ) : (
                            <span className="text-slate-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-slate-500" />
                            {reservation.partySize}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge
                              variant="secondary"
                              className={
                                statusColors[
                                  reservation.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {reservation.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.specialNotes ? (
                            <span className="text-sm">
                              {reservation.specialNotes}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {reservation.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "CONFIRMED"
                                    )
                                  }
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "CANCELLED"
                                    )
                                  }
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {reservation.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReservationStatus(
                                    reservation.id,
                                    "CHECKED_IN"
                                  )
                                }
                              >
                                Check In
                              </Button>
                            )}
                            {reservation.status === "CHECKED_IN" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReservationStatus(
                                    reservation.id,
                                    "COMPLETED"
                                  )
                                }
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
