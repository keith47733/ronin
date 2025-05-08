"use client";

import { useState, useEffect } from "react";

// useResponsiveLayout is a custom React hook for detecting if the app is in desktop or mobile mode.
// Returns true if the viewport is >= 1024px (Tailwind's lg breakpoint), false otherwise.
// Useful for conditionally rendering layouts or components based on screen size in a Next.js app.

/**
 * Custom hook for handling responsive layout
 *
 * @returns {boolean} isDesktop - true if viewport width is >= 1024px (lg breakpoint)
 */
export function useResponsiveLayout() {
  // Initialize with the current window width if available, otherwise default to desktop
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    // Handler for window resize
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}
