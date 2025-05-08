"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
import { useTodo } from "@/context/TodoContext";
import DueDateModal from "@/components/DueDateModal";
import NoteModal from "@/components/NoteModal";
import { DueDateModalData, NoteModalData } from "@/types/modal";
import { Modal } from "@/components/Modal";

/**
 * ModalContainer
 *
 * Renders the appropriate modal based on modal context state.
 * - Handles due date, note, and error modals.
 * - Passes save handlers and initial data to each modal.
 * - Ensures only one modal is open at a time.
 */
export default function ModalContainer() {
  // Modal state and actions
  const { activeModal, modalData, closeModal } = useModal();
  // Todo actions for updating due date and note
  const { updateTodoDueDate, updateTodoNote } = useTodo();

  // Handler for saving due date from DueDateModal
  const handleSaveDueDate = (date: Date | undefined) => {
    const data = modalData as DueDateModalData;
    if (data?.todoId) {
      updateTodoDueDate(data.todoId, date);
    }
    closeModal();
  };

  // Handler for saving note from NoteModal
  const handleSaveNote = (note: string) => {
    const data = modalData as NoteModalData;
    if (data?.todoId) {
      updateTodoNote(data.todoId, note);
    }
    closeModal();
  };

  return (
    <>
      {/* Conditionally render the due date modal */}
      {activeModal === "dueDate" && (
        <DueDateModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSaveDueDate}
          initialDate={(modalData as DueDateModalData)?.initialDate}
        />
      )}
      {/* Conditionally render the note modal */}
      {activeModal === "note" && (
        <NoteModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSaveNote}
          initialNote={(modalData as NoteModalData)?.initialNote}
        />
      )}
      {/* Conditionally render the error modal */}
      {activeModal === "error" && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title="Data Load Error"
          className="w-[350px]"
          backgroundClassName="bg-white"
        >
          <div className="p-4 text-red-600 text-base font-medium">
            {modalData?.message || "An unknown error occurred while loading your tasks."}
            {modalData?.allCorrupt ? (
              <div className="mt-2 text-red-700 text-base font-bold">Storage corrupt. Unable to load tasks.</div>
            ) : (typeof modalData?.corruptedCount === 'number' && modalData.corruptedCount > 0 && (
              <div className="mt-2 text-red-700 text-base font-bold">{modalData.corruptedCount} task(s) not loaded.</div>
            ))}
          </div>
          <div className="flex justify-end px-4 pb-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
