"use client"

import { type ChangeEvent, useEffect, useId, useRef, useState } from "react"

type ImageInputProps = {
  defaultUrl?: string
}

const fileButtonClass =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-primary px-3 text-xs font-medium uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"

const urlFieldClass =
  "h-9 min-w-0 flex-1 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

export function ImageInput({ defaultUrl = "" }: ImageInputProps) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayValue, setDisplayValue] = useState(defaultUrl)
  const [hasSelectedFile, setHasSelectedFile] = useState(false)

  useEffect(() => {
    const form = fileInputRef.current?.form

    if (!form) {
      return
    }

    function handleReset() {
      setDisplayValue(defaultUrl)
      setHasSelectedFile(false)
    }

    form.addEventListener("reset", handleReset)

    return () => form.removeEventListener("reset", handleReset)
  }, [defaultUrl])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const fileName = event.currentTarget.files?.[0]?.name ?? ""

    setHasSelectedFile(Boolean(fileName))
    setDisplayValue(fileName || defaultUrl)
  }

  function handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
    setDisplayValue(event.currentTarget.value)
    setHasSelectedFile(false)

    if (fileInputRef.current?.value) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        ref={fileInputRef}
        id={inputId}
        className="sr-only"
        name="image_file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <label className={fileButtonClass} htmlFor={inputId}>
        Elegir archivo
      </label>
      <input
        className={urlFieldClass}
        name="image_url"
        value={displayValue}
        onChange={handleUrlChange}
        placeholder="Pegá una URL de imagen"
        aria-label={hasSelectedFile ? "Archivo seleccionado" : "URL de imagen"}
      />
    </div>
  )
}
