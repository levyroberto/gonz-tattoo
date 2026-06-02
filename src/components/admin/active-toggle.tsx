"use client"

import { useState } from "react"

type ActiveToggleProps = {
  defaultChecked?: boolean
  label?: string
  name?: string
}

export function ActiveToggle({ defaultChecked = true, label = "Activo", name = "is_active" }: ActiveToggleProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <label className="inline-flex h-9 w-max max-w-full self-start justify-self-start cursor-pointer items-center gap-3 rounded-md border border-border px-3 text-sm text-muted-foreground">
      <input
        checked={isChecked}
        className="sr-only"
        name={name}
        onChange={(event) => setIsChecked(event.currentTarget.checked)}
        type="checkbox"
      />
      <span
        className={`relative h-5 w-9 rounded-full ring-1 ring-border transition-colors ${
          isChecked ? "bg-green-500/80" : "bg-muted"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-foreground transition-transform ${
            isChecked ? "translate-x-4" : ""
          }`}
        />
      </span>
      {label}
    </label>
  )
}
