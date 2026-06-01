import { Button } from "../ui/button"

type ConfirmDeleteModalProps = {
    isOpen: boolean
    itemName: string
    onClose: () => void
    onConfirm: () => void
  }
  
  export function ConfirmDeleteModal({ isOpen, itemName, onClose, onConfirm }: ConfirmDeleteModalProps) {
    if (!isOpen) return null
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-xl w-full max-w-sm mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid gap-1">
            <p className="text-base font-medium">¿Borrar este elemento?</p>
            <p className="text-sm text-muted-foreground">
              Se eliminará <span className="text-foreground">&quot;{itemName}&quot;</span> de forma permanente.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Borrar
            </Button>
          </div>
        </div>
      </div>
    )
  }
