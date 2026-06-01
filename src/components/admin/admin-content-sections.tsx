"use client"

import { useState } from "react"

import { createFlashDesign, createPortfolioItem } from "@/app/admin/actions"
import { AdminActionForm } from "@/components/admin/admin-action-form"
import { ActiveToggle } from "@/components/admin/active-toggle"
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card"
import { ImageInput } from "@/components/admin/image-input"
import { SortableFlashList, SortablePortfolioList } from "@/components/admin/sortable-admin-lists"
import { TattooStyleSelect } from "@/components/admin/tattoo-style-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlashDesign } from "@/data/flash-designs"
import type { Tattoo } from "@/data/tattoos"
import type { TattooStyleOption } from "@/lib/supabase/content"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-20 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"

type AdminActionResult = {
  ok: boolean
  error?: string
  item?: unknown
}

type AdminContentSectionsProps = {
  flashItems: FlashDesign[]
  portfolioItems: Tattoo[]
  tattooStyles: TattooStyleOption[]
}

function isPortfolioItem(item: unknown): item is Tattoo {
  return Boolean(item && typeof item === "object" && "id" in item && "title" in item)
}

function isFlashItem(item: unknown): item is FlashDesign {
  return Boolean(item && typeof item === "object" && "id" in item && "name" in item)
}

export function AdminContentSections({ flashItems, portfolioItems, tattooStyles }: AdminContentSectionsProps) {
  const [localPortfolioItems, setLocalPortfolioItems] = useState(portfolioItems)
  const [localFlashItems, setLocalFlashItems] = useState(flashItems)
  const existingTattooStyles = localPortfolioItems.map((item) => item.style)
  const tattooStyleNames = tattooStyles.length > 0 ? tattooStyles.map((style) => style.name) : existingTattooStyles

  function addPortfolioItem(_formData: FormData, result?: AdminActionResult | void) {
    const item = result?.item

    if (!isPortfolioItem(item)) {
      return
    }

    setLocalPortfolioItems((currentItems) => [...currentItems, item])
  }

  function addFlashItem(_formData: FormData, result?: AdminActionResult | void) {
    const item = result?.item

    if (!isFlashItem(item)) {
      return
    }

    setLocalFlashItems((currentItems) => [...currentItems, item])
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="grid content-start gap-5">
        <div className="border-b border-border pb-3">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Gestión de</p>
          <h2 className="text-5xl tracking-wide text-primary md:text-6xl">Tatuajes</h2>
        </div>

        <CollapsibleAdminCard title="Nuevo tatuaje" description="Crear un tatuaje para publicar en la web.">
          <AdminActionForm action={createPortfolioItem} className="grid gap-3" onSuccess={addPortfolioItem} resetOnSuccess>
            <input className={fieldClass} name="title" placeholder="Título" required />
            <TattooStyleSelect className={fieldClass} styles={tattooStyleNames} />
            <input className={fieldClass} name="published_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            <ImageInput />
            <textarea className={tallFieldClass} name="description" placeholder="Descripción" />
            <input className={fieldClass} name="tags" placeholder="Tags separados por coma: dragon, abril, boca" />
            <div className="grid gap-3 sm:grid-cols-2">
              <ActiveToggle defaultChecked label="Destacado" name="is_featured" />
              <ActiveToggle />
            </div>
            <Button type="submit">Crear tatuaje</Button>
          </AdminActionForm>
        </CollapsibleAdminCard>

        <Card className="rounded-lg border border-border/70">
          <CardHeader>
            <CardTitle>Tatuajes publicados</CardTitle>
            <CardDescription>{localPortfolioItems.length} tatuajes cargados.</CardDescription>
          </CardHeader>
          <CardContent>
            <SortablePortfolioList items={localPortfolioItems} onItemsChange={setLocalPortfolioItems} tattooStyles={tattooStyleNames} />
          </CardContent>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <div className="border-b border-border pb-3">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Gestión de</p>
          <h2 className="text-5xl tracking-wide text-secondary md:text-6xl">Diseños</h2>
        </div>

        <CollapsibleAdminCard title="Nuevo diseño" description="Crear un diseño disponible para consulta.">
          <AdminActionForm action={createFlashDesign} className="grid gap-3" onSuccess={addFlashItem} resetOnSuccess>
            <input className={fieldClass} name="name" placeholder="Nombre" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={fieldClass} name="price" type="number" min="0" step="1" inputMode="numeric" placeholder="Precio" required />
              <input className={fieldClass} name="style" placeholder="Estilo" required />
            </div>
            <ImageInput />
            <input className={fieldClass} name="tags" placeholder="Tags separados por coma: dragon, flash, tradicional" />
            <input className={fieldClass} name="size" placeholder="Tamaño" required />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <select className={fieldClass} name="status" defaultValue="Disponible">
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Reclamado">Reclamado</option>
              </select>
              <ActiveToggle />
            </div>
            <Button type="submit">Crear diseño</Button>
          </AdminActionForm>
        </CollapsibleAdminCard>

        <Card className="rounded-lg border border-border/70">
          <CardHeader>
            <CardTitle>Diseños publicados</CardTitle>
            <CardDescription>{localFlashItems.length} diseños cargados.</CardDescription>
          </CardHeader>
          <CardContent>
            <SortableFlashList items={localFlashItems} onItemsChange={setLocalFlashItems} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
