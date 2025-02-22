"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Tasks from "@/components/Tasks";

export default function HomePage() {
  const { token, logout, initialized } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      // Only verify the token after initialization
      if (!initialized) return;
      // If no token, redirect to login immediately
      if (!token) {
        console.log("No token found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        // Call your backend verification endpoint
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          // Token is invalid: clear it and redirect to login
          logout();
          router.push("/login");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        logout();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router, logout]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  } else {
    return <Tasks />;
  }
}
