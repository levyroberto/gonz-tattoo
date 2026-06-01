"use client"

import { ChevronDown, Eye, EyeOff, GripVertical, MoveDown, MoveUp } from "lucide-react"
import { type DragEvent, useState, useTransition } from "react"

import { reorderHomeSections, updateHomeSectionContent, updateHomeSectionEnabled } from "@/app/admin/actions"
import { AdminActionForm } from "@/components/admin/admin-action-form"
import { ImageInput } from "@/components/admin/image-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HomeSection } from "@/data/home-sections"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-24 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"

type HomeSectionsManagerProps = {
  sections: HomeSection[]
}

type DropPosition = {
  id: string
  edge: "before" | "after"
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)

  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

function getDropEdge(event: DragEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  const offsetY = event.clientY - rect.top

  return offsetY < rect.height / 2 ? "before" : "after"
}

function getTargetIndex(fromIndex: number, targetIndex: number, edge: DropPosition["edge"]) {
  const targetWithEdge = edge === "after" ? targetIndex + 1 : targetIndex

  return fromIndex < targetWithEdge ? targetWithEdge - 1 : targetWithEdge
}

function DropPlaceholder() {
  return <div className="h-12 rounded-md border-2 border-dashed border-primary bg-primary/10" />
}

function getSectionTitle(section: HomeSection) {
  switch (section.type) {
    case "hero":
      return "Portada"
    case "featuredPortfolio":
      return "Trabajos destacados"
    case "flashPreview":
      return "Diseños flash"
    case "about":
      return "Sobre mí"
    case "contactCta":
      return "Contacto"
  }
}

function getSectionDescription(section: HomeSection) {
  switch (section.type) {
    case "hero":
      return section.content.eyebrow
    case "featuredPortfolio":
      return `${section.content.title} ${section.content.highlightedTitle}`
    case "flashPreview":
      return section.content.description
    case "about":
      return section.content.quote
    case "contactCta":
      return `${section.content.title} ${section.content.highlightedTitle}`
  }
}

type HomeSectionContentUpdate = {
  sectionKey: string
  content: HomeSection["content"]
  style?: HomeSection["style"]
}

function isHomeSectionContentUpdate(item: unknown): item is HomeSectionContentUpdate {
  return Boolean(item && typeof item === "object" && "sectionKey" in item && "content" in item)
}

function FormField({
  defaultValue,
  label,
  name,
  required = true,
}: {
  defaultValue: string
  label: string
  name: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <input className={fieldClass} name={name} defaultValue={defaultValue} required={required} />
    </label>
  )
}

function TextareaField({
  defaultValue,
  label,
  name,
  required = true,
}: {
  defaultValue: string
  label: string
  name: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <textarea className={tallFieldClass} name={name} defaultValue={defaultValue} required={required} />
    </label>
  )
}

function HomeSectionContentFields({ section }: { section: HomeSection }) {
  switch (section.type) {
    case "hero":
      return (
        <>
          <label className="grid gap-1 text-sm text-muted-foreground">
            Imagen de fondo
            <ImageInput defaultUrl={section.style.backgroundImage} />
          </label>
          <FormField label="Eyebrow" name="eyebrow" defaultValue={section.content.eyebrow} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Marca principal" name="brand_primary" defaultValue={section.content.brandPrimary} />
            <FormField label="Marca destacada" name="brand_accent" defaultValue={section.content.brandAccent} />
          </div>
          <TextareaField label="Descripción" name="description" defaultValue={section.content.description} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Botón principal" name="primary_button_label" defaultValue={section.content.primaryButtonLabel} />
            <FormField label="Link principal" name="primary_button_href" defaultValue={section.content.primaryButtonHref} />
            <FormField label="Botón secundario" name="secondary_button_label" defaultValue={section.content.secondaryButtonLabel} />
            <FormField label="Link secundario" name="secondary_button_href" defaultValue={section.content.secondaryButtonHref} />
          </div>
        </>
      )
    case "featuredPortfolio":
      return (
        <>
          <FormField label="Eyebrow" name="eyebrow" defaultValue={section.content.eyebrow} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Título" name="title" defaultValue={section.content.title} />
            <FormField label="Título destacado" name="highlighted_title" defaultValue={section.content.highlightedTitle} />
            <FormField label="Botón" name="button_label" defaultValue={section.content.buttonLabel} />
            <FormField label="Link del botón" name="button_href" defaultValue={section.content.buttonHref} />
          </div>
        </>
      )
    case "flashPreview":
      return (
        <>
          <FormField label="Eyebrow" name="eyebrow" defaultValue={section.content.eyebrow} />
          <FormField label="Título destacado" name="highlighted_title" defaultValue={section.content.highlightedTitle} />
          <TextareaField label="Descripción" name="description" defaultValue={section.content.description} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Botón" name="button_label" defaultValue={section.content.buttonLabel} />
            <FormField label="Link del botón" name="button_href" defaultValue={section.content.buttonHref} />
          </div>
        </>
      )
    case "about":
      return (
        <>
          <FormField label="Título" name="title" defaultValue={section.content.title} required={false} />
          <TextareaField label="Párrafos" name="paragraphs" defaultValue={section.content.paragraphs.join("\n")} />
          <TextareaField label="Quote" name="quote" defaultValue={section.content.quote} />
          <div className="grid gap-3">
            {section.content.stats.map((stat, index) => (
              <div key={stat.tone} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2">
                <input name={`stat_tone_${index}`} type="hidden" value={stat.tone} />
                <FormField label={`Métrica ${index + 1}`} name={`stat_value_${index}`} defaultValue={stat.value} />
                <FormField label="Texto" name={`stat_label_${index}`} defaultValue={stat.label} />
              </div>
            ))}
          </div>
        </>
      )
    case "contactCta":
      return (
        <>
          <FormField label="Eyebrow" name="eyebrow" defaultValue={section.content.eyebrow} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Título" name="title" defaultValue={section.content.title} />
            <FormField label="Título destacado" name="highlighted_title" defaultValue={section.content.highlightedTitle} />
          </div>
          <TextareaField label="Descripción" name="description" defaultValue={section.content.description} />
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Label WhatsApp" name="whatsapp_label" defaultValue={section.content.whatsappLabel} />
            <FormField label="Label Instagram" name="instagram_label" defaultValue={section.content.instagramLabel} />
            <FormField label="Label horario" name="hours_label" defaultValue={section.content.hoursLabel} />
          </div>
        </>
      )
  }
}

export function HomeSectionsManager({ sections }: HomeSectionsManagerProps) {
  const [orderedSections, setOrderedSections] = useState(sections)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function persistOrder(nextSections: HomeSection[]) {
    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      const result = await reorderHomeSections(nextSections.map((section) => section.id))

      if (!result.ok) {
        setIsError(true)
        setMessage("No se pudo guardar el orden")
        return
      }

      setMessage("Orden guardado")
    })
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const fromIndex = orderedSections.findIndex((section) => section.id === sectionId)
    const toIndex = fromIndex + direction

    if (fromIndex < 0 || toIndex < 0 || toIndex >= orderedSections.length) {
      return
    }

    const nextSections = moveItem(orderedSections, fromIndex, toIndex)

    setOrderedSections(nextSections)
    persistOrder(nextSections)
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, sectionId: string) {
    const ghost = document.createElement("div")

    ghost.textContent = "Mover sección"
    ghost.style.position = "fixed"
    ghost.style.top = "-1000px"
    ghost.style.left = "-1000px"
    ghost.style.padding = "8px 12px"
    ghost.style.borderRadius = "6px"
    ghost.style.background = "black"
    ghost.style.color = "white"
    ghost.style.fontSize = "12px"
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(ghost, 0, 0)
    window.setTimeout(() => ghost.remove(), 0)
    setDraggedId(sectionId)
    setDropPosition(null)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, sectionId: string) {
    event.preventDefault()

    if (draggedId === null || draggedId === sectionId) {
      setDropPosition(null)
      return
    }

    setDropPosition({ id: sectionId, edge: getDropEdge(event) })
  }

  function handleDrop(targetId: string) {
    if (draggedId === null || draggedId === targetId) {
      setDropPosition(null)
      return
    }

    const fromIndex = orderedSections.findIndex((section) => section.id === draggedId)
    const toIndex = orderedSections.findIndex((section) => section.id === targetId)

    if (fromIndex < 0 || toIndex < 0) {
      setDropPosition(null)
      return
    }

    const nextIndex = getTargetIndex(fromIndex, toIndex, dropPosition?.edge ?? "before")
    const nextSections = moveItem(orderedSections, fromIndex, nextIndex)

    setDraggedId(null)
    setDropPosition(null)
    setOrderedSections(nextSections)
    persistOrder(nextSections)
  }

  function toggleSection(sectionId: string, enabled: boolean) {
    const previousSections = orderedSections
    const nextSections = orderedSections.map((section) =>
      section.id === sectionId ? { ...section, enabled } : section
    )

    setMessage(null)
    setIsError(false)
    setOrderedSections(nextSections)

    startTransition(async () => {
      const formData = new FormData()

      formData.set("section_key", sectionId)

      if (enabled) {
        formData.set("enabled", "on")
      }

      const result = await updateHomeSectionEnabled(formData)

      if (!result.ok) {
        setOrderedSections(previousSections)
        setIsError(true)
        setMessage("No se pudo cambiar la visibilidad")
        return
      }

      setMessage("Visibilidad guardada")
    })
  }

  function updateSectionContent(_formData: FormData, result?: { item?: unknown } | void) {
    const item = result?.item

    if (!isHomeSectionContentUpdate(item)) {
      return
    }

    setOrderedSections((currentSections) =>
      currentSections.map((section) =>
        section.id === item.sectionKey
          ? { ...section, content: item.content, ...(item.style ? { style: item.style } : {}) } as HomeSection
          : section
      )
    )
  }

  return (
    <Card className="rounded-lg border border-border/70">
      <CardHeader>
        <CardTitle>Secciones de la home</CardTitle>
        <CardDescription>Activá, ocultá y reordená los bloques principales de la página inicial.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3" aria-busy={isPending}>
          {message && <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>{message}</p>}
          {orderedSections.map((section, index) => (
            <div
              key={section.id}
              className="grid gap-2"
              onDragOver={(event) => handleDragOver(event, section.id)}
              onDrop={() => handleDrop(section.id)}
            >
              {dropPosition?.id === section.id && dropPosition.edge === "before" && <DropPlaceholder />}
              <div
                className={`grid gap-3 rounded-md border bg-card p-3 transition-opacity md:grid-cols-[auto_auto_1fr_auto] md:items-center ${
                  section.enabled ? "border-border" : "border-dashed border-destructive/50 opacity-65"
                } ${
                  draggedId === section.id ? "opacity-40" : ""
                }`}
              >
                <button
                  aria-label={`Arrastrar ${getSectionTitle(section)}`}
                  className="hidden cursor-grab text-muted-foreground transition-colors hover:text-primary active:cursor-grabbing md:block"
                  draggable
                  onDragEnd={() => {
                    setDraggedId(null)
                    setDropPosition(null)
                  }}
                  onDragStart={(event) => handleDragStart(event, section.id)}
                  type="button"
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>

                <div className="flex gap-1 md:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Subir ${getSectionTitle(section)}`}
                    disabled={index === 0 || isPending}
                    onClick={() => moveSection(section.id, -1)}
                  >
                    <MoveUp aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Bajar ${getSectionTitle(section)}`}
                    disabled={index === orderedSections.length - 1 || isPending}
                    onClick={() => moveSection(section.id, 1)}
                  >
                    <MoveDown aria-hidden="true" />
                  </Button>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg tracking-wide">{getSectionTitle(section)}</p>
                    <span className="rounded-sm border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {section.type}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{getSectionDescription(section)}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-self-start md:justify-self-end">
                  <Button
                    type="button"
                    variant={section.enabled ? "outline" : "default"}
                    disabled={isPending}
                    onClick={() => toggleSection(section.id, !section.enabled)}
                  >
                    {section.enabled ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    {section.enabled ? "Ocultar" : "Mostrar"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${getSectionTitle(section)}`}
                    aria-expanded={openSectionId === section.id}
                    onClick={() => setOpenSectionId(openSectionId === section.id ? null : section.id)}
                  >
                    <ChevronDown
                      className={`transition-transform ${openSectionId === section.id ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
              {openSectionId === section.id && (
                <div className="rounded-md border border-border bg-card p-3">
                  <AdminActionForm action={updateHomeSectionContent} className="grid gap-3" onSuccess={updateSectionContent}>
                    <input name="section_key" type="hidden" value={section.id} />
                    <input name="type" type="hidden" value={section.type} />
                    <HomeSectionContentFields section={section} />
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline">
                        Guardar contenido
                      </Button>
                    </div>
                  </AdminActionForm>
                </div>
              )}
              {dropPosition?.id === section.id && dropPosition.edge === "after" && <DropPlaceholder />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
