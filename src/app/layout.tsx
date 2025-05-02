"use client";

import React, { ReactNode } from "react";
import { TodoProvider } from "@/context/TodoContext";
import { ModalProvider } from "@/context/ModalContext";
import { AnimationProvider } from "@/context/AnimationContext";
import Header from "@/components/Header";
import ModalContainer from "@/components/ModalContainer";
import { karla, lato, ronin } from "./fonts";
import "./globals.css";

/**
 * Root Layout Component
 *
 * Provides the necessary context providers for the application:
 * - TodoProvider: Manages todo state and operations
 * - ModalProvider: Manages modal state and operations
 * - AnimationProvider: Manages animation state and references
 */
interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${karla.variable} ${lato.variable} ${ronin.variable}`}
    >
      <body>
        <TodoProvider>
          <ModalProvider>
            <AnimationProvider>
              <Header />
              <ModalContainer />
              {children}
            </AnimationProvider>
          </ModalProvider>
        </TodoProvider>
      </body>
    </html>
  );
}
