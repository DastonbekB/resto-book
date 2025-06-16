"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  Heart,
  MapPin,
  Phone,
  Search,
  Star,
  Users,
  ChevronDown,
  User,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  images: string[];
  openingHours: string;
  priceRange: string;
  cuisine: string;
  capacity: number;
  isFeatured: boolean;
  owner: string;
  totalTables: number;
  totalCapacity: number;
  totalReservations: number;
  rating: number;
  reviews: number;
}

// Helper function to parse images from string array
const parseImages = (images: string[]): string[] => {
  if (!images || images.length === 0) return [];

  try {
    const parsedImages: string[] = [];

    // Check if we have a malformed JSON array split across multiple elements
    if (
      images.length > 1 &&
      images[0].startsWith("[") &&
      images[images.length - 1].endsWith("]")
    ) {
      // Reconstruct the JSON array string
      const jsonString = images.join(",");
      const parsed = JSON.parse(jsonString);
      parsedImages.push(...parsed);
    } else {
      // Handle normal cases
      images.forEach((img) => {
        if (typeof img === "string") {
          if (img.startsWith("[") && img.endsWith("]")) {
            // Single complete JSON array string
            const parsed = JSON.parse(img);
            parsedImages.push(...parsed);
          } else if (img.startsWith('"') && img.endsWith('"')) {
            // Remove quotes from individual image path
            parsedImages.push(img.slice(1, -1));
          } else if (img.startsWith("/") || img.startsWith("http")) {
            // Direct image path
            parsedImages.push(img);
          }
        }
      });
    }

    return parsedImages;
  } catch (error) {
    console.error("Error parsing images:", error);

    // Fallback: try to extract image paths manually
    const fallbackImages: string[] = [];
    images.forEach((img) => {
      if (typeof img === "string") {
        // Extract paths that look like image paths
        const matches = img.match(
          /\/uploads\/restaurants\/[^"]+\.(?:jpg|jpeg|png|webp|avif)/gi
        );
        if (matches) {
          fallbackImages.push(...matches);
        }
      }
    });

    return fallbackImages;
  }
};

// Image Carousel Component
const ImageCarousel = ({
  images,
  restaurantName,
  showCarousel = false,
}: {
  images: string[];
  restaurantName: string;
  showCarousel?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const parsedImages = parseImages(images);

  if (parsedImages.length === 0) {
    return (
      <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-400">
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {restaurantName.charAt(0)}
          </span>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % parsedImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + parsedImages.length) % parsedImages.length
    );
  };

  // Show carousel or just first image
  const displayImage = showCarousel
    ? parsedImages[currentIndex]
    : parsedImages[0];

  return (
    <div className="relative h-48 bg-slate-200 dark:bg-slate-600 overflow-hidden group">
      <Image
        src={displayImage}
        alt={`${restaurantName} - Restaurant Image ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        onLoad={() => {
          console.log("Carousel image loaded:", displayImage);
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          console.error("Carousel image failed:", displayImage);
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized
      />

      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 -z-10">
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {restaurantName.charAt(0)}
          </span>
        </div>
      </div>

      {/* Carousel Controls - only show if showCarousel is true and more than 1 image */}
      {showCarousel && parsedImages.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {parsedImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image counter - show when not using carousel */}
      {!showCarousel && parsedImages.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
          +{parsedImages.length - 1} more
        </div>
      )}

      {/* Current image indicator for carousel */}
      {showCarousel && parsedImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
          {currentIndex + 1}/{parsedImages.length}
        </div>
      )}
    </div>
  );
};

function RestaurantsContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [showFeatured, setShowFeatured] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cuisine && cuisine !== "all") params.append("cuisine", cuisine);
      if (location) params.append("location", location);
      if (priceRange && priceRange !== "all")
        params.append("priceRange", priceRange);
      if (showFeatured) params.append("featured", "true");

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setRestaurants(data.restaurants);
      } else {
        console.error("Failed to fetch restaurants:", data.error);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Read URL parameters on initial load
  useEffect(() => {
    if (!initialLoadDone) {
      const urlSearch = searchParams.get("search") || "";
      const urlCuisine = searchParams.get("cuisine") || "all";
      const urlLocation = searchParams.get("location") || "";
      const urlPriceRange = searchParams.get("priceRange") || "all";
      const urlFeatured = searchParams.get("featured") === "true";

      setSearch(urlSearch);
      setCuisine(urlCuisine);
      setLocation(urlLocation);
      setPriceRange(urlPriceRange);
      setShowFeatured(urlFeatured);
      setInitialLoadDone(true);
    }
  }, [searchParams, initialLoadDone]);

  // Update URL when filters change
  useEffect(() => {
    if (initialLoadDone) {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cuisine && cuisine !== "all") params.append("cuisine", cuisine);
      if (location) params.append("location", location);
      if (priceRange && priceRange !== "all")
        params.append("priceRange", priceRange);
      if (showFeatured) params.append("featured", "true");

      const newUrl = params.toString()
        ? `/restaurants?${params.toString()}`
        : "/restaurants";
      router.replace(newUrl, { scroll: false });

      fetchRestaurants();
    }
  }, [
    search,
    cuisine,
    location,
    priceRange,
    showFeatured,
    initialLoadDone,
    router,
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const toggleFavorite = (restaurantId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    setFavorites(newFavorites);
  };

  const getPriceDisplay = (priceRange: string) => {
    const ranges = {
      $: "$",
      $$: "$$",
      $$$: "$$$",
      $$$$: "$$$$",
    };
    return ranges[priceRange as keyof typeof ranges] || priceRange;
  };

  const cuisineOptions = [
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "French",
    "American",
    "Thai",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "Greek",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/restaurants" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                RestoBook
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm text-slate-600 dark:text-slate-300 hidden md:block">
                    Welcome, {session.user.name}!
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/customer"
                          className="flex items-center gap-2 w-full"
                        >
                          <Settings className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/customer/reservations"
                          className="flex items-center gap-2 w-full"
                        >
                          <Calendar className="h-4 w-4" />
                          My Reservations
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/customer/profile"
                          className="flex items-center gap-2 w-full"
                        >
                          <User className="h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/customer/quick-book"
                          className="flex items-center gap-2 w-full"
                        >
                          <Clock className="h-4 w-4" />
                          Quick Book
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        onClick={() => {
                          window.location.href = "/api/auth/signout";
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search restaurants, cuisine, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFeatured ? "default" : "outline"}
                onClick={() => setShowFeatured(!showFeatured)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Featured Only
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="Cuisine Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisineOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="$">$ - Budget Friendly</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCuisine("all");
                  setLocation("");
                  setPriceRange("all");
                  setShowFeatured(false);
                  router.replace("/restaurants", { scroll: false });
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Discover Amazing Restaurants
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {loading ? "Loading..." : `Found ${restaurants.length} restaurants`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No restaurants found
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setCuisine("all");
                setLocation("");
                setPriceRange("all");
                setShowFeatured(false);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700"
              >
                <div className="relative">
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-t-lg overflow-hidden">
                    {restaurant.images.length > 0 ? (
                      <Image
                        src={restaurant.images[0]}
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-opacity duration-300"
                        onLoad={() => {
                          console.log(
                            "Restaurant listing image loaded:",
                            restaurant.images[0]
                          );
                        }}
                        onError={(
                          e: React.SyntheticEvent<HTMLImageElement>
                        ) => {
                          console.error(
                            "Restaurant listing image failed:",
                            restaurant.images[0]
                          );
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                          <span className="text-sm text-slate-500">
                            No Image
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {restaurant.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(restaurant.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(restaurant.id)
                          ? "fill-red-500 text-red-500"
                          : "text-slate-500"
                      }`}
                    />
                  </Button>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {restaurant.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {restaurant.rating}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        ({restaurant.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisine && (
                      <Badge variant="secondary">{restaurant.cuisine}</Badge>
                    )}
                    {restaurant.priceRange && (
                      <Badge variant="outline">
                        {getPriceDisplay(restaurant.priceRange)}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Up to {restaurant.totalCapacity} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{restaurant.openingHours || "Check hours"}</span>
                    </div>
                  </div>

                  {(restaurant.phone || restaurant.website) && (
                    <div className="flex gap-2 mt-3">
                      {restaurant.phone && (
                        <Button variant="ghost" size="sm" className="p-2 h-8">
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                      {restaurant.website && (
                        <Button variant="ghost" size="sm" className="p-2 h-8">
                          <Globe className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      View Details & Book
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <RestaurantsContent />
    </Suspense>
  );
}
