"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, X, Users, ArrowRight } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  location: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Owner {
  id: string;
  name: string | null;
  email: string;
  _count: {
    ownedRestaurants: number;
  };
}

interface ChangeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerChanged: () => void;
  restaurant: Restaurant | null;
}

export default function ChangeOwnerModal({
  isOpen,
  onClose,
  onOwnerChanged,
  restaurant,
}: ChangeOwnerModalProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [loadingOwners, setLoadingOwners] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOwners();
    }
  }, [isOpen]);

  const fetchOwners = async () => {
    setLoadingOwners(true);
    try {
      const response = await fetch("/api/admin/restaurants/change-owner");
      const data = await response.json();

      if (response.ok) {
        setOwners(data.owners);
      } else {
        setError("Failed to load owners");
      }
    } catch (error) {
      setError("Failed to load owners");
      console.error("Error fetching owners:", error);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleChangeOwner = async () => {
    if (!selectedOwnerId || !restaurant) {
      setError("Please select a new owner");
      return;
    }

    if (selectedOwnerId === restaurant.owner.id) {
      setError("Selected owner is already the current owner");
      return;
    }

    setIsChanging(true);
    setError("");

    try {
      const response = await fetch("/api/admin/restaurants/change-owner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          newOwnerId: selectedOwnerId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onOwnerChanged();
        onClose();
      } else {
        setError(data.error || "Failed to change owner");
      }
    } catch (error) {
      setError("An error occurred while changing owner");
      console.error("Change owner error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    if (!isChanging) {
      setSelectedOwnerId("");
      setError("");
      onClose();
    }
  };

  const selectedOwner = owners.find((owner) => owner.id === selectedOwnerId);

  if (!isOpen || !restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Change Restaurant Owner
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isChanging}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                Restaurant Details:
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>{restaurant.name}</strong> - {restaurant.location}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                Current Owner:
              </h4>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                <p>
                  <strong>{restaurant.owner.name || "No name"}</strong>
                </p>
                <p>{restaurant.owner.email}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Select New Owner:
            </label>

            {loadingOwners ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  Loading owners...
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {owners
                  .filter((owner) => owner.id !== restaurant.owner.id)
                  .map((owner) => (
                    <label
                      key={owner.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedOwnerId === owner.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="owner"
                        value={owner.id}
                        checked={selectedOwnerId === owner.id}
                        onChange={(e) => setSelectedOwnerId(e.target.value)}
                        disabled={isChanging}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {owner.name || "No name"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {owner.email}
                            </p>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {owner._count.ownedRestaurants} restaurants
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}

                {owners.filter((owner) => owner.id !== restaurant.owner.id)
                  .length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No other restaurant owners available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedOwner && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-green-600 dark:text-green-400">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Transfer ownership to:
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {selectedOwner.name || "No name"} ({selectedOwner.email})
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isChanging}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeOwner}
              disabled={isChanging || !selectedOwnerId || loadingOwners}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isChanging ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Change Owner
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
