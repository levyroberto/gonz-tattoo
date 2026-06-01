"use client"

import { ChevronDown, Eye, EyeOff, GripVertical, MoveDown, MoveUp } from "lucide-react"
import { type DragEvent, useState, useTransition } from "react"

import { createHomeSection, reorderHomeSections, updateHomeSectionContent, updateHomeSectionEnabled } from "@/app/admin/actions"
import { AdminActionForm } from "@/components/admin/admin-action-form"
import { ImageInput } from "@/components/admin/image-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"
import { normalizeInternalLink } from "@/lib/internal-links"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-24 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"
const internalLinkOptions = [
  { label: "Trabajos", value: "/trabajos" },
  { label: "Diseños flash", value: "/disenos" },
  { label: "Sobre mí", value: "/sobre-mi" },
  { label: "Contacto", value: "/contact" },
  { label: "Inicio", value: "/" },
]

type HomeSectionsManagerProps = {
  flashPreviewItems: FlashDesign[]
  flashStyles: string[]
  portfolioPreviewItems: Tattoo[]
  tattooStyles: string[]
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
      return "Galería destacada"
    case "flashPreview":
      return "Diseños listos"
    case "about":
      return "Sobre mí"
    case "contactCta":
      return "Bloque de contacto"
  }
}

function getSectionDescription(section: HomeSection) {
  switch (section.type) {
    case "hero":
      return "Primera pantalla de la web. Muestra imagen de fondo, título principal, texto corto y botones."
    case "featuredPortfolio":
      return "Muestra los tatuajes marcados como destacados en Portfolio."
    case "flashPreview":
      return "Muestra los primeros diseños flash activos."
    case "about":
      return "Muestra foto del artista, presentación, frase destacada y métricas."
    case "contactCta":
      return "Muestra texto de consulta, botones de WhatsApp/Instagram, dirección y horarios."
  }
}

function getSectionContents(section: HomeSection) {
  switch (section.type) {
    case "hero":
      return ["Imagen de fondo", "Título principal", "Texto corto", "Botones"]
    case "featuredPortfolio":
      return ["Título", "Carrusel", "Tatuajes destacados", "Botón a Portfolio"]
    case "flashPreview":
      return ["Título", "Descripción", "Grilla de diseños", "Botón a Diseños"]
    case "about":
      return ["Imagen", "Presentación", "Frase destacada", "Métricas"]
    case "contactCta":
      return ["Texto de consulta", "WhatsApp", "Instagram", "Dirección y horarios"]
  }
}

function getSectionSource(section: HomeSection) {
  switch (section.type) {
    case "hero":
      return "Contenido de Portada"
    case "featuredPortfolio":
      return "Portfolio > destacados"
    case "flashPreview":
      return "Diseños flash activos"
    case "about":
      return "Contenido de Sobre mí"
    case "contactCta":
      return "Datos del estudio + Bloque de contacto"
  }
}

function getSectionContentType(section: HomeSection) {
  switch (section.type) {
    case "featuredPortfolio":
      return {
        label: "Tatuajes",
        description: "Esta sección muestra trabajos cargados en Portfolio.",
        className: "border-primary/35 bg-primary/10 text-primary",
      }
    case "flashPreview":
      return {
        label: "Diseños",
        description: "Esta sección muestra diseños flash cargados en Diseños.",
        className: "border-secondary/35 bg-secondary/10 text-secondary",
      }
    case "hero":
      return {
        label: "Portada",
        description: "Esta sección muestra contenido editorial de la home.",
        className: "border-border bg-muted text-muted-foreground",
      }
    case "about":
      return {
        label: "Sobre mí",
        description: "Esta sección muestra la presentación del artista.",
        className: "border-border bg-muted text-muted-foreground",
      }
    case "contactCta":
      return {
        label: "Contacto",
        description: "Esta sección muestra datos de contacto y llamados a consulta.",
        className: "border-border bg-muted text-muted-foreground",
      }
  }
}

function PreviewImageStrip({ images }: { images: Array<{ alt: string; src?: string }> }) {
  const visibleImages = images.filter((image) => image.src).slice(0, 3)

  if (visibleImages.length === 0) {
    return (
      <div className="grid h-16 place-items-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
        Sin imágenes cargadas
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {visibleImages.map((image) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.alt}-${image.src}`}
          src={image.src}
          alt={image.alt}
          className="h-16 w-full rounded-md border border-border bg-muted object-cover"
          loading="lazy"
        />
      ))}
    </div>
  )
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

function ContactPreviewBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {["WhatsApp", "Instagram", "Dirección", "Horario"].map((item) => (
        <span key={item} className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
          {item}
        </span>
      ))}
    </div>
  )
}

function SectionPreview({
  flashPreviewItems,
  portfolioPreviewItems,
  section,
}: {
  flashPreviewItems: FlashDesign[]
  portfolioPreviewItems: Tattoo[]
  section: HomeSection
}) {
  switch (section.type) {
    case "hero":
      return <SinglePreviewImage alt="Vista previa de portada" src={section.style.backgroundImage} />
    case "featuredPortfolio":
      return <PreviewImageStrip images={portfolioPreviewItems.map((item) => ({ alt: item.title, src: item.image }))} />
    case "flashPreview":
      return <PreviewImageStrip images={flashPreviewItems.map((item) => ({ alt: item.name, src: item.image }))} />
    case "about":
      return <SinglePreviewImage alt="Vista previa de Sobre mí" src={section.style.image} />
    case "contactCta":
      return <ContactPreviewBadges />
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

function isHomeSection(item: unknown): item is HomeSection {
  return Boolean(item && typeof item === "object" && "id" in item && "type" in item && "content" in item)
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

function StyleFilterSelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string
  label: string
  name: string
  options: string[]
}) {
  const normalizedOptions = Array.from(new Set(options.map((option) => option.trim()).filter(Boolean)))
  const hasKnownValue = normalizedOptions.some((option) => option.toLowerCase() === defaultValue.toLowerCase())

  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <select className={fieldClass} name={name} defaultValue={defaultValue}>
        <option value="">Todos los estilos</option>
        {!hasKnownValue && defaultValue && <option value={defaultValue}>{defaultValue}</option>}
        {normalizedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function LinkSelectField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string
  label: string
  name: string
}) {
  const normalizedDefaultValue = normalizeInternalLink(defaultValue)
  const hasKnownValue = internalLinkOptions.some((option) => option.value === normalizedDefaultValue)

  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <select className={fieldClass} name={name} defaultValue={normalizedDefaultValue} required>
        {!hasKnownValue && normalizedDefaultValue && <option value={normalizedDefaultValue}>{normalizedDefaultValue}</option>}
        {internalLinkOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function CheckboxField({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked: boolean
  label: string
  name: string
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
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

function HomeSectionContentFields({
  flashStyles,
  section,
  tattooStyles,
}: {
  flashStyles: string[]
  section: HomeSection
  tattooStyles: string[]
}) {
  const contentType = getSectionContentType(section)

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
            <LinkSelectField label="Link principal" name="primary_button_href" defaultValue={section.content.primaryButtonHref} />
            <FormField label="Botón secundario" name="secondary_button_label" defaultValue={section.content.secondaryButtonLabel} />
            <LinkSelectField label="Link secundario" name="secondary_button_href" defaultValue={section.content.secondaryButtonHref} />
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
            <LinkSelectField label="Link del botón" name="button_href" defaultValue={section.content.buttonHref} />
          </div>
          <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <span className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${contentType.className}`}>
                Tipo de contenido: {contentType.label}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{contentType.description}</p>
            </div>
            <FormField label="Tags a mostrar" name="filter_tags" defaultValue={section.content.filterTags} required={false} />
            <StyleFilterSelectField label="Estilo a mostrar" name="filter_style" defaultValue={section.content.filterStyle} options={tattooStyles} />
            <FormField label="Desde fecha" name="date_from" defaultValue={section.content.dateFrom} required={false} />
            <FormField label="Hasta fecha" name="date_to" defaultValue={section.content.dateTo} required={false} />
            <FormField label="Cantidad máxima" name="limit" defaultValue={String(section.content.limit)} />
            <CheckboxField label="Solo destacados" name="featured_only" defaultChecked={section.content.featuredOnly} />
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
            <LinkSelectField label="Link del botón" name="button_href" defaultValue={section.content.buttonHref} />
          </div>
          <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <span className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-medium ${contentType.className}`}>
                Tipo de contenido: {contentType.label}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{contentType.description}</p>
            </div>
            <FormField label="Tags a mostrar" name="filter_tags" defaultValue={section.content.filterTags} required={false} />
            <StyleFilterSelectField label="Estilo a mostrar" name="filter_style" defaultValue={section.content.filterStyle} options={flashStyles} />
            <FormField label="Cantidad máxima" name="limit" defaultValue={String(section.content.limit)} />
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

export function HomeSectionsManager({
  flashPreviewItems,
  flashStyles,
  portfolioPreviewItems,
  sections,
  tattooStyles,
}: HomeSectionsManagerProps) {
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

  function addSection(_formData: FormData, result?: { item?: unknown } | void) {
    const item = result?.item

    if (isHomeSection(item)) {
      setOrderedSections((currentSections) => [...currentSections, item])
    }
  }

  return (
    <Card className="rounded-lg border border-border/70">
      <CardHeader>
        <CardTitle>Secciones de la home</CardTitle>
        <CardDescription>Activá, ocultá y reordená los bloques principales de la página inicial.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3" aria-busy={isPending}>
          <AdminActionForm action={createHomeSection} className="grid gap-2 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-[1fr_auto]" onSuccess={addSection} resetOnSuccess>
            <select className={fieldClass} name="type" defaultValue="featuredPortfolio">
              <option value="featuredPortfolio">Tatuajes - nueva galería filtrable</option>
              <option value="flashPreview">Diseños - nueva sección filtrable</option>
            </select>
            <Button type="submit" variant="outline">
              Agregar sección
            </Button>
          </AdminActionForm>

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
                className={`grid gap-3 rounded-md border bg-card p-3 transition-opacity md:grid-cols-[auto_auto_1fr_minmax(11rem,14rem)_auto] md:items-center ${
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
                    <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${getSectionContentType(section).className}`}>
                      Tipo: {getSectionContentType(section).label}
                    </span>
                    <span className="rounded-sm border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {getSectionSource(section)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{getSectionDescription(section)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getSectionContents(section).map((item) => (
                      <span key={item} className="rounded-sm border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:justify-self-stretch">
                  <SectionPreview
                    section={section}
                    portfolioPreviewItems={portfolioPreviewItems}
                    flashPreviewItems={flashPreviewItems}
                  />
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
                    <HomeSectionContentFields section={section} tattooStyles={tattooStyles} flashStyles={flashStyles} />
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
