import { useState, useCallback } from "react";
import { CircleCheckBig } from "lucide-react";

export function useTodoItemAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);

  const animateFinish = useCallback((button: HTMLButtonElement, onFinish: () => void) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const originalContent = button.innerHTML;
    
    // Replace with CircleCheckBig icon
    button.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-4 h-4 text-green-600"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    `;
    
    // Restore original content and toggle state after animation
    setTimeout(() => {
      button.innerHTML = originalContent;
      setIsAnimating(false);
      onFinish();
    }, 300);
  }, [isAnimating]);

  return {
    isAnimating,
    animateFinish
  };
} 