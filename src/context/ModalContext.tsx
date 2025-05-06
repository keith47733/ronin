"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ModalType = "addTodo" | "dueDate" | "note" | "finished";

interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data?: any;
}

/**
 * Modal Context
 * 
 * Manages the application's modal system, providing a centralized way to handle
 * popup dialogs and their state. This context is crucial for managing user
 * interactions that require additional input or confirmation.
 * 
 * Key Features:
 * 1. Modal State Management:
 *    - Tracks currently active modal
 *    - Manages modal visibility
 *    - Stores modal-specific data
 * 
 * 2. Modal Types:
 *    - DueDate: For setting/updating todo due dates
 *    - Note: For adding/editing todo notes
 *    - Confirmation: For confirming destructive actions
 * 
 * 3. Modal Positioning:
 *    - Supports dynamic positioning based on trigger element
 *    - Handles mobile and desktop layouts
 * 
 * 4. Modal Lifecycle:
 *    - Opening with specific data
 *    - Closing with optional result
 *    - Cleanup on unmount
 */
interface ModalContextType {
  activeModal: string | null;  // Currently active modal type
  modalData: any;              // Data specific to the current modal
  openModal: (type: string, data?: any) => void;  // Open a modal with optional data
  closeModal: () => void;      // Close the current modal
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Modal Provider Component
 * 
 * Wraps the application to provide modal functionality to all child components.
 * Manages the state and lifecycle of modals throughout the application.
 * 
 * Usage:
 * 1. Wrap the application with ModalProvider
 * 2. Use useModal hook in components that need modal functionality
 * 3. Call openModal with type and data to show a modal
 * 4. Call closeModal to dismiss the current modal
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = useCallback((type: string, data?: any) => {
    setActiveModal(type);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  return (
    <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

/**
 * Custom hook to access the modal context
 * 
 * @returns ModalContextType - The modal context with state and methods
 * @throws Error if used outside of ModalProvider
 */
export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
