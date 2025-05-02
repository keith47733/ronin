import { ChevronUp, ChevronDown } from "lucide-react";

interface ScrollChevronProps {
  direction: "up" | "down";
  onClick: () => void;
  colorClass: string;
}

export function ScrollChevron({
  direction,
  onClick,
  colorClass,
}: ScrollChevronProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute ${
        direction === "up" ? "top-2" : "bottom-2"
      } left-1/2 -translate-x-1/2 p-1 rounded-full hover:bg-opacity-20 ${colorClass}`}
      aria-label={`Scroll ${direction}`}
    >
      {direction === "up" ? (
        <ChevronUp className="h-5 w-5" />
      ) : (
        <ChevronDown className="h-5 w-5" />
      )}
    </button>
  );
}
