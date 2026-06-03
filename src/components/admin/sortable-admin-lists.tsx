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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, GripVertical } from "lucide-react"
import { type Dispatch, type ReactNode, type SetStateAction, useState, useTransition } from "react"

import {
  deleteSaleableArtwork,
  deleteTattoo,
  reorderSaleableArtworks,
  reorderTattoos,
  updateSaleableArtwork,
  updateTattoo,
} from "@/app/admin/actions"
import { AdminActionForm, FieldError, FormMessage, hasImageValue, type RequiredFieldRule } from "@/components/admin/admin-action-form"
import { ActiveToggle } from "@/components/admin/active-toggle"
import { ImageInput } from "@/components/admin/image-input"
import { LabeledField } from "@/components/admin/labeled-field"
import { TagInputField } from "@/components/admin/tag-input-field"
import { TattooStyleSelect } from "@/components/admin/tattoo-style-select"
import { Button } from "@/components/ui/button"
import type { SaleableArtwork, TattooArtwork } from "@/data/artworks"
import { DeleteButton } from "./delete-button"
import { errorIndentClass, fieldClass, tallFieldClass } from "@/components/admin/admin-field-styles"

const portfolioRequiredFields: RequiredFieldRule[] = [
  { name: "title", message: "El título es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

const flashRequiredFields: RequiredFieldRule[] = [
  { name: "name", message: "El nombre es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

export type AdminStatusFilter = "all" | "active" | "inactive"

function matchesStatusFilter(isActive: boolean | undefined, filter: AdminStatusFilter) {
  if (filter === "active") {
    return Boolean(isActive)
  }

  if (filter === "inactive") {
    return !isActive
  }

  return true
}

function getSortableItemId(itemId: number) {
  return `item-${itemId}`
}

function getItemIdFromSortableId(sortableId: string | number) {
  return Number(String(sortableId).replace(/^item-/, ""))
}

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

type SortableItemFrameRenderProps = {
  attributes: ReturnType<typeof useSortable>["attributes"]
  isDragging: boolean
  listeners: ReturnType<typeof useSortable>["listeners"]
  setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"]
}

function SortableItemFrame({
  children,
  id,
}: {
  children: (props: SortableItemFrameRenderProps) => ReactNode
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

function AdminItemThumbnail({ alt, src }: { alt: string; src?: string }) {
  if (!src) {
    return (
      <div
        className="size-14 shrink-0 rounded-md border border-border bg-muted"
        aria-label={`Sin imagen para ${alt}`}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-14 shrink-0 rounded-md border border-border bg-muted object-cover"
      loading="lazy"
    />
  )
}

function TagBadges({ tags }: { tags?: string[] }) {
  const visibleTags = (tags ?? []).filter(Boolean)

  if (visibleTags.length === 0) {
    return null
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {visibleTags.map((tag) => (
        <span key={tag} className="rounded-sm border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">
          {tag}
        </span>
      ))}
    </div>
  )
}

type SortablePortfolioListProps = {
  items: TattooArtwork[]
  onItemsChange: Dispatch<SetStateAction<TattooArtwork[]>>
  tattooStyles: string[]
  statusFilter?: AdminStatusFilter
}

export function SortablePortfolioList({
  items: orderedItems,
  onItemsChange: setOrderedItems,
  tattooStyles,
  statusFilter = "all",
}: SortablePortfolioListProps) {
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const [dirtyItemIds, setDirtyItemIds] = useState<Set<number>>(new Set())
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function persistOrder(nextItems: TattooArtwork[]) {
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const result = await reorderTattoos(nextItems.map((item) => item.id))

      if (!result.ok) {
        setIsError(true)
        setMessage("No se pudo guardar el orden")
        return
      }

      setMessage("Orden guardado")
    })
  }

  function isTattooItem(item: unknown): item is TattooArtwork {
    return Boolean(item && typeof item === "object" && "type" in item && (item as { type: unknown }).type === "tattoo")
  }

  function updateItemFromForm(formData: FormData, result?: { item?: unknown } | void) {
    const id = Number(formData.get("id"))
    const savedItem = result?.item

    if (isTattooItem(savedItem)) {
      setOrderedItems((currentItems) => currentItems.map((item) => (item.id === id ? savedItem : item)))
      return
    }

    setOrderedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              title: String(formData.get("title") ?? item.title),
              style: String(formData.get("style") ?? item.style),
              image: String(formData.get("image_url") || item.image),
              description: String(formData.get("description") ?? "") || undefined,
              isActive: formData.get("is_active") === "on",
              isFeatured: formData.get("is_featured") === "on",
              publishedDate: String(formData.get("published_date") ?? item.publishedDate),
              tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
            }
          : item
      )
    )
  }

  function removeItemFromForm(formData: FormData) {
    const id = Number(formData.get("id"))

    setOrderedItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = getItemIdFromSortableId(event.active.id)
    const overId = event.over ? getItemIdFromSortableId(event.over.id) : null

    if (overId === null || activeId === overId) {
      return
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === activeId)
    const toIndex = orderedItems.findIndex((item) => item.id === overId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextItems = arrayMove(orderedItems, fromIndex, toIndex)

    setOpenItemId(null)
    setOrderedItems(nextItems)
    persistOrder(nextItems)
  }

  const visibleItems = orderedItems
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesStatusFilter(item.isActive, statusFilter))

  return (
    <div className="grid gap-2" aria-busy={isPending}>
      {message && <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>{message}</p>}
      <DndContext
        id="portfolio-sortable"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setOpenItemId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleItems.map(({ item }) => getSortableItemId(item.id))} strategy={verticalListSortingStrategy}>
          {visibleItems.map(({ item }) => (
            <SortableItemFrame key={item.id} id={getSortableItemId(item.id)}>
              {({ attributes, isDragging, listeners, setActivatorNodeRef }) => (
          <div
            className={`group rounded-md border bg-card transition-opacity ${
              item.isActive ? "border-border" : "border-dashed border-destructive/50 opacity-65"
            } ${
              isDragging ? "opacity-40" : ""
            }`}
          >
            <div className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={`Mover ${item.title}`}
                  className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  ref={setActivatorNodeRef}
                  style={{ touchAction: "none" }}
                  type="button"
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>
                <AdminItemThumbnail src={item.image} alt={item.title} />
                <button
                  type="button"
                  className="min-w-0 cursor-pointer text-left"
                  aria-expanded={openItemId === item.id}
                  onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
                >
                  <span className="block truncate text-lg tracking-wide transition-colors hover:text-primary">{item.title}</span>
                  <TagBadges tags={item.tags} />
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {dirtyItemIds.has(item.id) && openItemId !== item.id && (
                  <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                    sin guardar
                  </span>
                )}
                <StatusBadge isActive={item.isActive} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${item.title}`}
                  aria-expanded={openItemId === item.id}
                  onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
                >
                  <ChevronDown
                    className={`transition-transform ${openItemId === item.id ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
            {openItemId === item.id && <div className="grid gap-3 border-t border-border p-3">
              <AdminActionForm
                action={updateTattoo}
                className="grid gap-3"
                onSuccess={updateItemFromForm}
                onDirtyChange={(dirty) => setDirtyItemIds((prev) => { const next = new Set(prev); dirty ? next.add(item.id) : next.delete(item.id); return next })}
                requiredFields={portfolioRequiredFields}
                showMessageAtBottom={false}
              >
                <input name="id" type="hidden" value={item.id} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid gap-2">
                    <LabeledField label="Título" compact>
                      <input className={fieldClass} name="title" defaultValue={item.title} />
                    </LabeledField>
                    <FieldError name="title" className={errorIndentClass} />
                    <LabeledField label="Estilo" compact>
                      <TattooStyleSelect className={fieldClass} defaultValue={item.style} styles={tattooStyles} />
                    </LabeledField>
                    <LabeledField label="Fecha" compact>
                      <input className={fieldClass} name="published_date" type="date" defaultValue={item.publishedDate ?? new Date().toISOString().slice(0, 10)} />
                    </LabeledField>
                    <LabeledField label="Imagen" compact>
                      <ImageInput defaultUrl={item.image} />
                    </LabeledField>
                    <FieldError name="image" className={errorIndentClass} />
                    <LabeledField label="Descripción" alignTop compact>
                      <textarea className={tallFieldClass} name="description" defaultValue={item.description ?? ""} />
                    </LabeledField>
                  </div>
                  <div className="grid content-start gap-2">
                    <LabeledField label="Tags" alignTop compact>
                      <TagInputField className={fieldClass} defaultValue={(item.tags ?? []).join(", ")} placeholder="Agregar tag" />
                    </LabeledField>
                    <div className="grid gap-2 sm:pl-[108px]">
                      <ActiveToggle defaultChecked={item.isFeatured ?? false} label="Destacado" name="is_featured" />
                      <ActiveToggle defaultChecked={item.isActive ?? true} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <DeleteButton
                    itemId={item.id}
                    itemName={item.title}
                    deleteAction={deleteTattoo}
                    onSuccess={removeItemFromForm}
                  />
                  <div className="flex items-center gap-2">
                    <FormMessage />
                    <Button type="button" variant="outline" onClick={() => { setOpenItemId(null); setDirtyItemIds((prev) => { const next = new Set(prev); next.delete(item.id); return next }) }}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="default">
                      Guardar
                    </Button>
                  </div>
                </div>
              </AdminActionForm>
            </div>}
          </div>
              )}
            </SortableItemFrame>
          ))}
        </SortableContext>
      </DndContext>
      {statusFilter !== "all" && visibleItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay tatuajes {statusFilter === "active" ? "activos" : "inactivos"}.</p>
      )}
    </div>
  )
}

type SortableDesignsListProps = {
  items: SaleableArtwork[]
  onItemsChange: Dispatch<SetStateAction<SaleableArtwork[]>>
  statusFilter?: AdminStatusFilter
}

export function SortableDesignsList({
  items: orderedItems,
  onItemsChange: setOrderedItems,
  statusFilter = "all",
}: SortableDesignsListProps) {
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const [dirtyItemIds, setDirtyItemIds] = useState<Set<number>>(new Set())
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function persistOrder(nextItems: SaleableArtwork[]) {
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const result = await reorderSaleableArtworks(nextItems.map((item) => item.id))

      if (!result.ok) {
        setIsError(true)
        setMessage("No se pudo guardar el orden")
        return
      }

      setMessage("Orden guardado")
    })
  }

  function isDesignItem(item: unknown): item is SaleableArtwork {
    return Boolean(item && typeof item === "object" && "id" in item && "price" in item)
  }

  function updateItemFromForm(formData: FormData, result?: { item?: unknown } | void) {
    const id = Number(formData.get("id"))
    const savedItem = result?.item

    if (isDesignItem(savedItem)) {
      setOrderedItems((currentItems) => currentItems.map((item) => (item.id === id ? savedItem : item)))
      return
    }

    setOrderedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              title: String(formData.get("title") ?? item.title),
              price: Number(formData.get("price") ?? item.price),
              style: String(formData.get("style") ?? item.style),
              image: String(formData.get("image_url") || item.image),
              dimensions: String(formData.get("dimensions") ?? item.dimensions),
              status: String(formData.get("status") ?? item.status) as SaleableArtwork["status"],
              isActive: formData.get("is_active") === "on",
              tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
            }
          : item
      )
    )
  }

  function removeItemFromForm(formData: FormData) {
    const id = Number(formData.get("id"))

    setOrderedItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = getItemIdFromSortableId(event.active.id)
    const overId = event.over ? getItemIdFromSortableId(event.over.id) : null

    if (overId === null || activeId === overId) {
      return
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === activeId)
    const toIndex = orderedItems.findIndex((item) => item.id === overId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextItems = arrayMove(orderedItems, fromIndex, toIndex)

    setOpenItemId(null)
    setOrderedItems(nextItems)
    persistOrder(nextItems)
  }

  const visibleItems = orderedItems
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesStatusFilter(item.isActive, statusFilter))

  return (
    <div className="grid gap-2" aria-busy={isPending}>
      {message && <p className={isError ? "text-sm text-destructive" : "text-sm text-green-500"}>{message}</p>}
      <DndContext
        id="flash-sortable"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setOpenItemId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleItems.map(({ item }) => getSortableItemId(item.id))} strategy={verticalListSortingStrategy}>
          {visibleItems.map(({ item }) => (
            <SortableItemFrame key={item.id} id={getSortableItemId(item.id)}>
              {({ attributes, isDragging, listeners, setActivatorNodeRef }) => (
          <div
            className={`group rounded-md border bg-card transition-opacity ${
              item.isActive ? "border-border" : "border-dashed border-destructive/50 opacity-65"
            } ${
              isDragging ? "opacity-40" : ""
            }`}
          >
            <div className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={`Mover ${item.title}`}
                  className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  ref={setActivatorNodeRef}
                  style={{ touchAction: "none" }}
                  type="button"
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>
                <AdminItemThumbnail src={item.image} alt={item.title} />
                <button
                  type="button"
                  className="min-w-0 cursor-pointer text-left"
                  aria-expanded={openItemId === item.id}
                  onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-2">
                      <p className="truncate text-lg tracking-wide transition-colors hover:text-primary">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.status}
                      </p>
                  </div>
                  <TagBadges tags={item.tags} />
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {dirtyItemIds.has(item.id) && openItemId !== item.id && (
                  <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                    sin guardar
                  </span>
                )}
                <StatusBadge isActive={item.isActive} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${item.title}`}
                  aria-expanded={openItemId === item.id}
                  onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
                >
                  <ChevronDown
                    className={`transition-transform ${openItemId === item.id ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
            {openItemId === item.id && <div className="grid gap-3 border-t border-border p-3">
              <AdminActionForm
                action={updateSaleableArtwork}
                className="grid gap-3"
                onSuccess={updateItemFromForm}
                onDirtyChange={(dirty) => setDirtyItemIds((prev) => { const next = new Set(prev); dirty ? next.add(item.id) : next.delete(item.id); return next })}
                requiredFields={flashRequiredFields}
                showMessageAtBottom={false}
              >
                <input name="id" type="hidden" value={item.id} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid gap-2">
                    <LabeledField label="Título" compact>
                      <input className={fieldClass} name="title" defaultValue={item.title} />
                    </LabeledField>
                    <FieldError name="title" className={errorIndentClass} />
                    <LabeledField label="Precio" compact>
                      <input className={fieldClass} name="price" type="number" min="0" step="1" inputMode="numeric" defaultValue={item.price} />
                    </LabeledField>
                    <LabeledField label="Estilo" compact>
                      <input className={fieldClass} name="style" defaultValue={item.style} />
                    </LabeledField>
                    <LabeledField label="Imagen" compact>
                      <ImageInput defaultUrl={item.image} />
                    </LabeledField>
                    <FieldError name="image" className={errorIndentClass} />
                  </div>
                  <div className="grid content-start gap-2">
                    <LabeledField label="Tags" alignTop compact>
                      <TagInputField className={fieldClass} defaultValue={(item.tags ?? []).join(", ")} placeholder="Agregar tag" />
                    </LabeledField>
                    <LabeledField label="Dimensiones" compact>
                      <input className={fieldClass} name="dimensions" defaultValue={item.dimensions ?? ""} />
                    </LabeledField>
                    <LabeledField label="Estado" compact>
                      <select className={fieldClass} name="status" defaultValue={item.status}>
                        <option value="Disponible">Disponible</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Reclamado">Reclamado</option>
                      </select>
                    </LabeledField>
                    <div className="sm:pl-[108px]">
                      <ActiveToggle defaultChecked={item.isActive ?? true} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <DeleteButton
                    itemId={item.id}
                    itemName={item.title}
                    deleteAction={deleteSaleableArtwork}
                    onSuccess={removeItemFromForm}
                  />
                  <div className="flex items-center gap-2">
                    <FormMessage />
                    <Button type="button" variant="outline" onClick={() => { setOpenItemId(null); setDirtyItemIds((prev) => { const next = new Set(prev); next.delete(item.id); return next }) }}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="default">
                      Guardar
                    </Button>
                  </div>
                </div>
              </AdminActionForm>
            </div>}
          </div>
              )}
            </SortableItemFrame>
          ))}
        </SortableContext>
      </DndContext>
      {statusFilter !== "all" && visibleItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay diseños {statusFilter === "active" ? "activos" : "inactivos"}.</p>
      )}

    </div>
  )
}
