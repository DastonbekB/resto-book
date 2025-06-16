"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logo from "../assets/logo.svg" 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Reservation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
    location: string;
  };
  table: {
    id: string;
    number: string;
    capacity: number;
  } | null;
  date: string;
  time: string;
  partySize: number;
  status: string;
  specialNotes?: string;
  createdAt: string;
}

interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
}

export default function ReceptionReservationsPage() {
  const { data: session, status } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [showManualBookingDialog, setShowManualBookingDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);

  // Manual booking form state
  const [manualBooking, setManualBooking] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    time: "",
    partySize: 1,
    tableId: "",
    specialNotes: "",
  });

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantInfo = async () => {
    try {
      const response = await fetch("/api/reception/restaurant-info");
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
        setAvailableTables(data.tables || []);
      }
    } catch (error) {
      console.error("Error fetching restaurant info:", error);
    }
  };
  const filterReservations = () => {
    let filtered = reservations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.user.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.user.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (reservation) => reservation.status === statusFilter
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((reservation) => {
        const reservationDate = new Date(reservation.date)
          .toISOString()
          .split("T")[0];
        return reservationDate === dateFilter;
      });
    }

    setFilteredReservations(filtered);
  };
  useEffect(() => {
    if (session?.user?.id) {
      fetchReservations();
      fetchRestaurantInfo();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter, dateFilter]);

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

  const updateReservationStatus = async (
    reservationId: string,
    newStatus: string
  ) => {
    try {
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

      if (response.ok) {
        await fetchReservations();
      } else {
        alert("Failed to update reservation status");
      }
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert("Error updating reservation status");
    }
  };

  const createManualBooking = async () => {
    try {
      const response = await fetch("/api/reception/manual-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...manualBooking,
          restaurantId: restaurant?.id,
        }),
      });

      if (response.ok) {
        setShowManualBookingDialog(false);
        resetManualBookingForm();
        await fetchReservations();
        alert("Manual booking created successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create manual booking");
      }
    } catch (error) {
      console.error("Error creating manual booking:", error);
      alert("Error creating manual booking");
    }
  };

  const resetManualBookingForm = () => {
    setManualBooking({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      date: "",
      time: "",
      partySize: 1,
      tableId: "",
      specialNotes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
      CONFIRMED: { color: "bg-green-100 text-green-700", label: "Confirmed" },
      CHECKED_IN: { color: "bg-blue-100 text-blue-700", label: "Checked In" },
      COMPLETED: { color: "bg-gray-100 text-gray-700", label: "Completed" },
      CANCELLED: { color: "bg-red-100 text-red-700", label: "Cancelled" },
      NO_SHOW: { color: "bg-orange-100 text-orange-700", label: "No Show" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard/reception-admin">
              <img className="w-[160px]" src={logo.src}/>
              </Link>

              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Reception Admin
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {restaurant?.name} - Welcome, {session.user.name}!
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Reservation Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage customer reservations and bookings
            </p>
          </div>

          <Dialog
            open={showManualBookingDialog}
            onOpenChange={setShowManualBookingDialog}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                <Plus className="mr-2 h-4 w-4" />
                Manual Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Manual Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name*</label>
                  <Input
                    value={manualBooking.customerName}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Email*</label>
                  <Input
                    type="email"
                    value={manualBooking.customerEmail}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="Enter customer email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={manualBooking.customerPhone}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date*</label>
                  <Input
                    type="date"
                    value={manualBooking.date}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        date: e.target.value,
                      })
                    }
                    min={getMinDate()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time*</label>
                  <Input
                    type="time"
                    value={manualBooking.time}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Party Size*</label>
                  <Select
                    value={manualBooking.partySize.toString()}
                    onValueChange={(value) =>
                      setManualBooking({
                        ...manualBooking,
                        partySize: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Table</label>
                  <Select
                    value={manualBooking.tableId}
                    onValueChange={(value) =>
                      setManualBooking({ ...manualBooking, tableId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.number} (Capacity: {table.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Special Notes</label>
                  <Textarea
                    value={manualBooking.specialNotes}
                    onChange={(e) =>
                      setManualBooking({
                        ...manualBooking,
                        specialNotes: e.target.value,
                      })
                    }
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowManualBookingDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createManualBooking}
                  disabled={
                    !manualBooking.customerName ||
                    !manualBooking.customerEmail ||
                    !manualBooking.date ||
                    !manualBooking.time
                  }
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  Create Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Actions
              </label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Reservations ({filteredReservations.length})
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No reservations found
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {searchTerm || statusFilter !== "ALL" || dateFilter
                    ? "Try adjusting your filters"
                    : "No reservations available"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.user.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {reservation.user.email}
                            </div>
                            <div className="text-xs text-slate-400">
                              ID: {reservation.id.slice(-8)}
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
                            <div>
                              <div className="font-medium">
                                Table {reservation.table.number}
                              </div>
                              <div className="text-sm text-slate-500">
                                Capacity: {reservation.table.capacity}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              No table assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{reservation.partySize} guests</TableCell>
                        <TableCell>
                          {getStatusBadge(reservation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
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
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "CANCELLED"
                                    )
                                  }
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {reservation.status === "CONFIRMED" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "CHECKED_IN"
                                    )
                                  }
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  Check In
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "NO_SHOW"
                                    )
                                  }
                                  className="text-orange-500 border-orange-500 hover:bg-orange-50"
                                >
                                  No Show
                                </Button>
                              </>
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
                                className="bg-gray-500 hover:bg-gray-600"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
