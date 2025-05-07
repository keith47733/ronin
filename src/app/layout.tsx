"use client";

import React, { ReactNode } from "react";
import { TodoProvider } from "@/context/TodoContext";
import { ModalProvider } from "@/context/ModalContext";
import { AnimationProvider } from "@/context/AnimationContext";
import Header from "@/components/Header";
import ModalContainer from "@/components/ModalContainer";
import FinishedButtonInHeader from "@/components/FloatingFinishedButton";
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ModalProvider>
          <TodoProvider>
            <AnimationProvider>
              <Header />
              <ModalContainer />
              {children}
              <div className="fixed right-4 top-[13px] lg:top-[15px] z-50">
                <FinishedButtonInHeader />
              </div>
            </AnimationProvider>
          </TodoProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
