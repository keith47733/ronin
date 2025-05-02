"use client";

import React from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import { Button } from "@/components/ui/Button";
import { CircleCheckBig } from "lucide-react";
import FinishedModal from "@/components/FinishedModal";
import Image from "next/image";

/**
 * Header Component
 *
 * The main header component of the application that provides:
 * - Branding and logo display
 * - Application title
 * - Tagline
 * - Access to finished tasks
 *
 * Key Features:
 * 1. Brand Identity:
 *    - Displays the Ronin logo
 *    - Shows application name in custom font
 *    - Includes tagline for larger screens
 *
 * 2. Task Management:
 *    - Shows count of finished tasks
 *    - Provides access to finished tasks modal
 *    - Disables button when no finished tasks exist
 *
 * 3. Responsive Design:
 *    - Adapts layout for different screen sizes
 *    - Hides tagline on mobile devices
 *    - Adjusts font sizes for better readability
 *
 * 4. Visual Feedback:
 *    - Hover effects on interactive elements
 *    - Disabled state styling
 *    - Smooth transitions
 *
 * @component
 */

export default function Header() {
  const { finished } = useTodo();
  const { openModal, modalState, closeModal } = useModal();
  const { finishedButtonRef } = useAnimation();

  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between p-3 bg-black text-white">
      <div className="flex items-center justify-between lg:justify-start h-10">
        <div className="flex items-center gap-2">
          <Image
            src="/ronin.png"
            alt="Ronin Logo"
            width={44}
            height={44}
            className="h-11 w-auto object-contain rounded-md"
          />
          <h1 className="text-5xl font-bold font-ronin tracking-widest">
            RONIN
          </h1>
        </div>
        <div className="relative lg:hidden flex items-center">
          <Button
            ref={finishedButtonRef}
            variant="ghost"
            onClick={handleOpenFinished}
            className="text-white hover:text-white ring-1 ring-gray-500 hover:bg-gray-500 hover:ring-gray-300 font-ronin text-5xl font-bold p-1"
          >
            <CircleCheckBig className="h-6 w-6" />
          </Button>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {finished.length}
          </span>
        </div>
      </div>
      <div className="text-right py-1 lg:hidden flex items-center justify-end">
        <h2 className="text-4xl font-bold font-ronin tracking-wider">
          DIVIDE AND CONQUER
        </h2>
      </div>
      <div className="hidden lg:block text-center flex items-center">
        <h2 className="text-4xl font-bold font-ronin tracking-wider">
          DIVIDE AND CONQUER
        </h2>
      </div>
      <div className="hidden lg:flex items-center relative">
        <Button
          ref={finishedButtonRef}
          variant="ghost"
          onClick={handleOpenFinished}
          className="text-white hover:text-white ring-1 ring-gray-500 hover:bg-gray-500 hover:ring-gray-300 font-ronin text-5xl font-bold p-1"
        >
          <CircleCheckBig className="h-6 w-6" />
        </Button>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {finished.length}
        </span>
      </div>
      <FinishedModal
        isOpen={modalState.type === "finished" && modalState.isOpen}
        onClose={closeModal}
        finished={finished}
      />
    </header>
  );
}
