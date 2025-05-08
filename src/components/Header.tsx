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
 * Provides:
 * - App branding (logo, title, tagline)
 * - Responsive layout for mobile/desktop
 * - Access to finished tasks modal
 * - Uses context for todo and modal state
 */
export default function Header() {
  // Get finished todos from context
  const { finished } = useTodo();
  // Modal state and actions
  const { activeModal, modalData, openModal, closeModal } = useModal();
  // Animation context for finished button ref
  const { finishedButtonRef } = useAnimation();
  // Track scroll state for potential UI effects
  const [isScrolled, setIsScrolled] = useState(false);

  // Listen for scroll to update isScrolled (could be used for sticky/fade effects)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open the finished tasks modal
  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <>
      {/* App header: logo, title, tagline (responsive) */}
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
      {/* FinishedModal is rendered here, controlled by modal context */}
      <FinishedModal
        isOpen={activeModal === "finished"}
        onClose={closeModal}
        finished={finished}
      />
    </>
  );
}
