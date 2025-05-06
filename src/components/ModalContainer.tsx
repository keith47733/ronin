"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
import { useTodo } from "@/context/TodoContext";
import DueDateModal from "@/components/DueDateModal";
import NoteModal from "@/components/NoteModal";
import { DueDateModalData, NoteModalData } from "@/types/modal";

export default function ModalContainer() {
  const { activeModal, modalData, closeModal } = useModal();
  const { updateTodoDueDate, updateTodoNote } = useTodo();

  const handleSaveDueDate = (date: Date | undefined) => {
    const data = modalData as DueDateModalData;
    if (data?.todoId) {
      updateTodoDueDate(data.todoId, date);
    }
    closeModal();
  };

  const handleSaveNote = (note: string) => {
    const data = modalData as NoteModalData;
    if (data?.todoId) {
      updateTodoNote(data.todoId, note);
    }
    closeModal();
  };

  return (
    <>
      {activeModal === "dueDate" && (
        <DueDateModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSaveDueDate}
          initialDate={(modalData as DueDateModalData)?.initialDate}
        />
      )}
      {activeModal === "note" && (
        <NoteModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSaveNote}
          initialNote={(modalData as NoteModalData)?.initialNote}
        />
      )}
    </>
  );
}
