"use client"

import { useState } from "react"

import { createFlashDesign, createPortfolioItem } from "@/app/admin/actions"
import { AdminActionForm, FieldError, hasImageValue, type RequiredFieldRule } from "@/components/admin/admin-action-form"
import { ActiveToggle } from "@/components/admin/active-toggle"
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card"
import { ImageInput } from "@/components/admin/image-input"
import { LabeledField } from "@/components/admin/labeled-field"
import { type AdminStatusFilter, SortableFlashList, SortablePortfolioList } from "@/components/admin/sortable-admin-lists"
import { TattooStyleSelect } from "@/components/admin/tattoo-style-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlashDesign } from "@/data/flash-designs"
import type { Tattoo } from "@/data/tattoos"
import type { TattooStyleOption } from "@/lib/supabase/content"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-20 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"
const errorIndentClass = "sm:pl-[152px]"

const tattooRequiredFields: RequiredFieldRule[] = [
  { name: "title", message: "El título es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

const designRequiredFields: RequiredFieldRule[] = [
  { name: "name", message: "El nombre es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

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

const statusFilterOptions: { value: AdminStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
]

function StatusFilterButtons({
  value,
  onChange,
}: {
  value: AdminStatusFilter
  onChange: (value: AdminStatusFilter) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {statusFilterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer border px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
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
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<AdminStatusFilter>("all")
  const [flashStatusFilter, setFlashStatusFilter] = useState<AdminStatusFilter>("all")
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
          <AdminActionForm
            action={createPortfolioItem}
            className="grid gap-3"
            onSuccess={addPortfolioItem}
            requiredFields={tattooRequiredFields}
            resetOnSuccess
          >
            <LabeledField label="Título">
              <input className={fieldClass} name="title" />
            </LabeledField>
            <FieldError name="title" className={errorIndentClass} />
            <LabeledField label="Estilo">
              <TattooStyleSelect className={fieldClass} styles={tattooStyleNames} />
            </LabeledField>
            <LabeledField label="Fecha">
              <input className={fieldClass} name="published_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </LabeledField>
            <LabeledField label="Imagen">
              <ImageInput />
            </LabeledField>
            <FieldError name="image" className={errorIndentClass} />
            <LabeledField label="Descripción" alignTop>
              <textarea className={tallFieldClass} name="description" />
            </LabeledField>
            <LabeledField label="Tags">
              <input className={fieldClass} name="tags" placeholder="Separados por coma: dragon, abril, boca" />
            </LabeledField>
            <div className="grid gap-3 sm:grid-cols-2">
              <ActiveToggle defaultChecked label="Destacado" name="is_featured" />
              <ActiveToggle />
            </div>
            <Button type="submit">Crear tatuaje</Button>
          </AdminActionForm>
        </CollapsibleAdminCard>

        <Card className="rounded-lg border border-border/70">
          <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>Tatuajes publicados</CardTitle>
              <CardDescription>{localPortfolioItems.length} tatuajes cargados.</CardDescription>
            </div>
            <StatusFilterButtons value={portfolioStatusFilter} onChange={setPortfolioStatusFilter} />
          </CardHeader>
          <CardContent>
            <SortablePortfolioList
              items={localPortfolioItems}
              onItemsChange={setLocalPortfolioItems}
              tattooStyles={tattooStyleNames}
              statusFilter={portfolioStatusFilter}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <div className="border-b border-border pb-3">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Gestión de</p>
          <h2 className="text-5xl tracking-wide text-secondary md:text-6xl">Diseños</h2>
        </div>

        <CollapsibleAdminCard title="Nuevo diseño" description="Crear un diseño disponible para consulta.">
          <AdminActionForm
            action={createFlashDesign}
            className="grid gap-3"
            onSuccess={addFlashItem}
            requiredFields={designRequiredFields}
            resetOnSuccess
          >
            <LabeledField label="Nombre">
              <input className={fieldClass} name="name" />
            </LabeledField>
            <FieldError name="name" className={errorIndentClass} />
            <LabeledField label="Precio">
              <input className={fieldClass} name="price" type="number" min="0" step="1" inputMode="numeric" />
            </LabeledField>
            <LabeledField label="Estilo">
              <input className={fieldClass} name="style" />
            </LabeledField>
            <LabeledField label="Imagen">
              <ImageInput />
            </LabeledField>
            <FieldError name="image" className={errorIndentClass} />
            <LabeledField label="Tags">
              <input className={fieldClass} name="tags" placeholder="Separados por coma: dragon, flash, tradicional" />
            </LabeledField>
            <LabeledField label="Tamaño">
              <input className={fieldClass} name="size" />
            </LabeledField>
            <LabeledField label="Estado">
              <select className={fieldClass} name="status" defaultValue="Disponible">
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Reclamado">Reclamado</option>
              </select>
            </LabeledField>
            <ActiveToggle />
            <Button type="submit">Crear diseño</Button>
          </AdminActionForm>
        </CollapsibleAdminCard>

        <Card className="rounded-lg border border-border/70">
          <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>Diseños publicados</CardTitle>
              <CardDescription>{localFlashItems.length} diseños cargados.</CardDescription>
            </div>
            <StatusFilterButtons value={flashStatusFilter} onChange={setFlashStatusFilter} />
          </CardHeader>
          <CardContent>
            <SortableFlashList items={localFlashItems} onItemsChange={setLocalFlashItems} statusFilter={flashStatusFilter} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
