// useScrollChevrons is a custom React hook for managing scroll chevron visibility and actions in a scrollable container.
// Provides refs and functions to show/hide chevrons and scroll up/down smoothly.
// Useful for custom scrollable UIs where you want to indicate overflow and provide navigation controls.
import { useRef, useState, useEffect, useCallback } from "react";

export function useScrollChevrons() {
  // Ref to the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);
  // State for showing/hiding top and bottom chevrons
  const [showTopChevron, setShowTopChevron] = useState(false);
  const [showBottomChevron, setShowBottomChevron] = useState(false);

  // Check scroll position to determine chevron visibility
  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop <= 1;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;

    setShowTopChevron(!isAtTop);
    setShowBottomChevron(!isAtBottom);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkScroll();

    // Add scroll listener with debounce
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScroll, 50);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [checkScroll]);

  // Scroll up by 100px smoothly
  const scrollUp = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollBy({ top: -100, behavior: "smooth" });
    }
  }, []);

  // Scroll down by 100px smoothly
  const scrollDown = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollBy({ top: 100, behavior: "smooth" });
    }
  }, []);

  return {
    containerRef,
    showTopChevron,
    showBottomChevron,
    scrollUp,
    scrollDown,
  };
}
