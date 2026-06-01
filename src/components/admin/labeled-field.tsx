import type { ReactNode } from "react"

type LabeledFieldProps = {
  label: string
  children: ReactNode
  /** Alinea la etiqueta arriba (para textareas u otros controles altos). */
  alignTop?: boolean
}

export function LabeledField({ label, children, alignTop = false }: LabeledFieldProps) {
  return (
    <div
      className={`grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3 ${alignTop ? "sm:items-start" : "sm:items-center"}`}
    >
      <span className={`text-sm text-muted-foreground ${alignTop ? "sm:pt-2" : ""}`}>{label}</span>
      {children}
    </div>
  )
}
