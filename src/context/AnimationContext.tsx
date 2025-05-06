"use client";

import React, { createContext, useContext, useRef } from "react";

/**
 * Animation Context
 * 
 * Provides centralized animation state management and coordination across the application.
 * This context is essential for managing complex animations that require coordination
 * between multiple components, particularly for todo completion and restoration flows.
 * 
 * Key Features:
 * 1. Reference Management:
 *    - Maintains references to key DOM elements needed for animations
 *    - Enables precise positioning and timing of animations
 * 
 * 2. Animation Coordination:
 *    - Coordinates animations between todo items and the finished button
 *    - Manages animation timing and sequencing
 * 
 * 3. State Persistence:
 *    - Preserves animation state across component re-renders
 *    - Ensures smooth animation transitions
 */
interface AnimationContextType {
  finishedButtonRef: React.RefObject<HTMLButtonElement>;  // Reference to the finished button for completion animations
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

/**
 * Animation Provider Component
 * 
 * Wraps the application to provide animation context to all child components.
 * Initializes and maintains references needed for coordinated animations.
 * 
 * Usage:
 * 1. Wrap the application with AnimationProvider
 * 2. Use useAnimation hook in components that need animation coordination
 * 3. Access finishedButtonRef for completion animations
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const finishedButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AnimationContext.Provider value={{ finishedButtonRef }}>
      {children}
    </AnimationContext.Provider>
  );
}

/**
 * Custom hook to access the animation context
 * 
 * @returns AnimationContextType - The animation context with references and methods
 * @throws Error if used outside of AnimationProvider
 */
export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}
