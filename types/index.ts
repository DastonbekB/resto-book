import {
  User,
  Restaurant,
  Table,
  Reservation,
  ReceptionistAssignment,
} from "@prisma/client";

export type UserRole =
  | "SUPER_ADMIN"
  | "RESTAURANT_ADMIN"
  | "RECEPTION_ADMIN"
  | "CUSTOMER";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface RestaurantWithDetails extends Restaurant {
  owner: User;
  tables: Table[];
  _count: {
    reservations: number;
  };
}

export interface ReservationWithDetails extends Reservation {
  user: User;
  restaurant: Restaurant;
  table?: Table | null;
}

export interface UserWithReservations extends User {
  reservations: ReservationWithDetails[];
}

export interface DashboardStats {
  totalReservations: number;
  todayReservations: number;
  totalRevenue: number;
  activeRestaurants: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reservedCount: number;
}

export interface RestaurantSearchFilters {
  location?: string;
  cuisine?: string;
  priceRange?: string;
  date?: string;
  time?: string;
  partySize?: number;
}
