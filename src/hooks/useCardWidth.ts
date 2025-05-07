import { useEffect, useState } from "react";

export function useCardWidth() {
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const getCardWidth = () => {
      const screenWidth = window.innerWidth;
      const mdBreakpoint = 768; // Tailwind's md

      if (screenWidth < mdBreakpoint) {
        // Mobile layout
        const outerPadding = 12; // px (p-3)
        const quadrantWidth = screenWidth - 2 * outerPadding;
        return quadrantWidth * 0.95;
      } else {
        // Desktop layout
        const outerPadding = 8; // px (p-2)
        const quadrantGridPadding = 12; // px (p-3)
        const gap = 12; // px (gap-3)
        const rightPanelWidth = (screenWidth - 2 * outerPadding) * 2 / 3;
        const quadrantWidth = (rightPanelWidth - 2 * quadrantGridPadding - gap) / 2;
        return quadrantWidth * 0.95 - gap - 52;
      }
    };

    const handleResize = () => setCardWidth(getCardWidth());
    handleResize(); // Set initial width on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cardWidth;
} 