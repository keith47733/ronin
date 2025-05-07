"use client";

import React, { useState, useEffect } from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import { Button } from "@/components/ui/Button";
import { CircleCheckBig } from "lucide-react";
import FinishedModal from "@/components/FinishedModal";
import Image from "next/image";
import FinishedButtonInHeader from "@/components/FloatingFinishedButton";

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
  const { activeModal, modalData, openModal, closeModal } = useModal();
  const { finishedButtonRef } = useAnimation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <>
      <header className="relative flex flex-col p-3 bg-black text-white min-h-[72px]">
        {/* First row: Logo/Title (left), Finished Button (right) */}
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-2 z-10 h-full">
            <Image
              src="/ronin.png"
              alt="Ronin Logo"
              width={44}
              height={44}
              className="h-11 w-auto object-contain rounded-md"
            />
            <h1 className="pl-2 text-5xl font-bold font-ronin tracking-widest">
              RONIN
            </h1>
          </div>
        </div>
        {/* Second row: Tagline, right-aligned on mobile only */}
        <div className="flex items-center justify-end w-full mt-1 lg:hidden">
          <h2 className="text-4xl font-bold font-ronin tracking-wider">
            DIVIDE AND CONQUER
          </h2>
        </div>
        {/* Centered tagline for desktop (hidden on mobile) */}
        <div className="hidden lg:flex w-full justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-20">
          <h2 className="text-4xl font-bold font-ronin tracking-wider text-center">
            DIVIDE AND CONQUER
          </h2>
        </div>
      </header>
      <FinishedModal
        isOpen={activeModal === "finished"}
        onClose={closeModal}
        finished={finished}
      />
    </>
  );
}
