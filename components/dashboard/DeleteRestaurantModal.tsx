"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  location: string;
  _count: {
    tables: number;
    reservations: number;
  };
}

interface DeleteRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantDeleted: () => void;
  restaurant: Restaurant | null;
}

export default function DeleteRestaurantModal({
  isOpen,
  onClose,
  onRestaurantDeleted,
  restaurant,
}: DeleteRestaurantModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !restaurant) return null;

  const handleDelete = async () => {
    if (confirmText !== restaurant.name) {
      setError("Restaurant name doesn't match");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: restaurant.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message if there were active reservations cancelled
        if (data.deletedRestaurant?.activeReservationsCancelled > 0) {
          alert(
            `Restaurant deleted successfully. ${data.deletedRestaurant.activeReservationsCancelled} active reservations were automatically cancelled.`
          );
        }
        onRestaurantDeleted();
        onClose();
      } else {
        setError(data.error || "Failed to delete restaurant");
      }
    } catch (error) {
      setError("An error occurred while deleting the restaurant");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Delete Restaurant
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {restaurant.name}
              </span>{" "}
              and all its related data.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                This action will delete:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Restaurant profile and settings</li>
                <li>• All tables ({restaurant._count.tables} tables)</li>
                <li>
                  • All reservations ({restaurant._count.reservations}{" "}
                  reservations)
                </li>
                <li>• All staff/receptionist assignments</li>
                <li>• All payments and billing data</li>
                <li>• All restaurant images and data</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                Active Reservations:
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Any active future reservations will be automatically{" "}
                <strong>cancelled</strong> before deletion. Customers with
                cancelled reservations will need to be notified separately.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Warning:</strong> This action cannot be undone. The
                restaurant owner account will remain active but lose access to
                this restaurant.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type the restaurant name to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={restaurant.name}
              disabled={isDeleting}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== restaurant.name}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Restaurant
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
