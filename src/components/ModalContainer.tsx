"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
import { useTodo } from "@/context/TodoContext";
import DueDateModal from "@/components/DueDateModal";
import NoteModal from "@/components/NoteModal";
import { DueDateModalData, NoteModalData } from "@/types/modal";

export default function ModalContainer() {
  const { modalState, closeModal } = useModal();
  const { updateTodoDueDate, updateTodoNote } = useTodo();

  const handleSaveDueDate = (date: Date | undefined) => {
    const data = modalState.data as DueDateModalData;
    if (data?.todoId) {
      updateTodoDueDate(data.todoId, date);
    }
    closeModal();
  };

  const handleSaveNote = (note: string) => {
    const data = modalState.data as NoteModalData;
    if (data?.todoId) {
      updateTodoNote(data.todoId, note);
    }
    closeModal();
  };

  return (
    <>
      {modalState.type === "dueDate" && (
        <DueDateModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveDueDate}
          initialDate={(modalState.data as DueDateModalData)?.initialDate}
        />
      )}
      {modalState.type === "note" && (
        <NoteModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveNote}
          initialNote={(modalState.data as NoteModalData)?.initialNote}
        />
      )}
    </>
  );
}
