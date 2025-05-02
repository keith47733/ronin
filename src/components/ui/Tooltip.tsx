import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  textColor?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  className = "",
  bgColor = "bg-gray-800",
  textColor = "text-white",
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current
        .querySelector(".tooltip-content")
        ?.getBoundingClientRect();

      if (tooltipRect) {
        let top = 0;
        let left = 0;

        // Calculate initial position relative to viewport
        switch (position) {
          case "top":
            top = rect.top - tooltipRect.height - 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
          case "bottom":
            top = rect.bottom + 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
          case "left":
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - 8;
            break;
          case "right":
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + 8;
            break;
        }

        // Check if tooltip would be outside viewport and adjust position if needed
        if (top < 0) {
          top = rect.bottom + 8;
        } else if (top + tooltipRect.height > window.innerHeight) {
          top = rect.top - tooltipRect.height - 8;
        }

        if (left < 0) {
          left = rect.right + 8;
        } else if (left + tooltipRect.width > window.innerWidth) {
          left = rect.left - tooltipRect.width - 8;
        }

        setTooltipPosition({ top, left });
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, position]);

  return (
    <div
      ref={tooltipRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`tooltip-content fixed z-[45] px-3 py-2 rounded-md shadow-lg pointer-events-none ${bgColor} ${textColor} ${className}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 ${bgColor} rotate-45 pointer-events-none`}
            style={{
              top:
                position === "bottom"
                  ? "-4px"
                  : position === "top"
                  ? "100%"
                  : "50%",
              left:
                position === "right"
                  ? "-4px"
                  : position === "left"
                  ? "100%"
                  : "50%",
              marginLeft:
                position === "top" || position === "bottom" ? "-4px" : "0",
              marginTop:
                position === "left" || position === "right" ? "-4px" : "0",
            }}
          />
        </div>
      )}
    </div>
  );
}
