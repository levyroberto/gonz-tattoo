"use client"

import { useState } from "react"

import { createSaleableArtwork, createTattoo } from "@/app/admin/actions"
import { AdminActionForm, FieldError, hasImageValue, type RequiredFieldRule } from "@/components/admin/admin-action-form"
import { ActiveToggle } from "@/components/admin/active-toggle"
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card"
import { ImageInput } from "@/components/admin/image-input"
import { LabeledField } from "@/components/admin/labeled-field"
import { type AdminStatusFilter, SortableDesignsList, SortablePortfolioList } from "@/components/admin/sortable-admin-lists"
import { TagInputField } from "@/components/admin/tag-input-field"
import { TattooStyleSelect } from "@/components/admin/tattoo-style-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SaleableArtwork, TattooArtwork } from "@/data/artworks"
import type { TattooStyleOption } from "@/lib/supabase/content"
import { errorIndentClass, fieldClass, tallFieldClass } from "@/components/admin/admin-field-styles"

const tattooRequiredFields: RequiredFieldRule[] = [
  { name: "title", message: "El título es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

const designRequiredFields: RequiredFieldRule[] = [
  { name: "title", message: "El nombre es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

type AdminActionResult = {
  ok: boolean
  error?: string
  item?: unknown
}

type AdminContentSectionsProps = {
  flashItems: SaleableArtwork[]
  portfolioItems: TattooArtwork[]
  tattooStyles: TattooStyleOption[]
}

type AdminTattoosSectionProps = {
  portfolioItems: TattooArtwork[]
  tattooStyles: TattooStyleOption[]
}

type AdminDesignsSectionProps = {
  flashItems: SaleableArtwork[]
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

function isPortfolioItem(item: unknown): item is TattooArtwork {
  return Boolean(item && typeof item === "object" && "id" in item && "type" in item && (item as { type: unknown }).type === "tattoo")
}

function isDesignItem(item: unknown): item is SaleableArtwork {
  return Boolean(item && typeof item === "object" && "id" in item && "price" in item)
}

export function AdminTattoosSection({ portfolioItems, tattooStyles }: AdminTattoosSectionProps) {
  const [localPortfolioItems, setLocalPortfolioItems] = useState(portfolioItems)
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<AdminStatusFilter>("all")
  const existingTattooStyles = localPortfolioItems.map((item) => item.style).filter(Boolean) as string[]
  const tattooStyleNames = tattooStyles.length > 0 ? tattooStyles.map((style) => style.name) : existingTattooStyles

  function addPortfolioItem(_formData: FormData, result?: AdminActionResult | void) {
    const item = result?.item

    if (!isPortfolioItem(item)) {
      return
    }

    setLocalPortfolioItems((currentItems) => [item, ...currentItems])
  }

  return (
    <section className="grid content-start gap-5">

      <CollapsibleAdminCard title="Nuevo tatuaje" description="Crear un tatuaje para publicar en la web.">
        <AdminActionForm
          action={createTattoo}
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
          <LabeledField label="Tags" alignTop>
            <TagInputField className={fieldClass} placeholder="Agregar tag" />
          </LabeledField>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActiveToggle defaultChecked={false} label="Destacado" name="is_featured" />
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
  )
}

export function AdminDesignsSection({ flashItems }: AdminDesignsSectionProps) {
  const [localFlashItems, setLocalFlashItems] = useState(flashItems)
  const [flashStatusFilter, setFlashStatusFilter] = useState<AdminStatusFilter>("all")

  function addFlashItem(_formData: FormData, result?: AdminActionResult | void) {
    const item = result?.item

    if (!isDesignItem(item)) {
      return
    }

    setLocalFlashItems((currentItems) => [item, ...currentItems])
  }

  return (
      <section className="grid content-start gap-5">

        <CollapsibleAdminCard title="Nuevo diseño" description="Crear un diseño disponible para consulta.">
          <AdminActionForm
            action={createSaleableArtwork}
            className="grid gap-3"
            onSuccess={addFlashItem}
            requiredFields={designRequiredFields}
            resetOnSuccess
          >
            <input type="hidden" name="type" value="flash" />
            <LabeledField label="Título">
              <input className={fieldClass} name="title" />
            </LabeledField>
            <FieldError name="title" className={errorIndentClass} />
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
            <LabeledField label="Tags" alignTop>
              <TagInputField className={fieldClass} placeholder="Agregar tag" />
            </LabeledField>
            <LabeledField label="Dimensiones">
              <input className={fieldClass} name="dimensions" />
            </LabeledField>
            <LabeledField label="Estado">
              <select className={fieldClass} name="status" defaultValue="Disponible">
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Reclamado">Reclamado</option>
              </select>
            </LabeledField>
            <div className="justify-self-start">
              <ActiveToggle />
            </div>
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
            <SortableDesignsList items={localFlashItems} onItemsChange={setLocalFlashItems} statusFilter={flashStatusFilter} />
          </CardContent>
        </Card>
      </section>
  )
}

export function AdminContentSections({ flashItems, portfolioItems, tattooStyles }: AdminContentSectionsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <AdminTattoosSection portfolioItems={portfolioItems} tattooStyles={tattooStyles} />
      <AdminDesignsSection flashItems={flashItems} />
    </div>
  )
}
