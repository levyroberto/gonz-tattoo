"use client"

import { Plus, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type TagInputFieldProps = {
  className: string
  defaultValue?: string
  name?: string
  placeholder?: string
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function TagInputField({
  className,
  defaultValue = "",
  name = "tags",
  placeholder = "Agregar tag",
}: TagInputFieldProps) {
  const [tags, setTags] = useState(() => parseTags(defaultValue))
  const [draftTag, setDraftTag] = useState("")
  const submittedTags = draftTag.trim()
    ? [
        ...tags,
        ...(tags.some((tag) => tag.toLowerCase() === draftTag.trim().toLowerCase()) ? [] : [draftTag.trim()]),
      ]
    : tags

  function addTag() {
    const nextTag = draftTag.trim()

    if (!nextTag) {
      return
    }

    setTags((currentTags) =>
      currentTags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())
        ? currentTags
        : [...currentTags, nextTag]
    )
    setDraftTag("")
  }

  function removeTag(tagToRemove: string) {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="grid gap-2">
      <input name={name} type="hidden" value={submittedTags.join(", ")} readOnly />
      {tags.map((tag) => (
        <div key={tag} className="grid grid-cols-[1fr_auto] gap-2">
          <input className={`${className} disabled:opacity-75`} value={tag} disabled aria-label={`Tag ${tag}`} />
          <Button type="button" variant="outline" size="icon" aria-label={`Quitar tag ${tag}`} onClick={() => removeTag(tag)}>
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          className={className}
          value={draftTag}
          onChange={(event) => setDraftTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-green-500/50 text-green-400 hover:border-green-500 hover:text-green-300"
          aria-label="Agregar tag"
          onClick={addTag}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
