import { useEffect, useRef } from "react";

export default function ReviewDialog({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="review-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <h2 id="review-dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1 text-slate-600 hover:bg-slate-100"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </header>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
