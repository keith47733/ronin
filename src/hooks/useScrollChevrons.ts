import { useRef, useState, useEffect, useCallback } from "react";

export function useScrollChevrons() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopChevron, setShowTopChevron] = useState(false);
  const [showBottomChevron, setShowBottomChevron] = useState(false);

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

  const scrollUp = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollBy({ top: -100, behavior: "smooth" });
    }
  }, []);

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
