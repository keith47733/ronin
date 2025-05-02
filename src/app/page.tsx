"use client";

import React from "react";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

/**
 * Main application component that renders the appropriate layout based on screen size
 *
 * Uses the useResponsiveLayout hook to determine which layout to render:
 * - DesktopLayout: For screens >= 1024px (lg breakpoint)
 * - MobileLayout: For screens < 1024px
 */
export default function Home() {
  const isDesktop = useResponsiveLayout();

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
}
