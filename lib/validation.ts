import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Restaurant schemas
export const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  description: z.string().optional(),
  // Legacy location field for backward compatibility
  location: z.string().optional(),
  // New structured address fields
  region: z.string().min(1, "Region is required"),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
  mapLink: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  priceRange: z.string().optional(),
  cuisine: z.string().optional(),
  capacity: z.number().min(1).optional(),
});

// Table schemas
export const tableSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

// Reservation schemas
export const reservationSchema = z.object({
  restaurantId: z.string().cuid(),
  date: z.date(),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  partySize: z
    .number()
    .min(1, "Party size must be at least 1")
    .max(20, "Party size cannot exceed 20"),
  specialNotes: z.string().optional(),
});

export const updateReservationSchema = z.object({
  date: z.date().optional(),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),
  partySize: z.number().min(1).max(20).optional(),
  specialNotes: z.string().optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
});

// User management schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum([
    "SUPER_ADMIN",
    "RESTAURANT_ADMIN",
    "RECEPTION_ADMIN",
    "CUSTOMER",
  ]),
});

export const assignReceptionistSchema = z.object({
  userId: z.string().cuid(),
  restaurantId: z.string().cuid(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type TableInput = z.infer<typeof tableSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AssignReceptionistInput = z.infer<typeof assignReceptionistSchema>;
