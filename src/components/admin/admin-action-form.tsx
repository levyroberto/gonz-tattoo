"use client"

import { type FormEvent, type ReactNode, useRef, useState, useTransition } from "react"

type AdminActionResult = {
  ok: boolean
  error?: string
  item?: unknown
}

type AdminActionFormProps = {
  action: (formData: FormData) => Promise<AdminActionResult | void>
  children: ReactNode
  className?: string
  onSuccess?: (formData: FormData, result?: AdminActionResult | void) => void
  resetOnSuccess?: boolean
}

export function AdminActionForm({ action, children, className, onSuccess, resetOnSuccess = false }: AdminActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      const result = await action(formData)

      if (result && !result.ok) {
        setIsError(true)
        setMessage(`No se pudo guardar: ${result.error ?? "error desconocido"}`)
        return
      }

      if (resetOnSuccess) {
        formRef.current?.reset()
      }

      onSuccess?.(formData, result)
      setMessage("Guardado")
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className} aria-busy={isPending}>
      {children}
      {message && (
        <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>
          {message}
        </p>
      )}
    </form>
  )
}
