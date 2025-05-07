"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
import { useTodo } from "@/context/TodoContext";
import DueDateModal from "@/components/DueDateModal";
import NoteModal from "@/components/NoteModal";
import { DueDateModalData, NoteModalData } from "@/types/modal";
import { Modal } from "@/components/Modal";

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
