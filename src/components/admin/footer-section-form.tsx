"use client"

import { useState } from "react"

import { updateFooterSectionContent } from "@/app/admin/actions"
import { AdminActionForm, FormMessage } from "@/components/admin/admin-action-form"
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card"
import { Button } from "@/components/ui/button"
import type { FooterSection } from "@/data/global-sections"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-20 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"

type FooterSectionFormProps = {
  footer: FooterSection
}

type FooterUpdate = {
  content: FooterSection["content"]
}

function isFooterUpdate(item: unknown): item is FooterUpdate {
  return Boolean(item && typeof item === "object" && "content" in item)
}

export function FooterSectionForm({ footer }: FooterSectionFormProps) {
  const [content, setContent] = useState(footer.content)

  function updateLocalContent(_formData: FormData, result?: { item?: unknown } | void) {
    const item = result?.item

    if (isFooterUpdate(item)) {
      setContent(item.content)
    }
  }

  return (
    <CollapsibleAdminCard title="Footer global" description="Contenido visual compartido por todas las páginas.">
      <AdminActionForm action={updateFooterSectionContent} className="grid gap-4" onSuccess={updateLocalContent} showMessageAtBottom={false}>
        <label className="grid gap-1.5 text-sm text-muted-foreground">
          Texto del footer
          <textarea className={tallFieldClass} name="tagline" defaultValue={content.tagline} />
        </label>

        <label className="grid gap-1.5 text-sm text-muted-foreground">
          Texto legal
          <input className={fieldClass} name="legal_text" defaultValue={content.legalText} />
        </label>

        <div className="flex items-center gap-2 justify-self-end">
          <FormMessage />
          <Button type="reset" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">
            Guardar footer
          </Button>
        </div>
      </AdminActionForm>
    </CollapsibleAdminCard>
  )
}
