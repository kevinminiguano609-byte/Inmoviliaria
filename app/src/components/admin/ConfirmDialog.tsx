/**
 * ConfirmDialog — reusable confirmation modal for destructive actions.
 */

import AdminModal from './AdminModal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-[#666666] mb-6">{description}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2.5 text-sm text-[#666666] hover:text-[#333333] transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="bg-[#F44336] hover:bg-[#D32F2F] text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
