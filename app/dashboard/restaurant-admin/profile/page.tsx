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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getDistrictsByRegion,
  uzbekistanRegions,
} from "@/lib/uzbekistan-regions";
import {
  ArrowLeft,
  Building,
  Camera,
  Clock,
  MapPin,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  region?: string;
  district?: string;
  address?: string;
  mapLink?: string;
  phone: string;
  email: string;
  website: string;
  images: string;
  openingHours: string;
  priceRange: string;
  cuisine: string;
  capacity: number;
  isActive: boolean;
  isFeatured: boolean;
}

export default function RestaurantProfilePage() {
  const { data: session, status } = useSession();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    region: "",
    district: "",
    address: "",
    mapLink: "",
    phone: "",
    email: "",
    website: "",
    openingHours: "",
    priceRange: "",
    cuisine: "",
    capacity: 0,
    isActive: true,
    isFeatured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<
    Array<{ id: string; name: string; nameUz: string }>
  >([]);

  const saveImagesToDatabase = async (imageList: string[]) => {
    try {
      console.log("Saving images to database:", imageList);
      const requestBody = {
        ...formData,
        images: JSON.stringify(imageList),
      };
      console.log("Request body:", requestBody);

      const response = await fetch("/api/restaurants/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save images - response:", errorData);
        throw new Error("Failed to save images to database");
      }

      const result = await response.json();
      console.log("Images saved successfully:", result);
    } catch (error) {
      console.error("Error saving images to database:", error);
      throw error;
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch("/api/restaurants/profile");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched restaurant data:", data);
        console.log("Images data:", data.images, typeof data.images);
        setRestaurant(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          region: data.region || "",
          district: data.district || "",
          address: data.address || "",
          mapLink: data.mapLink || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          openingHours: data.openingHours || "",
          priceRange: data.priceRange || "",
          cuisine: data.cuisine || "",
          capacity: data.capacity || 0,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
        });

        // Set initial districts if region is already selected
        if (data.region) {
          const districts = getDistrictsByRegion(data.region);
          setAvailableDistricts(districts);
        }
        // Handle images - they might be stored as JSON string or already be an array
        if (data.images) {
          try {
            if (typeof data.images === "string") {
              const parsedImages = JSON.parse(data.images);
              setImages(Array.isArray(parsedImages) ? parsedImages : []);
            } else if (Array.isArray(data.images)) {
              setImages(data.images);
            } else {
              setImages([]);
            }
          } catch (error) {
            console.error("Error parsing images:", error);
            setImages([]);
          }
        } else {
          setImages([]);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRestaurantData();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegionChange = (regionId: string) => {
    setFormData((prev) => ({
      ...prev,
      region: regionId,
      district: "", // Reset district when region changes
    }));

    // Update available districts based on selected region
    const districts = getDistrictsByRegion(regionId);
    setAvailableDistricts(districts);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingImages(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/restaurants/upload-images", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = [...images, ...data.imageUrls];
        setImages(newImages);

        // Save the updated images to the database immediately
        await saveImagesToDatabase(newImages);

        setToast({
          type: "success",
          message: `${data.imageUrls.length} image(s) uploaded successfully`,
        });
      } else {
        setToast({ type: "error", message: "Failed to upload images" });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setToast({ type: "error", message: "Error uploading images" });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    // Add to deleting set to show loading state
    setDeletingImages((prev) => new Set(prev).add(index));

    try {
      // Remove from local state first
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);

      // Save to database
      await saveImagesToDatabase(updatedImages);

      // Delete the actual file
      const response = await fetch(
        `/api/restaurants/upload-images?imageUrl=${encodeURIComponent(
          imageUrl
        )}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setToast({ type: "success", message: "Image deleted successfully" });
      } else {
        console.error("Failed to delete image file");
        setToast({ type: "error", message: "Failed to delete image file" });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setToast({ type: "error", message: "Error deleting image" });
    } finally {
      // Remove from deleting set
      setDeletingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/restaurants/profile", {
        method: restaurant ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: JSON.stringify(images),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        setToast({ type: "success", message: "Profile saved successfully" });
      } else {
        setToast({ type: "error", message: "Failed to save profile" });
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      setToast({ type: "error", message: "Error saving profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

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
                Restaurant Profile
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage your restaurant information and settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {restaurant && (
              <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                {restaurant.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="images">Images & Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Restaurant Details
                  </CardTitle>
                  <CardDescription>
                    Basic information about your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your restaurant"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cuisine">Cuisine Type</Label>
                    <Select
                      value={formData.cuisine}
                      onValueChange={(value) =>
                        handleInputChange("cuisine", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="mediterranean">
                          Mediterranean
                        </SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select
                      value={formData.priceRange}
                      onValueChange={(value) =>
                        handleInputChange("priceRange", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                        <SelectItem value="$$$$">
                          $$$$ - Very Expensive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Contact & Location
                  </CardTitle>
                  <CardDescription>
                    How customers can reach and find you. Select region and
                    district for better searchability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Select
                        value={formData.region}
                        onValueChange={handleRegionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {uzbekistanRegions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name} ({region.nameUz})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="district">District</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) =>
                          handleInputChange("district", value)
                        }
                        disabled={!formData.region}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formData.region
                                ? "Select region first"
                                : "Select district"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name} ({district.nameUz})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Enter detailed street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">
                      Legacy Address (Backward Compatibility)
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter full address"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This field is kept for backward compatibility
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="mapLink">Map Link</Label>
                    <Input
                      id="mapLink"
                      value={formData.mapLink}
                      onChange={(e) =>
                        handleInputChange("mapLink", e.target.value)
                      }
                      placeholder="https://maps.google.com/... or https://yandex.uz/maps/..."
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Link to Google Maps, Yandex Maps, or other map service
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="restaurant@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://www.restaurant.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Operating Hours & Capacity
                </CardTitle>
                <CardDescription>
                  When you're open and how many guests you can serve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openingHours">Opening Hours</Label>
                    <Textarea
                      id="openingHours"
                      value={formData.openingHours}
                      onChange={(e) =>
                        handleInputChange("openingHours", e.target.value)
                      }
                      placeholder="Mon-Fri: 11:00 AM - 10:00 PM&#10;Sat-Sun: 10:00 AM - 11:00 PM"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Total Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange(
                          "capacity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Maximum number of guests"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images & Media Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Restaurant Images
                </CardTitle>
                <CardDescription>
                  Upload photos of your restaurant, food, and ambiance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="imageUpload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-12 w-12 text-slate-400" />
                      <div>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                          {uploadingImages
                            ? "Uploading..."
                            : "Click to upload images"}
                        </p>
                        <p className="text-sm text-slate-500">
                          PNG, JPG, WebP up to 10MB each
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Restaurant image ${index + 1}`}
                              width={200}
                              height={200}
                              className={`w-full h-full object-cover transition-opacity ${
                                deletingImages.has(index) ? "opacity-50" : ""
                              }`}
                              onError={() => {
                                console.error("Failed to load image:", image);
                              }}
                              onLoad={() => {
                                console.log(
                                  "Image loaded successfully:",
                                  image
                                );
                              }}
                            />
                          </div>
                          {deletingImages.has(index) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            disabled={deletingImages.has(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                            {image}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Debug info */}
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Debug Info:
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Images count: {images.length}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Images array: {JSON.stringify(images)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>
                  Configure your restaurant's operational settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Restaurant Active
                    </Label>
                    <p className="text-sm text-slate-500">
                      Allow customers to make reservations
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Featured Restaurant
                    </Label>
                    <p className="text-sm text-slate-500">
                      Highlight your restaurant in search results
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      handleInputChange("isFeatured", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
