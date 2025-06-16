"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "../assets/logo.svg"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDistrictsByRegion,
  uzbekistanRegions,
} from "@/lib/uzbekistan-regions";
import {
  Calendar,
  Search,
  Star,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  images: string[];
  priceRange: string;
  cuisine: string;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  totalCapacity: number;
  openingHours: string;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<
    Array<{ id: string; name: string; nameUz: string }>
  >([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchFeaturedRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants?featured=true");
      const data = await response.json();

      if (response.ok) {
        // Take only first 6 featured restaurants for the homepage
        setFeaturedRestaurants(data.restaurants.slice(0, 6));
      } else {
        console.error("Failed to fetch featured restaurants:", data.error);
      }
    } catch (error) {
      console.error("Error fetching featured restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedRestaurants();
  }, []);

  const handleRegionChange = (regionId: string) => {
    setRegion(regionId);
    setDistrict(""); // Reset district when region changes

    // Update available districts based on selected region
    const districts = getDistrictsByRegion(regionId);
    setAvailableDistricts(districts);
  };

  const handleSearch = () => {
    // Build search URL with parameters
    const params = new URLSearchParams();

    // Add location-based search if district selected
    if (district) {
      const districtData = availableDistricts.find((d) => d.id === district);
      if (districtData) {
        // Use district parameter for district search
        params.append("district", districtData.name);
      }
    } else if (region) {
      // If only region selected, use region parameter for region search
      const regionData = uzbekistanRegions.find((r) => r.id === region);
      if (regionData) {
        params.append("region", regionData.name);
      }
    }

    // Add other filters if needed in the future
    // if (date) params.append("date", date);
    // if (time) params.append("time", time);
    // if (partySize) params.append("partySize", partySize);

    // Navigate to restaurants page with search parameters
    router.push(`/restaurants?${params.toString()}`);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <img className="w-[160px]" src={logo.src}/> 
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/restaurants"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Restaurants
            </Link>
            <Link
              href="/pricing"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 dark:text-slate-300">
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
                      Account
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
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center space-x-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/restaurants"
                      className="flex items-center gap-2 w-full"
                    >
                      <Search className="h-4 w-4" />
                      Restaurants
                    </Link>
                  </DropdownMenuItem>
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
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Your Perfect
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {" "}
              Dining Experience
            </span>
            <br />
            Awaits
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Discover amazing restaurants, book tables instantly, and enjoy
            seamless dining experiences. RestoBook connects food lovers with
            their next memorable meal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/restaurants">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Explore Restaurants
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Join as Restaurant Owner
              </Button>
            </Link>
          </div>

          {/* Quick Search */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Region
                </label>
                <Select value={region} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {uzbekistanRegions.map((regionItem) => (
                      <SelectItem key={regionItem.id} value={regionItem.id}>
                        {regionItem.name} ({regionItem.nameUz})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  District
                </label>
                <Select
                  value={district}
                  onValueChange={setDistrict}
                  disabled={!region}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !region ? "Select region first" : "Select district"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((districtItem) => (
                      <SelectItem key={districtItem.id} value={districtItem.id}>
                        {districtItem.name} ({districtItem.nameUz})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date & Time (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                  <input
                    type="datetime-local"
                    value={date && time ? `${date}T${time}` : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [dateValue, timeValue] =
                          e.target.value.split("T");
                        setDate(dateValue);
                        setTime(timeValue);
                      } else {
                        setDate("");
                        setTime("");
                      }
                    }}
                    min={getMinDateTime()}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Party Size (Optional)
                </label>
                <Select value={partySize} onValueChange={setPartySize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="w-full md:w-auto px-8"
                onClick={handleSearch}
                disabled={!region} // Require at least region selection
              >
                <Search className="mr-2 h-5 w-5" />
                Find Restaurants
              </Button>
              {!region && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Please select a region to search for restaurants
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Featured Restaurants
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover our hand-picked selection of exceptional dining
              experiences
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : featuredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No featured restaurants yet
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Check back soon for our featured dining experiences
              </p>
              <Link href="/restaurants">
                <Button>Browse All Restaurants</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="relative">
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 overflow-hidden">
                      {restaurant.images.length > 0 ? (
                        <Image
                          src={restaurant.images[0]}
                          alt={restaurant.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
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

                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {restaurant.location}
                        </div>
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

                  <CardContent className="pt-0">
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

                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Up to {restaurant.totalCapacity} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{restaurant.openingHours || "Check hours"}</span>
                      </div>
                    </div>

                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        View Details & Book
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/restaurants">
              <Button variant="outline" size="lg">
                View All Restaurants
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose RestoBook?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We make dining out effortless with innovative features designed
              for both diners and restaurants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Easy Discovery
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Find the perfect restaurant based on your location, cuisine
                preferences, and availability.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Instant Booking
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Reserve your table in seconds with real-time availability and
                instant confirmation.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Quality Assurance
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                All restaurants are verified and reviewed to ensure you have the
                best dining experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Dining?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers who trust RestoBook for their dining
            reservations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-orange-500 hover:bg-white hover:text-orange-500"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RB</span>
                </div>
                <span className="text-xl font-bold">RestoBook</span>
              </div>
              <p className="text-slate-400">
                Making dining reservations simple and enjoyable for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Diners</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/restaurants"
                    className="hover:text-white transition-colors"
                  >
                    Find Restaurants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Restaurants</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Join RestoBook
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Restaurant Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a
                    href="mailto:support@restobook.com"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 RestoBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
