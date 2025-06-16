"use client";

import { Button } from "@/components/ui/button";
import {
  formatFullAddress,
  getDistrictsByRegion,
  uzbekistanRegions,
} from "@/lib/uzbekistan-regions";
import {
  Building,
  CheckCircle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Save,
  Star,
  X,
} from "lucide-react";
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
  openingHours: string | null;
  images: string;
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

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantUpdated: () => void;
  restaurant: Restaurant | null;
}

export default function EditRestaurantModal({
  isOpen,
  onClose,
  onRestaurantUpdated,
  restaurant,
}: EditRestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    website: "",
    cuisine: "",
    priceRange: "",
    capacity: "",
    openingHours: "",
    images: "",
    isActive: true,
    isFeatured: false,
    mapLink: "",
    region: "",
    district: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (restaurant && isOpen) {
      // Try to parse existing location into region/district format
      // For backward compatibility, we'll keep the old location field as fallback
      setFormData({
        name: restaurant.name,
        description: restaurant.description || "",
        location: restaurant.location,
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || "",
        cuisine: restaurant.cuisine || "",
        priceRange: restaurant.priceRange || "",
        capacity: restaurant.capacity?.toString() || "",
        openingHours: restaurant.openingHours || "",
        images: restaurant.images || "",
        isActive: restaurant.isActive,
        isFeatured: restaurant.isFeatured,
        mapLink: "",
        region: "",
        district: "",
        address: "",
      });
      setErrors({});
    }
  }, [restaurant, isOpen]);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        onRestaurantUpdated();
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
          setErrors({ general: data.error || "Failed to update restaurant" });
        }
      }
    } catch (error) {
      console.error("Error updating restaurant:", error);
      setErrors({ general: "Failed to update restaurant" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      // Reset district when region changes
      if (name === "region") {
        return { ...prev, [name]: newValue as string, district: "" };
      }
      return { ...prev, [name]: newValue };
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Edit Restaurant
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Update restaurant information
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {errors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Restaurant Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter restaurant name"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
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

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the restaurant, cuisine, ambiance..."
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                        errors.description
                          ? "border-red-300 dark:border-red-600"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                      required
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Location Selection */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Location
                    </h4>

                    {/* Region Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Region
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.region
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        <option value="">Select Region</option>
                        {uzbekistanRegions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    {/* District Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        District
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.district
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                        disabled={!formData.region}
                      >
                        <option value="">Select District</option>
                        {formData.region &&
                          getDistrictsByRegion(formData.region).map(
                            (district) => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            )
                          )}
                      </select>
                      {errors.district && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street name, building number"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                            errors.address
                              ? "border-red-300 dark:border-red-600"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                      {formData.region && formData.district && (
                        <p className="text-xs text-slate-500 mt-1">
                          Full address:{" "}
                          {formatFullAddress(
                            formData.region,
                            formData.district,
                            formData.address || "Restaurant location"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Legacy Location Field (for backward compatibility) */}
                    {formData.location && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Legacy Location (read-only)
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                          readOnly
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          This is the old location format. Please select region
                          and district above to use the new format.
                        </p>
                      </div>
                    )}

                    {/* Map Link */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Map Link
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="url"
                          name="mapLink"
                          value={formData.mapLink}
                          onChange={handleInputChange}
                          placeholder="https://maps.google.com/..."
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                            errors.mapLink
                              ? "border-red-300 dark:border-red-600"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        />
                      </div>
                      {errors.mapLink && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.mapLink}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Optional: Link to Google Maps or other map service
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {/* Email */}
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
                        placeholder="restaurant@example.com"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.email
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.phone
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.restaurant.com"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Restaurant Details */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Restaurant Details
                </h3>
                <div className="space-y-4">
                  {/* Cuisine & Price Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        placeholder="Italian, Mexican, etc."
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Price Range
                      </label>
                      <select
                        name="priceRange"
                        value={formData.priceRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">Select range</option>
                        <option value="$">$ - Budget</option>
                        <option value="$$">$$ - Moderate</option>
                        <option value="$$$">$$$ - Expensive</option>
                        <option value="$$$$">$$$$ - Very Expensive</option>
                      </select>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Capacity (seats)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="50"
                      min="1"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Operating Hours
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="openingHours"
                        value={formData.openingHours}
                        onChange={handleInputChange}
                        placeholder="e.g., Mon-Fri: 9:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter operating hours in a readable format
                    </p>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Restaurant Images
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="images"
                        value={formData.images}
                        onChange={handleInputChange}
                        placeholder="Image URLs separated by commas"
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter image URLs separated by commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Settings */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Status & Settings
                </h3>
                <div className="space-y-4">
                  {/* Active Status */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <label
                      htmlFor="isActive"
                      className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Restaurant is Active
                    </label>
                  </div>

                  {/* Featured Status */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-yellow-600 bg-slate-100 border-slate-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <Star className="w-4 h-4 mr-2 text-yellow-600" />
                      Featured Restaurant
                    </label>
                  </div>
                </div>
              </div>

              {/* Restaurant Stats */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Restaurant Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {restaurant._count.tables}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Tables
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {restaurant._count.reservations}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Reservations
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Owner: {restaurant.owner.name || restaurant.owner.email}
                  <br />
                  Created: {new Date(restaurant.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
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
