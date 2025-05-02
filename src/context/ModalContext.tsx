"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ModalType, ModalData } from "@/types/modal";

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data?: ModalData;
}

interface ModalContextType {
  modalState: ModalState;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
  });

  const openModal = useCallback((type: ModalType, data?: ModalData) => {
    setModalState({ isOpen: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null });
  }, []);

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
