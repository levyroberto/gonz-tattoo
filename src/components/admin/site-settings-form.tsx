"use client"

import { type FormEvent } from "react"

import { updateSiteSettings } from "@/app/admin/actions"
import { AdminActionForm, FormMessage } from "@/components/admin/admin-action-form"
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card"
import { Button } from "@/components/ui/button"
import type { SiteSettings } from "@/lib/supabase/content"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"

type SiteSettingsFormProps = {
  settings: SiteSettings
}

function getInstagramHandle(instagramUrl?: string) {
  if (!instagramUrl) return ""
  try {
    const url = new URL(instagramUrl)
    return url.pathname.split("/").filter(Boolean)[0] ?? ""
  } catch {
    return instagramUrl.replace(/^@/, "").split("/").filter(Boolean)[0] ?? ""
  }
}

function getWhatsappLocalPhone(whatsappUrl?: string) {
  if (!whatsappUrl) return ""
  try {
    const url = new URL(whatsappUrl)
    const phone = url.hostname.includes("wa.me") ? url.pathname.replace(/\D/g, "") : ""
    return phone.replace(/^549/, "")
  } catch {
    return whatsappUrl.replace(/\D/g, "").replace(/^549/, "")
  }
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  function keepOnlyDigits(event: FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "")
  }

  return (
    <CollapsibleAdminCard
      title="Información del sitio"
      description="Datos globales usados en contacto, WhatsApp, Instagram y sobre mí."
    >
      <AdminActionForm action={updateSiteSettings} className="grid gap-4" showMessageAtBottom={false}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm text-muted-foreground">
            Nombre del artista
            <input className={fieldClass} name="artist_name" defaultValue={settings.artistName ?? ""} placeholder="Gonzalo Regueira" />
          </label>
          <label className="grid gap-1.5 text-sm text-muted-foreground">
            Instagram
            <div className="grid grid-cols-[auto_1fr] overflow-hidden rounded-md border border-border bg-input focus-within:border-primary">
              <span className="flex h-9 items-center border-r border-border px-3 text-muted-foreground">instagram.com/</span>
              <input
                className="h-9 bg-transparent px-3 text-foreground outline-none"
                name="instagram_handle"
                defaultValue={getInstagramHandle(settings.instagramUrl)}
                pattern="[A-Za-z0-9._]+"
                placeholder="gonztattoo"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm text-muted-foreground">
            Número de WhatsApp
            <div className="grid grid-cols-[auto_1fr] overflow-hidden rounded-md border border-border bg-input focus-within:border-primary">
              <input
                className="h-9 bg-transparent px-3 text-foreground outline-none"
                name="whatsapp_phone"
                defaultValue={getWhatsappLocalPhone(settings.whatsappUrl)}
                inputMode="numeric"
                onInput={keepOnlyDigits}
                pattern="^[0-9]*$"
                placeholder="1123456789"
              />
            </div>
          </label>
          <label className="grid gap-1.5 text-sm text-muted-foreground">
            Horario del estudio
            <input className={fieldClass} name="studio_hours" defaultValue={settings.studioHours ?? ""} placeholder="Lun a sáb, 12 a 20 hs" />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm text-muted-foreground">
          Dirección del estudio
          <input className={fieldClass} name="studio_address" defaultValue={settings.studioAddress ?? ""} placeholder="Almagro, CABA" />
        </label>

        <div className="flex items-center gap-2 justify-self-end">
          <FormMessage />
          <Button type="reset" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">
            Guardar información
          </Button>
        </div>
      </AdminActionForm>
    </CollapsibleAdminCard>
  )
}
