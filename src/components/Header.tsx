"use client";

import React from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import FinishedModal from "@/components/FinishedModal";
import Image from "next/image";

/**
 * Header Component
 * 
 * Provides the main application header with:
 * - App branding (logo and title)
 * - Responsive tagline ("DIVIDE AND CONQUER")
 * - Integration with the finished tasks modal
 * 
 * Layout:
 * - Desktop: Logo and title on left, centered tagline
 * - Mobile: Logo and title on left, right-aligned tagline
 * 
 * Uses context for:
 * - Todo state (finished items)
 * - Modal state (finished tasks modal)
 * - Animation refs (for finished button)
 */
export default function Header() {
  // Get finished todos from context
  const { finished } = useTodo();
  // Modal state and actions
  const { activeModal, closeModal } = useModal();
  // Animation context for finished button ref
  const { finishedButtonRef } = useAnimation();

  return (
    <>
      {/* App header: logo, title, tagline (responsive) */}
      <header className="relative flex flex-col p-1 bg-black text-white min-h-[72px]">
        {/* First row: Logo/Title (left), Tag linen (centre) */}
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex items-center z-10">
            <Image
              src="/ronin.png"
              alt="Ronin Logo"
              width={49}
              height={49}
              className="h-full w-full pl-2 object-contain rounded-sm"
            />
            <h1 className="pl-4 pt-2 text-6xl font-bold font-ronin tracking-widest">
              RONIN
            </h1>
          </div>
        </div>
        {/* Second row: Tagline, right-aligned on mobile only */}
        <div className="flex items-center justify-end w-full mt-1 lg:hidden">
          <h2 className="text-5xl font-bold font-ronin tracking-widest">
            DIVIDE AND CONQUER
          </h2>
        </div>
        {/* Centered tagline for desktop (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center w-full absolute pt-1 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-20">
          <h2 className="text-5xl font-bold font-ronin tracking-wider text-center">
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
