"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteModal } from "./confirm-delete-modal"

type DeleteButtonProps = {
  itemId: number
  itemName: string
  deleteAction: (formData: FormData) => Promise<unknown>
  onSuccess: (formData: FormData) => void
}

export function DeleteButton({ itemId, itemName, deleteAction, onSuccess }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    const formData = new FormData()
    formData.set("id", String(itemId))

    startTransition(async () => {
      await deleteAction(formData)
      onSuccess(formData)
      setIsOpen(false)
    })
  }

  return (
    <>
      <Button
        aria-label={`Borrar ${itemName}`}
        size="icon"
        type="button"
        variant="destructive"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 aria-hidden="true" />
      </Button>

      <ConfirmDeleteModal
        isOpen={isOpen}
        itemName={itemName}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}