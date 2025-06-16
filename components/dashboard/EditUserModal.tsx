"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, User, Mail, Shield, Building, Users, Save } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: string | null;
  _count: {
    reservations: number;
    ownedRestaurants: number;
    receptionistAssignments: number;
  };
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
  currentUserId?: string;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  currentUserId,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "CUSTOMER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        email: user.email,
        role: user.role,
      });
      setErrors({});
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        onUserUpdated();
        onClose();
      } else {
        // Handle validation errors
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: { path: string[]; message: string }) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Failed to update user" });
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setErrors({ general: "Failed to update user" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "RESTAURANT_ADMIN":
        return <Building className="h-4 w-4 text-orange-600" />;
      case "RECEPTION_ADMIN":
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Edit User
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Update user information
                {isCurrentUser && " (Your Account)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {errors.general}
              </p>
            </div>
          )}

          {/* Warning for current user */}
          {isCurrentUser && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Warning:</strong> You are editing your own account. Be
                careful when changing your role as it may affect your access.
              </p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                  errors.name
                    ? "border-red-300 dark:border-red-600"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                required
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                  errors.email
                    ? "border-red-300 dark:border-red-600"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              User Role
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                {getRoleIcon(formData.role)}
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="RECEPTION_ADMIN">Reception Admin</option>
                <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Role Description */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {formData.role === "SUPER_ADMIN" &&
                "Full system access - can manage all users and restaurants"}
              {formData.role === "RESTAURANT_ADMIN" &&
                "Restaurant owner - can manage their own restaurant"}
              {formData.role === "RECEPTION_ADMIN" &&
                "Reception staff - can manage reservations"}
              {formData.role === "CUSTOMER" &&
                "Regular user - can make reservations"}
            </p>
          </div>

          {/* User Stats */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              User Activity
            </h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {user._count.reservations}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Reservations
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {user._count.ownedRestaurants}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Restaurants
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {user._count.receptionistAssignments || 0}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Assignments
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
