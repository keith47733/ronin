// useCardWidth is a custom React hook for calculating the width of a todo card responsively.
// It listens to window resize events and returns the appropriate width for mobile and desktop layouts.
// This helps keep UI elements sized correctly across breakpoints in a Tailwind/Next.js app.
import { useEffect, useState } from "react";

export function useCardWidth() {
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Helper to calculate card width based on screen size and layout
    const getCardWidth = () => {
      const screenWidth = window.innerWidth;
      const mdBreakpoint = 768; // Tailwind's md

      if (screenWidth < mdBreakpoint) {
        // Mobile layout: card fills most of the screen minus padding
        const outerPadding = 12; // px (p-3)
        const quadrantWidth = screenWidth - 2 * outerPadding;
        return quadrantWidth * 0.95;
      } else {
        // Desktop layout: card fits inside quadrant grid
        const outerPadding = 8; // px (p-2)
        const quadrantGridPadding = 12; // px (p-3)
        const gap = 12; // px (gap-3)
        const rightPanelWidth = (screenWidth - 2 * outerPadding) * 2 / 3;
        const quadrantWidth = (rightPanelWidth - 2 * quadrantGridPadding - gap) / 2;
        return quadrantWidth * 0.95 - gap - 52;
      }
    };

    // Update card width on mount and on resize
    const handleResize = () => setCardWidth(getCardWidth());
    handleResize(); // Set initial width on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardWidth;
} 