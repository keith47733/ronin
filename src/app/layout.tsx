// Root layout for the Next.js app. This file wraps all pages and provides global context and styles.
// It is an async Server Component, so you can fetch data here before rendering children.
import React, { ReactNode } from "react";
import { TodoProvider } from "@/context/TodoContext"; // Provides todo state and actions
import { ModalProvider } from "@/context/ModalContext"; // Provides modal state and actions
import { AnimationProvider } from "@/context/AnimationContext"; // Provides animation state and refs
import Header from "@/components/Header"; // App header
import ModalContainer from "@/components/ModalContainer"; // Handles all modals
import ClientOnlyFinishedButton from "@/components/ClientOnlyFinishedButton"; // Button to show finished todos (client-only)
import { karla, lato, ronin } from "./fonts"; // Custom fonts
import "./globals.css"; // Global styles
import { prisma } from "@/lib/prisma"; // Prisma client for DB access

/**
 * Root Layout Component
 *
 * This is the top-level layout for your Next.js app. It wraps all pages and provides:
 * - Context providers for todos, modals, and animations
 * - Global styles and fonts
 * - Server-side data fetching for initial todos (SSR)
 *
 * In Next.js, layouts are special React Server Components that persist across page navigation.
 */
interface RootLayoutProps {
  children: ReactNode; // The page content to render inside the layout
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Fetch all todos from the database, ordered by their 'order' field
  const dbTodos = await prisma.todo.findMany({ orderBy: { order: "asc" } });
  // Prepare todos for the context provider (convert dates, handle optional fields)
  const initialTodos = dbTodos.map(todo => ({
    ...todo,
    quadrant: todo.quadrant as import("@/types/todo").QuadrantKey,
    createdAt: new Date(todo.createdAt),
    dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    note: todo.note ?? undefined,
    deleted: todo.deleted ?? undefined,
  }));

  // The returned JSX is the HTML structure for every page
  // - <html> and <body> are required in Next.js layouts
  // - Context providers wrap the app to provide state and actions
  // - Header and ModalContainer are always present
  // - children is the current page content
  // - ClientOnlyFinishedButton is a client component for the finished tasks button
  return (
    <html
      lang="en"
      className={`${karla.variable} ${lato.variable} ${ronin.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {/* ModalProvider manages which modal is open and its data */}
        <ModalProvider>
          {/* TodoProvider manages the todo list and actions, seeded with initialTodos */}
          <TodoProvider initialTodos={initialTodos}>
            {/* AnimationProvider manages refs for animation targets (e.g., finished button) */}
            <AnimationProvider>
              <Header />
              <ModalContainer />
              {/* Render the current page here */}
              {children}
              {/* Floating finished tasks button (client-only) */}
              <div className="fixed right-4 top-[13px] lg:top-[15px] z-50">
                <ClientOnlyFinishedButton />
              </div>
            </AnimationProvider>
          </TodoProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
