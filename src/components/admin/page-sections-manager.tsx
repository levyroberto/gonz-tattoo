"use client"

import { ChevronDown, ImagePlus, Images, Mail, User, type LucideIcon } from "lucide-react"
import { type FormEvent, type ReactNode, useState } from "react"

import { updateHomeSectionContent } from "@/app/admin/actions"
import { AdminActionForm } from "@/components/admin/admin-action-form"
import { ImageInput } from "@/components/admin/image-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getSectionDefinition,
  getSectionDisplayTitle,
  parseSectionContentFromForm,
  parseSectionLayoutFromForm,
  type ButtonPreviewVariant,
  type SectionFieldDefinition,
  type SectionFieldWidth,
} from "@/data/home-section-schema"
import type { EditablePageKey, PageSection, PageSectionType } from "@/data/page-sections"

const sectionBadgeIcons: Record<PageSectionType, LucideIcon> = {
  portfolioPage: Images,
  flashPage: ImagePlus,
  aboutPage: User,
  contactPage: Mail,
}

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-24 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"

type PageSectionItem = {
  pageKey: EditablePageKey
  section: PageSection
}

type PageSectionDraft = {
  content: Record<string, unknown>
  layout: Record<string, unknown>
}

type PageSectionUpdate = {
  sectionKey: string
  content: PageSection["content"]
  layout?: PageSection["layout"]
  style?: PageSection["style"]
}

function isPageSectionUpdate(item: unknown): item is PageSectionUpdate {
  return Boolean(item && typeof item === "object" && "sectionKey" in item && "content" in item)
}

function FieldWrapper({ children, width = "full" }: { children: ReactNode; width?: SectionFieldWidth }) {
  const widthClassNames: Record<SectionFieldWidth, string> = {
    full: "basis-full",
    half: "basis-full md:basis-[calc(50%-0.375rem)]",
    third: "basis-full md:basis-[calc(33.333%-0.5rem)]",
  }

  return <div className={`min-w-0 grow ${widthClassNames[width]}`}>{children}</div>
}

function FormField({ defaultValue, label, name, required = true }: { defaultValue: string; label: string; name: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <input className={fieldClass} name={name} defaultValue={defaultValue} required={required} />
    </label>
  )
}

function TextareaField({ defaultValue, label, name, required = true }: { defaultValue: string; label: string; name: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <textarea className={tallFieldClass} name={name} defaultValue={defaultValue} required={required} />
    </label>
  )
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
  required = true,
}: {
  defaultValue: string
  label: string
  name: string
  options: Array<{ label: string; value: string }>
  required?: boolean
}) {
  const hasKnownValue = options.some((option) => option.value === defaultValue)

  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <select className={fieldClass} name={name} defaultValue={defaultValue} required={required}>
        {!hasKnownValue && defaultValue && <option value={defaultValue}>{defaultValue}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const buttonPreviewClass: Record<ButtonPreviewVariant, string> = {
  primaryFilled: "border-2 border-primary bg-primary text-primary-foreground placeholder:text-primary-foreground/50",
  primaryOutline: "border-2 border-primary bg-transparent text-primary placeholder:text-primary/50",
  secondaryFilled: "border-2 border-secondary bg-secondary text-secondary-foreground placeholder:text-secondary-foreground/50",
  secondaryOutline: "border-2 border-secondary bg-transparent text-secondary placeholder:text-secondary/50",
  doubleBorder: "border border-border bg-transparent text-foreground placeholder:text-foreground/50 hover:border-primary hover:text-primary",
}

function SinglePreviewImage({ alt, src }: { alt: string; src?: string }) {
  if (!src) {
    return (
      <div className="grid h-20 place-items-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
        Sin imagen cargada
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-20 w-full rounded-md border border-border bg-muted object-cover" loading="lazy" />
  )
}

function ButtonPreviewField({
  defaultValue,
  label,
  name,
  required = true,
  variant,
}: {
  defaultValue: string
  label: string
  name: string
  required?: boolean
  variant: ButtonPreviewVariant
}) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <input
        className={`h-10 w-full rounded-md px-4 text-center font-sans text-sm uppercase tracking-widest outline-none transition-colors placeholder:normal-case placeholder:tracking-normal focus:ring-2 focus:ring-primary/40 ${buttonPreviewClass[variant]}`}
        name={name}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  )
}

function SectionFieldControl({ field, section }: { field: SectionFieldDefinition; section: PageSection }) {
  const content = section.content as Record<string, unknown>
  const layout = section.layout as Record<string, unknown>
  const style = section.style as Record<string, unknown>
  const required = field.required ?? true
  const rawValue = field.target === "style" ? style[field.key] : field.target === "layout" ? layout[field.key] : content[field.key]

  if (field.buttonPreview) {
    return (
      <ButtonPreviewField
        label={field.label}
        name={field.formName}
        defaultValue={String(rawValue ?? "")}
        required={required}
        variant={field.buttonPreview}
      />
    )
  }

  switch (field.type) {
    case "image":
      return (
        <label className="grid gap-1 text-sm text-muted-foreground">
          {field.label}
          <SinglePreviewImage alt={`Vista previa de ${field.label}`} src={typeof rawValue === "string" ? rawValue : ""} />
          <ImageInput defaultUrl={typeof rawValue === "string" ? rawValue : ""} />
        </label>
      )
    case "textarea":
      return <TextareaField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} required={required} />
    case "paragraphs":
      return (
        <TextareaField
          label={field.label}
          name={field.formName}
          defaultValue={Array.isArray(rawValue) ? (rawValue as string[]).join("\n") : ""}
          required={required}
        />
      )
    case "select":
      return <SelectField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} options={field.options ?? []} required={required} />
    case "number":
    case "text":
    default:
      return <FormField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} required={required} />
  }
}

function getPageLabel(pageKey: EditablePageKey) {
  const labels: Record<EditablePageKey, string> = {
    portfolio: "Trabajos",
    flash: "Disenos",
    about: "Sobre mi",
    contact: "Contacto",
  }

  return labels[pageKey]
}

export function PageSectionsManager({ sections }: { sections: PageSectionItem[] }) {
  const [items, setItems] = useState(sections)
  const [openPageKey, setOpenPageKey] = useState<EditablePageKey | null>(null)
  const [draft, setDraft] = useState<PageSectionDraft | null>(null)

  function toggleOpen(pageKey: EditablePageKey) {
    setDraft(null)
    setOpenPageKey((current) => (current === pageKey ? null : pageKey))
  }

  function handleSectionFormChange(section: PageSection, event: FormEvent<HTMLFormElement>) {
    const definition = getSectionDefinition(section.type)

    if (!definition) {
      return
    }

    const formData = new FormData(event.currentTarget)

    setDraft({
      content: parseSectionContentFromForm(formData, definition),
      layout: parseSectionLayoutFromForm(formData, definition),
    })
  }

  function updateSection(_formData: FormData, result?: { item?: unknown } | void) {
    const item = result?.item

    if (!isPageSectionUpdate(item)) {
      return
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.section.id === item.sectionKey
          ? {
              ...currentItem,
              section: {
                ...currentItem.section,
                content: item.content,
                ...(item.layout ? { layout: item.layout } : {}),
                ...(item.style ? { style: item.style } : {}),
              } as PageSection,
            }
          : currentItem
      )
    )
  }

  return (
    <Card className="rounded-lg border border-border/70">
      <CardHeader>
        <CardTitle>Pantallas internas</CardTitle>
        <CardDescription>Edita la seccion principal de Trabajos, Disenos, Sobre mi y Contacto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map(({ pageKey, section }) => {
          const definition = getSectionDefinition(section.type)
          const BadgeIcon = sectionBadgeIcons[section.type]
          const visibleSection = openPageKey === pageKey && draft
            ? ({ ...section, content: { ...section.content, ...draft.content }, layout: { ...section.layout, ...draft.layout } } as PageSection)
            : section

          return (
            <div key={pageKey} className="rounded-md border border-border bg-card">
              <div className="grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="cursor-pointer text-left text-lg tracking-wide transition-colors hover:text-primary"
                      aria-expanded={openPageKey === pageKey}
                      onClick={() => toggleOpen(pageKey)}
                    >
                      {getPageLabel(pageKey)}
                    </button>
                    {definition && (
                      <span
                        className={`inline-grid size-6 place-items-center rounded-sm border ${definition.badge.className}`}
                        title={definition.badge.label}
                        aria-label={definition.badge.label}
                      >
                        <BadgeIcon className="size-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label={`Editar ${getPageLabel(pageKey)}`} onClick={() => toggleOpen(pageKey)}>
                  <ChevronDown className={`transition-transform ${openPageKey === pageKey ? "rotate-180" : ""}`} aria-hidden="true" />
                </Button>
              </div>

              {openPageKey === pageKey && definition && (
                <div className="border-t border-border p-3">
                  <AdminActionForm
                    action={updateHomeSectionContent}
                    className="grid gap-3"
                    onChange={(event) => handleSectionFormChange(section, event)}
                    onSuccess={updateSection}
                  >
                    <input name="page_key" type="hidden" value={pageKey} />
                    <input name="section_key" type="hidden" value={section.id} />
                    <input name="type" type="hidden" value={section.type} />
                    <div className="flex flex-wrap gap-3">
                      {definition.fields.map((field) => (
                        <FieldWrapper key={field.formName} width={field.width}>
                          <SectionFieldControl field={field} section={visibleSection} />
                        </FieldWrapper>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Guardar pantalla</Button>
                    </div>
                  </AdminActionForm>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
