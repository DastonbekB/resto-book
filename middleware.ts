import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't need authentication
    const publicRoutes = [
      "/",
      "/restaurants",
      "/login",
      "/signup",
      "/api/restaurants",
      "/uploads",
    ];
    const isPublicRoute = publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith("/restaurants/") ||
        pathname.startsWith("/api/restaurants/") ||
        pathname.startsWith("/uploads/")
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Protected routes based on roles
    const roleRoutes = {
      "/dashboard/super": ["SUPER_ADMIN"],
      "/dashboard/restaurant-admin": ["RESTAURANT_ADMIN"],
      "/dashboard/reception-admin": ["RECEPTION_ADMIN"],
      "/dashboard/customer": ["CUSTOMER"],
      "/api/admin": ["SUPER_ADMIN"],
      "/api/restaurant-admin": ["RESTAURANT_ADMIN", "SUPER_ADMIN"],
      "/api/reception": ["RECEPTION_ADMIN", "RESTAURANT_ADMIN", "SUPER_ADMIN"],
    };

    // No longer redirect customers away from their dashboard
    // They can access it if they specifically navigate to it
    // but the default login redirect goes to /restaurants

    // Check if the current path requires specific roles
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route)) {
        if (!token?.role || !allowedRoles.includes(token.role as string)) {
          // Redirect to appropriate dashboard based on user's role
          let redirectPath = "/login";
          if (token?.role) {
            if (token.role === "CUSTOMER") {
              redirectPath = "/restaurants";
            } else {
              redirectPath = `/dashboard/${token.role
                .toLowerCase()
                .replace("_", "-")}`;
            }
          }

          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        const publicRoutes = [
          "/",
          "/restaurants",
          "/login",
          "/signup",
          "/api/restaurants",
          "/uploads",
        ];
        const isPublicRoute = publicRoutes.some(
          (route) =>
            pathname === route ||
            pathname.startsWith("/restaurants/") ||
            pathname.startsWith("/api/restaurants/") ||
            pathname.startsWith("/uploads/")
        );

        if (isPublicRoute) return true;

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
};
