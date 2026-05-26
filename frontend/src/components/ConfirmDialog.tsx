import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="panel-star w-full max-w-sm p-6 border-star-gold/20"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-display text-lg text-gray-100">{title}</h3>
          <button type="button" onClick={onCancel} className="p-1 rounded hover:bg-white/10 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="btn-ghost px-5">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={danger ? 'px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium' : 'btn-primary px-5'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
