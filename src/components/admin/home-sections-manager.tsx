"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react"
import { type FormEvent, type ReactNode, useEffect, useRef, useState, useTransition } from "react"

import { createHomeSection, deleteHomeSection, reorderHomeSections, updateHomeSectionContent, updateHomeSectionEnabled } from "@/app/admin/actions"
import { AdminActionForm, FormMessage } from "@/components/admin/admin-action-form"
import { ButtonPreviewField } from "@/components/admin/button-preview-field"
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal"
import { ImageInput } from "@/components/admin/image-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SaleableArtwork as FlashDesign } from "@/data/artworks"
import type { HomeSection } from "@/data/home-sections"
import {
  SECTION_DEFINITIONS,
  getCreatableSectionDefinitions,
  getSectionDefinition,
  getSectionDisplayTitle,
  parseSectionContentFromForm,
  parseSectionLayoutFromForm,
  type SectionFieldDefinition,
  type SectionFieldWidth,
} from "@/data/home-section-schema"
import type { TattooArtwork as Tattoo } from "@/data/artworks"
import { filterFlashDesigns, filterPortfolioItems } from "@/lib/home-section-filters"
import { normalizeInternalLink } from "@/lib/internal-links"

const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-24 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"
const internalLinkOptions = [
  { label: "Trabajos", value: "/trabajos" },
  { label: "Diseños flash", value: "/disenos" },
  { label: "Sobre mí", value: "/#about" },
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

// function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
//   const nextItems = [...items]
//   const [movedItem] = nextItems.splice(fromIndex, 1)
//
//   nextItems.splice(toIndex, 0, movedItem)
//   return nextItems
// }

function StatusBadge({ isActive }: { isActive?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-sm border px-2 py-0.5 text-xs uppercase tracking-wider ${
        isActive
          ? "border-green-500/40 bg-green-500/10 text-green-400"
          : "border-destructive/50 bg-destructive/10 text-destructive"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  )
}

function SectionActiveToggle({
  disabled,
  isActive,
  onChange,
}: {
  disabled: boolean
  isActive: boolean
  onChange: (isActive: boolean) => void
}) {
  return (
    <label className="flex h-9 cursor-pointer items-center gap-3 rounded-md border border-border px-3 text-sm text-muted-foreground has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        checked={isActive}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        type="checkbox"
      />
      <span
        className={`relative h-5 w-9 rounded-full ring-1 ring-border transition-colors ${
          isActive ? "bg-green-500/80" : "bg-muted"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-foreground transition-transform ${
            isActive ? "translate-x-4" : ""
          }`}
        />
      </span>
      {isActive ? "Activo" : "Inactivo"}
    </label>
  )
}

type SortableSectionFrameRenderProps = {
  attributes: ReturnType<typeof useSortable>["attributes"]
  isDragging: boolean
  listeners: ReturnType<typeof useSortable>["listeners"]
  setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"]
}

function SortableSectionFrame({
  children,
  id,
}: {
  children: (props: SortableSectionFrameRenderProps) => ReactNode
  id: string
}) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="grid gap-2">
      {children({ attributes, isDragging, listeners, setActivatorNodeRef })}
    </div>
  )
}

function getSectionTitle(section: HomeSection) {
  return getSectionDisplayTitle(section)
}

function getSectionDescription(section: HomeSection) {
  const description = (section.content as Record<string, unknown>).description

  return typeof description === "string" ? description.trim() : ""
}

function getSectionContentType(section: HomeSection) {
  return getSectionDefinition(section.type)?.badge ?? SECTION_DEFINITIONS.hero.badge
}

type PreviewImageItem = {
  alt: string
  id: number
  src?: string
}

function SortablePreviewImage({ image }: { image: PreviewImageItem }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: `preview-${image.id}` })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`size-16 shrink-0 touch-pan-x cursor-grab overflow-hidden rounded-md border border-border bg-muted transition-opacity active:cursor-grabbing ${
        isDragging ? "cursor-grabbing opacity-50" : ""
      }`}
      type="button"
      aria-label={`Reordenar ${image.alt}`}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className="size-full object-cover" loading="lazy" />
    </button>
  )
}

function getPreviewSortableId(sortableId: string | number) {
  return Number(String(sortableId).replace(/^preview-/, ""))
}

function PreviewImageStrip({
  images,
  itemOrder,
  onReorder,
}: {
  images: PreviewImageItem[]
  itemOrder?: number[]
  onReorder?: (itemIds: number[]) => void
}) {
  const visibleImages = images.filter((image) => image.src)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (visibleImages.length === 0) {
    return (
      <div className="grid h-16 place-items-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
        Sin imágenes que coincidan
      </div>
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = getPreviewSortableId(event.active.id)
    const overId = event.over ? getPreviewSortableId(event.over.id) : null

    if (overId === null || activeId === overId) {
      return
    }

    const fromIndex = visibleImages.findIndex((image) => image.id === activeId)
    const toIndex = visibleImages.findIndex((image) => image.id === overId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextVisibleImages = arrayMove(visibleImages, fromIndex, toIndex)
    const visibleIds = new Set(visibleImages.map((image) => image.id))
    const hiddenOrderedIds = (itemOrder ?? []).filter((id) => !visibleIds.has(id))

    onReorder?.([...nextVisibleImages.map((image) => image.id), ...hiddenOrderedIds])
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <DndContext id="section-preview-images-sortable" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleImages.map((image) => `preview-${image.id}`)} strategy={horizontalListSortingStrategy}>
          <div className="flex w-full min-w-0 max-w-[25.875rem] touch-pan-x gap-1.5 overflow-x-auto pb-1">
            {visibleImages.map((image) => (
              <SortablePreviewImage key={image.id} image={image} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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

function SectionPreview({
  flashPreviewItems,
  onItemOrderChange,
  portfolioPreviewItems,
  section,
}: {
  flashPreviewItems: FlashDesign[]
  onItemOrderChange?: (sectionId: string, itemIds: number[]) => void
  portfolioPreviewItems: Tattoo[]
  section: HomeSection
}) {
  switch (section.type) {
    case "hero":
      return null
    case "featuredPortfolio":
      return (
        <PreviewImageStrip
          images={filterPortfolioItems(portfolioPreviewItems, section, { applyLimit: false }).map((item) => ({ alt: item.title, id: item.id, src: item.image }))}
          itemOrder={section.content.itemOrder}
          onReorder={(itemIds) => onItemOrderChange?.(section.id, itemIds)}
        />
      )
    case "flashPreview":
      return (
        <PreviewImageStrip
          images={filterFlashDesigns(flashPreviewItems, section, { applyLimit: false }).map((item) => ({ alt: item.title, id: item.id, src: item.image }))}
          itemOrder={section.content.itemOrder}
          onReorder={(itemIds) => onItemOrderChange?.(section.id, itemIds)}
        />
      )
    case "about":
      return null
    case "contactCta":
      return null
  }
}

type HomeSectionContentUpdate = {
  sectionKey: string
  content: HomeSection["content"]
  layout?: HomeSection["layout"]
  style?: HomeSection["style"]
}

type HomeSectionDraft = {
  content: Record<string, unknown>
  layout: Record<string, unknown>
}

function isHomeSectionContentUpdate(item: unknown): item is HomeSectionContentUpdate {
  return Boolean(item && typeof item === "object" && "sectionKey" in item && "content" in item)
}

function isHomeSection(item: unknown): item is HomeSection {
  return Boolean(item && typeof item === "object" && "id" in item && "type" in item && "content" in item)
}

function isGallerySection(section: HomeSection): section is Extract<HomeSection, { type: "featuredPortfolio" | "flashPreview" }> {
  return section.type === "featuredPortfolio" || section.type === "flashPreview"
}

function getGallerySectionItemOrderValue(section: HomeSection) {
  return isGallerySection(section) ? section.content.itemOrder.join(",") : ""
}

function FormField({
  defaultValue,
  label,
  name,
  required = true,
  type = "text",
  min,
  max,
}: {
  defaultValue: string
  label: string
  name: string
  required?: boolean
  type?: "number" | "text"
  min?: number
  max?: number
}) {
  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <input
        className={fieldClass}
        name={name}
        defaultValue={defaultValue}
        inputMode={type === "number" ? "numeric" : undefined}
        max={max}
        min={min}
        required={required}
        step={type === "number" ? 1 : undefined}
        type={type}
      />
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

function ColumnCountField({
  defaultValue,
  layoutStyle,
  name,
}: {
  defaultValue: string
  layoutStyle: string
  name: string
}) {
  if (layoutStyle === "framed-grid") {
    return (
      <SelectField
        label="Columnas a mostrar"
        name={name}
        defaultValue={defaultValue}
        options={[
          { label: "2", value: "2" },
          { label: "3", value: "3" },
        ]}
      />
    )
  }

  return (
    <FormField
      label="Columnas a mostrar"
      name={name}
      defaultValue={defaultValue}
      required
      type="number"
      min={2}
      max={8}
    />
  )
}

function parseTagFilterValue(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function TagFilterField({
  defaultValue,
  label,
  name,
}: {
  defaultValue: string
  label: string
  name: string
}) {
  const [tags, setTags] = useState(() => parseTagFilterValue(defaultValue))
  const [draftTag, setDraftTag] = useState("")
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const hiddenInput = hiddenInputRef.current

    hiddenInput?.dispatchEvent(new Event("change", { bubbles: true }))
    hiddenInput?.dispatchEvent(new Event("input", { bubbles: true }))
    hiddenInput?.form?.dispatchEvent(new Event("change", { bubbles: true }))
    hiddenInput?.form?.dispatchEvent(new Event("input", { bubbles: true }))
  }, [tags])

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
    <label className="grid gap-1 text-sm text-muted-foreground">
      {label}
      <input ref={hiddenInputRef} name={name} type="hidden" value={tags.join(", ")} readOnly />
      <div className="grid gap-2">
        {tags.map((tag) => (
          <div key={tag} className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className={`${fieldClass} disabled:opacity-75`}
              value={tag}
              disabled
              aria-label={`Tag ${tag}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Quitar tag ${tag}`}
              onClick={() => removeTag(tag)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            className={fieldClass}
            value={draftTag}
            onChange={(event) => setDraftTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addTag()
              }
            }}
            placeholder="Agregar tag"
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
    <div className="grid gap-1">
      <span className="hidden text-sm md:block md:invisible" aria-hidden="true">
        .
      </span>
      <label className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground">
        <input name={name} type="checkbox" defaultChecked={defaultChecked} />
        {label}
      </label>
    </div>
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

const fieldWidthClass: Record<SectionFieldWidth, string> = {
  full: "w-full",
  half: "w-full md:w-[calc(50%-0.375rem)]",
  third: "w-full md:w-[calc(33.333%-0.5rem)]",
}

function FieldWrapper({ children, width = "full" }: { children: ReactNode; width?: SectionFieldWidth }) {
  return <div className={fieldWidthClass[width]}>{children}</div>
}

function SectionFieldControl({
  field,
  flashStyles,
  section,
  tattooStyles,
}: {
  field: SectionFieldDefinition
  flashStyles: string[]
  section: HomeSection
  tattooStyles: string[]
}) {
  const content = section.content as Record<string, unknown>
  const layout = section.layout as Record<string, unknown>
  const style = section.style as Record<string, unknown>
  const required = field.required ?? true
  const rawValue = field.target === "style" ? style[field.key] : field.target === "layout" ? layout[field.key] : content[field.key]

  if (field.key === "columnsDesktop") {
    return (
      <ColumnCountField
        name={field.formName}
        defaultValue={String(rawValue ?? "")}
        layoutStyle={String(layout.layoutStyle ?? "")}
      />
    )
  }

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

  if (field.key === "filterTags") {
    return <TagFilterField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} />
  }

  switch (field.type) {
    case "image":
      return (
        <div className="grid gap-1 text-sm text-muted-foreground">
          <span>{field.label}</span>
          <SinglePreviewImage alt={`Vista previa de ${field.label}`} src={typeof rawValue === "string" ? rawValue : ""} />
          <ImageInput defaultUrl={typeof rawValue === "string" ? rawValue : ""} />
        </div>
      )
    case "textarea":
      return <TextareaField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} required={required} />
    case "select":
      return (
        <SelectField
          label={field.label}
          name={field.formName}
          defaultValue={String(rawValue ?? "")}
          options={field.options ?? []}
          required={required}
        />
      )
    case "paragraphs":
      return (
        <TextareaField
          label={field.label}
          name={field.formName}
          defaultValue={Array.isArray(rawValue) ? (rawValue as string[]).join("\n") : ""}
          required={required}
        />
      )
    case "checkbox":
      return <CheckboxField label={field.label} name={field.formName} defaultChecked={Boolean(rawValue)} />
    case "internalLink":
      return <LinkSelectField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} />
    case "styleFilter":
      return (
        <StyleFilterSelectField
          label={field.label}
          name={field.formName}
          defaultValue={String(rawValue ?? "")}
          options={field.styleOptions === "flash" ? flashStyles : tattooStyles}
        />
      )
    case "number":
      return <FormField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} required={required} type="number" min={field.min} max={field.max} />
    case "text":
    default:
      return <FormField label={field.label} name={field.formName} defaultValue={String(rawValue ?? "")} required={required} />
  }
}

function getFilterSummaryBadges(section: HomeSection) {
  const content = section.content as Record<string, unknown>
  const badges: string[] = []
  const filterTags = String(content.filterTags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  const filterStyle = String(content.filterStyle ?? "").trim()
  const dateFrom = String(content.dateFrom ?? "").trim()
  const dateTo = String(content.dateTo ?? "").trim()

  if (filterTags.length > 0) {
    badges.push(`Tags: ${filterTags.join(", ")}`)
  }

  if (filterStyle) {
    badges.push(`Estilo: ${filterStyle}`)
  }

  if (dateFrom) {
    badges.push(`Desde: ${dateFrom}`)
  }

  if (dateTo) {
    badges.push(`Hasta: ${dateTo}`)
  }

  if (content.featuredOnly === true) {
    badges.push("Solo destacados")
  }

  return badges
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
  const definition = getSectionDefinition(section.type)

  if (!definition) {
    return null
  }

  const mainFields = definition.fields.filter((field) => {
    const layoutStyle = "layoutStyle" in section.layout ? section.layout.layoutStyle : ""

    if (
      field.key === "columnsDesktop" &&
      (layoutStyle === "bento-grid" || layoutStyle === "carousel" || layoutStyle === "wide-grid" || layoutStyle === "grunge-gallery")
    ) {
      return false
    }

    return !field.inFilterBox
  })
  const filterFields = definition.fields.filter((field) => field.inFilterBox)
  const filterSummaryBadges = getFilterSummaryBadges(section)

  if (filterFields.length > 0) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="grid content-start gap-3">
          <div className="border-b border-border pb-2">
            <p className="text-base uppercase tracking-wider text-foreground">Textos y apariencia</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {mainFields.map((field) => (
              <FieldWrapper key={field.formName} width={field.width}>
                <SectionFieldControl field={field} section={section} tattooStyles={tattooStyles} flashStyles={flashStyles} />
              </FieldWrapper>
            ))}
          </div>
        </div>

        <div className="hidden w-px bg-border lg:block" aria-hidden="true" />

        <div className="grid content-start gap-3">
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            <p className="text-base uppercase tracking-wider text-foreground">Contenido mostrado</p>
            <div className="flex flex-wrap gap-1.5">
              {filterSummaryBadges.length > 0 ? (
                filterSummaryBadges.map((badge) => (
                  <span key={badge} className="rounded-sm border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
                    {badge}
                  </span>
                ))
              ) : (
                <span className="rounded-sm border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
                  Sin filtros
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterFields.map((field) => (
              <FieldWrapper key={field.formName} width={field.width}>
                <SectionFieldControl field={field} section={section} tattooStyles={tattooStyles} flashStyles={flashStyles} />
              </FieldWrapper>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3">
        <div className="border-b border-border pb-2">
          <p className="text-base uppercase tracking-wider text-foreground">Textos y apariencia</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {mainFields.map((field) => (
            <FieldWrapper key={field.formName} width={field.width}>
              <SectionFieldControl field={field} section={section} tattooStyles={tattooStyles} flashStyles={flashStyles} />
            </FieldWrapper>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HomeSectionsManager({
  flashPreviewItems,
  flashStyles,
  portfolioPreviewItems,
  sections,
  tattooStyles,
}: HomeSectionsManagerProps) {
  const [orderedSections, setOrderedSections] = useState(sections)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  const [dirtySectionIds, setDirtySectionIds] = useState<Set<string>>(new Set())
  const [draftContent, setDraftContent] = useState<HomeSectionDraft | null>(null)
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  // function moveSection(sectionId: string, direction: -1 | 1) {
  //   const fromIndex = orderedSections.findIndex((section) => section.id === sectionId)
  //   const toIndex = fromIndex + direction
  //
  //   if (fromIndex < 0 || toIndex < 0 || toIndex >= orderedSections.length) {
  //     return
  //   }
  //
  //   const nextSections = moveItem(orderedSections, fromIndex, toIndex)
  //
  //   setOrderedSections(nextSections)
  //   persistOrder(nextSections)
  // }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null

    if (overId === null || activeId === overId) {
      return
    }

    const fromIndex = orderedSections.findIndex((section) => section.id === activeId)
    const toIndex = orderedSections.findIndex((section) => section.id === overId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextSections = arrayMove(orderedSections, fromIndex, toIndex)

    setOpenSectionId(null)
    setOrderedSections(nextSections)
    persistOrder(nextSections)
  }

  function toggleOpenSection(sectionId: string) {
    setDraftContent(null)
    setOpenSectionId((current) => (current === sectionId ? null : sectionId))
  }

  function handleSectionFormChange(section: HomeSection, event: FormEvent<HTMLFormElement>) {
    const definition = getSectionDefinition(section.type)

    if (!definition) {
      return
    }

    setDraftContent({
      content: parseSectionContentFromForm(new FormData(event.currentTarget), definition),
      layout: parseSectionLayoutFromForm(new FormData(event.currentTarget), definition),
    })
  }

  function updateSectionItemOrder(sectionId: string, itemIds: number[]) {
    if (openSectionId !== sectionId) {
      setOpenSectionId(sectionId)
    }

    setDraftContent((currentDraft) => ({
      content: {
        ...(currentDraft?.content ?? {}),
        itemOrder: itemIds,
      },
      layout: currentDraft?.layout ?? {},
    }))
  }

  function removeSection(sectionId: string) {
    const previousSections = orderedSections

    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      const formData = new FormData()

      formData.set("section_key", sectionId)

      const result = await deleteHomeSection(formData)

      if (!result.ok) {
        setOrderedSections(previousSections)
        setIsError(true)
        setMessage("No se pudo borrar la sección")
        return
      }

      setOrderedSections((currentSections) => currentSections.filter((section) => section.id !== sectionId))

      if (openSectionId === sectionId) {
        setOpenSectionId(null)
      }

      setMessage("Sección borrada")
    })

    setDeletingSectionId(null)
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
          ? { ...section, content: item.content, ...(item.layout ? { layout: item.layout } : {}), ...(item.style ? { style: item.style } : {}) } as HomeSection
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

  const deletingSection = orderedSections.find((section) => section.id === deletingSectionId) ?? null

  function getSectionWithDraft(section: HomeSection) {
    if (openSectionId !== section.id || !draftContent) {
      return section
    }

    return {
      ...section,
      content: { ...section.content, ...draftContent.content },
      layout: { ...section.layout, ...draftContent.layout },
    } as HomeSection
  }

  return (
    <Card className="rounded-lg border border-border/70">
      <CardHeader>
        <CardTitle>Secciones de la home</CardTitle>
        <CardDescription>Activá, ocultá y reordená los bloques principales de la página inicial.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3" aria-busy={isPending}>
          <AdminActionForm action={createHomeSection} className="grid gap-2 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-[1fr_auto_auto]" onSuccess={addSection} resetOnSuccess>
            <input className={fieldClass} name="title" placeholder="Título de la sección" required />
            <select className={fieldClass} name="type" defaultValue={getCreatableSectionDefinitions()[0]?.type}>
              {getCreatableSectionDefinitions().map((definition) => (
                <option key={definition.type} value={definition.type}>
                  {definition.badge.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Crear nueva sección
            </Button>
          </AdminActionForm>

          {message && <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>{message}</p>}
          <DndContext id="home-sections-sortable" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
              {orderedSections.map((section) => (
                <SortableSectionFrame key={section.id} id={section.id}>
                  {({ attributes, isDragging, listeners, setActivatorNodeRef }) => (
              <div
                className={`rounded-md border bg-card transition-opacity ${
                  section.enabled ? "border-border" : "border-dashed border-destructive/50 opacity-65"
                } ${
                  isDragging ? "opacity-40" : ""
                }`}
              >
                <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 p-3 md:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,14rem)_auto] md:items-center">
                  <button
                    aria-label={`Arrastrar ${getSectionTitle(section)}`}
                    className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-primary active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                    ref={setActivatorNodeRef}
                    style={{ touchAction: "none" }}
                    type="button"
                  >
                    <GripVertical className="size-4" aria-hidden="true" />
                  </button>

                  {/* <div className="flex gap-1 md:hidden">
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
                </div> */}

                  <div className="min-w-0 md:col-auto">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="cursor-pointer text-left text-lg tracking-wide transition-colors hover:text-primary"
                          aria-expanded={openSectionId === section.id}
                          onClick={() => toggleOpenSection(section.id)}
                        >
                          {getSectionTitle(section)}
                        </button>
                        <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${getSectionContentType(section).className}`}>
                          {getSectionContentType(section).label}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 md:hidden">
                        <StatusBadge isActive={section.enabled} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${getSectionTitle(section)}`}
                          aria-expanded={openSectionId === section.id}
                          onClick={() => toggleOpenSection(section.id)}
                        >
                          <ChevronDown
                            className={`transition-transform ${openSectionId === section.id ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </div>
                    {getSectionDescription(getSectionWithDraft(section)) && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {getSectionDescription(getSectionWithDraft(section))}
                      </p>
                    )}
                  </div>

                  <div className="col-start-2 min-w-0 max-w-full overflow-hidden md:col-auto md:justify-self-stretch">
                    <SectionPreview
                      section={getSectionWithDraft(section)}
                      portfolioPreviewItems={portfolioPreviewItems}
                      flashPreviewItems={flashPreviewItems}
                      onItemOrderChange={updateSectionItemOrder}
                    />
                  </div>

                  <div className="col-start-2 flex flex-wrap items-center gap-2 justify-self-start md:col-auto md:justify-self-end">
                    {dirtySectionIds.has(section.id) && openSectionId !== section.id && (
                      <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                        sin guardar
                      </span>
                    )}
                    <div className="hidden md:block">
                      <StatusBadge isActive={section.enabled} />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hidden md:inline-flex"
                      aria-label={`Editar ${getSectionTitle(section)}`}
                      aria-expanded={openSectionId === section.id}
                      onClick={() => toggleOpenSection(section.id)}
                    >
                      <ChevronDown
                        className={`transition-transform ${openSectionId === section.id ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>

                {openSectionId === section.id && (
                  <div className="border-t border-border p-3">
                  <div className="mb-3 flex justify-end">
                      <SectionActiveToggle
                        disabled={isPending}
                        isActive={section.enabled}
                        onChange={(isActive) => toggleSection(section.id, isActive)}
                      />
                    </div>
                  <AdminActionForm
                    action={updateHomeSectionContent}
                    className="grid gap-3"
                    onChange={(event) => handleSectionFormChange(section, event)}
                    onSuccess={updateSectionContent}
                    onDirtyChange={(dirty) => setDirtySectionIds((prev) => {
                      const next = new Set(prev)

                      if (dirty) {
                        next.add(section.id)
                      } else {
                        next.delete(section.id)
                      }

                      return next
                    })}
                    showMessageAtBottom={false}
                  >
                    <input name="section_key" type="hidden" value={section.id} />
                    <input name="type" type="hidden" value={section.type} />
                    {isGallerySection(getSectionWithDraft(section)) && (
                      <input name="item_order" type="hidden" value={getGallerySectionItemOrderValue(getSectionWithDraft(section))} readOnly />
                    )}
                    <HomeSectionContentFields section={getSectionWithDraft(section)} tattooStyles={tattooStyles} flashStyles={flashStyles} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {getSectionDefinition(section.type)?.deletable && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            aria-label={`Borrar ${getSectionTitle(section)}`}
                            disabled={isPending}
                            onClick={() => setDeletingSectionId(section.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <FormMessage />
                        <Button type="button" variant="outline" disabled={isPending} onClick={() => { toggleOpenSection(section.id); setDirtySectionIds((prev) => { const next = new Set(prev); next.delete(section.id); return next }) }}>
                          Cancelar
                        </Button>
                        <Button type="submit" variant="default">
                          Guardar contenido
                        </Button>
                      </div>
                    </div>
                  </AdminActionForm>
                </div>
                )}
              </div>
                  )}
                </SortableSectionFrame>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </CardContent>

      <ConfirmDeleteModal
        isOpen={deletingSectionId !== null}
        itemName={deletingSection ? getSectionTitle(deletingSection) ?? "" : ""}
        onClose={() => setDeletingSectionId(null)}
        onConfirm={() => {
          if (deletingSectionId) {
            removeSection(deletingSectionId)
          }
        }}
      />
    </Card>
  )
}
