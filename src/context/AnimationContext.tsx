import React, { createContext, useContext, useRef } from "react";

interface AnimationContextType {
  finishedButtonRef: React.RefObject<HTMLButtonElement>;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const finishedButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AnimationContext.Provider value={{ finishedButtonRef }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}
