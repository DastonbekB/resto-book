"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface SignOutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  variant = "outline",
  size = "sm",
  className,
  children,
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent double clicks

    try {
      setIsSigningOut(true);

      // Sign out using NextAuth
      await signOut({
        redirect: false, // Don't redirect automatically
        callbackUrl: "/login", // Where to redirect after signout
      });

      // Small delay to ensure signout is processed
      setTimeout(() => {
        router.push("/login");
      }, 100);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect to login in case of error
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {children ? (
        children
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </>
      )}
    </Button>
  );
}
