// FloatingFinishedButton displays a floating button showing the number of finished tasks.
// Uses context to access finished todos and modal state, and coordinates with animation context for UI effects.
import React from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import { Button } from "@/components/ui/Button";
import { CircleCheckBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * FloatingFinishedButton
 *
 * - Shows a floating button with a badge for the number of finished tasks
 * - Clicking the button opens the finished tasks modal
 * - Uses context for state and animation ref for coordinated UI effects
 */
export default function FinishedButtonInHeader() {
  // Get finished todos from context
  const { finished } = useTodo();
  // Modal context for opening the finished modal
  const { openModal } = useModal();
  // Animation context for ref to the button
  const { finishedButtonRef } = useAnimation();

  // Open the finished modal when button is clicked
  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <Button
      ref={finishedButtonRef}
      variant="ghost"
      onClick={handleOpenFinished}
      className="shadow-lg mt-2 mr-2 bg-slate-700 hover:bg-slate-800 hover:outline text-white font-bold text-5xl p-3 rounded-full relative"
      aria-label="Show finished tasks"
    >
      <div className="relative">
        <CircleCheckBig className="h-7 w-7" />
        {/* Badge shows the number of finished tasks */}
        <Badge
          className="absolute bg-green-600 text-white font-bold text-sm -top-5 -right-4 p-2 min-w-[1.25rem] h-6 flex items-center justify-center rounded-full"
          variant="default"
        >
          {finished.length}
        </Badge>
      </div>
    </Button>
  );
} 