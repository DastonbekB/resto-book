"use client";

import AddRestaurantModal from "@/components/dashboard/AddRestaurantModal";
import ChangeOwnerModal from "@/components/dashboard/ChangeOwnerModal";
import DeleteRestaurantModal from "@/components/dashboard/DeleteRestaurantModal";
import EditRestaurantModal from "@/components/dashboard/EditRestaurantModal";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import {
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisine: string | null;
  priceRange: string | null;
  capacity: number | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    tables: number;
    reservations: number;
  };
}

interface RestaurantStats {
  total: number;
  averageCapacity: number | null;
  statusBreakdown: Array<{
    isActive: boolean;
    isFeatured: boolean;
    _count: number;
  }>;
}

export default function RestaurantsManagementPage() {
  const { data: session, status } = useSession();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [owners, setOwners] = useState<
    Array<{ id: string; name: string | null; email: string }>
  >([]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(isActiveFilter && { isActive: isActiveFilter }),
        ...(isFeaturedFilter && { isFeatured: isFeaturedFilter }),
        ...(ownerFilter && { ownerId: ownerFilter }),
      });

      const response = await fetch(`/api/admin/restaurants?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRestaurants(data.restaurants);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      } else {
        console.error("Error fetching restaurants:", data.error);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/admin/restaurants/change-owner");
      const data = await response.json();
      if (response.ok) {
        setOwners(data.owners);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "SUPER_ADMIN") {
      fetchRestaurants();
      fetchOwners();
    }
  }, [
    currentPage,
    searchTerm,
    isActiveFilter,
    isFeaturedFilter,
    ownerFilter,
    session,
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
    return null; // Ensure component doesn't continue rendering
  }

  const handleUpdateRestaurant = async (
    id: string,
    updates: { isActive?: boolean; isFeatured?: boolean }
  ) => {
    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      if (response.ok) {
        fetchRestaurants(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update restaurant");
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("Failed to update restaurant");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    return isFeatured ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Star className="w-3 h-3 mr-1" />
        Featured
      </span>
    ) : null;
  };

  const activeCount =
    stats?.statusBreakdown.reduce(
      (acc, item) => acc + (item.isActive ? item._count : 0),
      0
    ) || 0;

  const featuredCount =
    stats?.statusBreakdown.reduce(
      (acc, item) => acc + (item.isFeatured ? item._count : 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/super"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Restaurant Management
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, {session.user.name}!
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Total Restaurants
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <Building className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Active Restaurants
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCount}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Featured Restaurants
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {featuredCount}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Avg. Capacity
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(stats.averageCapacity || 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search restaurants by name, location, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={isFeaturedFilter}
              onChange={(e) => setIsFeaturedFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Owners</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name || "No name"} - {owner.email}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-300 rounded w-1/3"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
                      </td>
                    </tr>
                  ))
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">
                        No restaurants found
                      </p>
                    </td>
                  </tr>
                ) : (
                  restaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {restaurant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {restaurant.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {restaurant.location}
                            </div>
                            {restaurant.cuisine && (
                              <div className="text-xs text-slate-400">
                                {restaurant.cuisine} • {restaurant.priceRange}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {restaurant.owner.name || "No name"}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {restaurant.owner.email}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setShowChangeOwnerModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Change Owner
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getStatusBadge(restaurant.isActive)}
                          {getFeaturedBadge(restaurant.isFeatured)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                        <div className="space-y-1">
                          <div>Tables: {restaurant._count.tables}</div>
                          <div>
                            Reservations: {restaurant._count.reservations}
                          </div>
                          <div className="text-xs text-slate-400">
                            Created:{" "}
                            {new Date(
                              restaurant.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRestaurant(restaurant);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                restaurant.isActive ? "outline" : "default"
                              }
                              onClick={() =>
                                handleUpdateRestaurant(restaurant.id, {
                                  isActive: !restaurant.isActive,
                                })
                              }
                              className={
                                restaurant.isActive
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {restaurant.isActive ? (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateRestaurant(restaurant.id, {
                                  isFeatured: !restaurant.isFeatured,
                                })
                              }
                              className={
                                restaurant.isFeatured
                                  ? "text-yellow-600 hover:text-yellow-700"
                                  : "text-gray-600 hover:text-gray-700"
                              }
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {restaurant.isFeatured ? "Unfeature" : "Feature"}
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRestaurant(restaurant);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Restaurant Modal */}
      <AddRestaurantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRestaurantAdded={fetchRestaurants}
      />

      {/* Edit Restaurant Modal */}
      <EditRestaurantModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRestaurant(null);
        }}
        onRestaurantUpdated={fetchRestaurants}
        restaurant={{
          ...selectedRestaurant,
          owner: selectedRestaurant?.owner,
          openingHours: "",
          images: "",
        }}
      />

      {/* Delete Restaurant Modal */}
      <DeleteRestaurantModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRestaurant(null);
        }}
        onRestaurantDeleted={fetchRestaurants}
        restaurant={selectedRestaurant}
      />

      {/* Change Owner Modal */}
      <ChangeOwnerModal
        isOpen={showChangeOwnerModal}
        onClose={() => {
          setShowChangeOwnerModal(false);
          setSelectedRestaurant(null);
        }}
        onOwnerChanged={fetchRestaurants}
        restaurant={selectedRestaurant}
      />
    </div>
  );
}
