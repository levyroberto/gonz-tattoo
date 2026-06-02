"use client"

import { createContext, type FormEvent, type ReactNode, useContext, useRef, useState, useTransition } from "react"

type AdminActionResult = {
  ok: boolean
  error?: string
  item?: unknown
}

export type RequiredFieldRule = {
  /** Clave del error. Usá la misma en <FieldError name=...>. */
  name: string
  message: string
  /** Validación custom; por defecto exige que el campo `name` no esté vacío. */
  check?: (formData: FormData) => boolean
}

type FieldErrors = Record<string, string>

const FieldErrorsContext = createContext<FieldErrors>({})

export function FieldError({ name, className }: { name: string; className?: string }) {
  const errors = useContext(FieldErrorsContext)
  const error = errors[name]

  if (!error) {
    return null
  }

  return <p className={`text-sm text-destructive ${className ?? ""}`}>{error}</p>
}

/** Una imagen está completa si hay URL o se eligió un archivo. */
export function hasImageValue(formData: FormData) {
  const url = String(formData.get("image_url") ?? "").trim()
  const file = formData.get("image_file")

  return url !== "" || (file instanceof File && file.size > 0)
}

function isRuleValid(rule: RequiredFieldRule, formData: FormData) {
  if (rule.check) {
    return rule.check(formData)
  }

  return String(formData.get(rule.name) ?? "").trim() !== ""
}

type AdminActionFormProps = {
  action: (formData: FormData) => Promise<AdminActionResult | void>
  children: ReactNode
  className?: string
  onChange?: (event: FormEvent<HTMLFormElement>) => void
  onSuccess?: (formData: FormData, result?: AdminActionResult | void) => void
  requiredFields?: RequiredFieldRule[]
  resetOnSuccess?: boolean
}

export function AdminActionForm({
  action,
  children,
  className,
  onChange,
  onSuccess,
  requiredFields,
  resetOnSuccess = false,
}: AdminActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setMessage(null)
    setIsError(false)

    if (requiredFields && requiredFields.length > 0) {
      const nextErrors: FieldErrors = {}

      for (const rule of requiredFields) {
        if (!isRuleValid(rule, formData)) {
          nextErrors[rule.name] = rule.message
        }
      }

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors)
        return
      }
    }

    setFieldErrors({})

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

  function handleChange(event: FormEvent<HTMLFormElement>) {
    onChange?.(event)

    const form = event.currentTarget

    setFieldErrors((current) => {
      if (Object.keys(current).length === 0) {
        return current
      }

      const formData = new FormData(form)
      const next = { ...current }

      for (const rule of requiredFields ?? []) {
        if (next[rule.name] && isRuleValid(rule, formData)) {
          delete next[rule.name]
        }
      }

      return next
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={handleChange}
      onInput={handleChange}
      className={className}
      aria-busy={isPending}
    >
      <FieldErrorsContext.Provider value={fieldErrors}>{children}</FieldErrorsContext.Provider>
      {message && (
        <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>{message}</p>
      )}
    </form>
  )
}
