"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Upload,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  uzbekistanRegions,
  getDistrictsByRegion,
  formatFullAddress,
} from "@/lib/uzbekistan-regions";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded: () => void;
}

export default function AddRestaurantModal({
  isOpen,
  onClose,
  onRestaurantAdded,
}: AddRestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    images: "",
    featured: false,
    mapLink: "",
    region: "",
    district: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show credentials if provided
        if (data.ownerCredentials) {
          alert(
            `Restaurant created successfully!\n\nOwner Credentials:\nEmail: ${data.ownerCredentials.email}\nTemporary Password: ${data.ownerCredentials.temporaryPassword}\n\nPlease share these credentials with the restaurant owner and ask them to change the password on first login.`
          );
        }
        onRestaurantAdded();
        onClose();
        // Reset form
        setFormData({
          name: "",
          description: "",
          address: "",
          phone: "",
          email: "",
          openingHours: "",
          images: "",
          featured: false,
          mapLink: "",
          region: "",
          district: "",
        });
      } else {
        // Handle validation errors
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: { path: string[]; message: string }) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Failed to create restaurant" });
        }
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      setErrors({ general: "Failed to create restaurant" });
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add New Restaurant
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create a new restaurant listing
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Name */}
            <div className="md:col-span-2">
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
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
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
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
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
                required
              >
                <option value="">Select Region</option>
                {uzbekistanRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-red-600 text-sm mt-1">{errors.region}</p>
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
                required
                disabled={!formData.region}
              >
                <option value="">Select District</option>
                {formData.region &&
                  getDistrictsByRegion(formData.region).map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
              </select>
              {errors.district && (
                <p className="text-red-600 text-sm mt-1">{errors.district}</p>
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
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
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
                <p className="text-red-600 text-sm mt-1">{errors.mapLink}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Optional: Link to Google Maps or other map service
              </p>
            </div>
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
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                  errors.images
                    ? "border-red-300 dark:border-red-600"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              />
            </div>
            {errors.images && (
              <p className="text-red-600 text-sm mt-1">{errors.images}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Optional: Enter image URLs separated by commas
            </p>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-600 bg-slate-100 border-slate-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Mark as Featured Restaurant
            </label>
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
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Create Restaurant
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
