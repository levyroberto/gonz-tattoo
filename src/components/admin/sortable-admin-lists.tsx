"use client"

import { ChevronDown, GripVertical, MoveDown, MoveUp } from "lucide-react"
import { type Dispatch, type DragEvent, type SetStateAction, useState, useTransition } from "react"

import {
  deleteFlashDesign,
  deletePortfolioItem,
  reorderFlashDesigns,
  reorderPortfolioItems,
  updateFlashDesign,
  updatePortfolioItem,
} from "@/app/admin/actions"
import { AdminActionForm, FieldError, hasImageValue, type RequiredFieldRule } from "@/components/admin/admin-action-form"
import { ActiveToggle } from "@/components/admin/active-toggle"
import { ImageInput } from "@/components/admin/image-input"
import { LabeledField } from "@/components/admin/labeled-field"
import { TattooStyleSelect } from "@/components/admin/tattoo-style-select"
import { Button } from "@/components/ui/button"
import type { FlashDesign } from "@/data/flash-designs"
import type { Tattoo } from "@/data/tattoos"
import { DeleteButton } from "./delete-button"
const fieldClass = "h-9 rounded-md border border-border bg-input px-3 text-foreground outline-none focus:border-primary"
const tallFieldClass = "min-h-20 rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:border-primary"
const errorIndentClass = "sm:pl-[152px]"

const portfolioRequiredFields: RequiredFieldRule[] = [
  { name: "title", message: "El título es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

const flashRequiredFields: RequiredFieldRule[] = [
  { name: "name", message: "El nombre es obligatorio." },
  { name: "image", message: "La imagen es obligatoria.", check: hasImageValue },
]

type DropPosition = {
  id: number
  edge: "before" | "after"
}

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

function DropPlaceholder({ tone }: { tone: "primary" | "secondary" }) {
  return (
    <div
      className={`h-12 rounded-md border-2 border-dashed ${
        tone === "primary" ? "border-primary bg-primary/10" : "border-secondary bg-secondary/10"
      }`}
    />
  )
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

function MobileMoveButtons({
  canMoveDown,
  canMoveUp,
  itemName,
  onMoveDown,
  onMoveUp,
}: {
  canMoveDown: boolean
  canMoveUp: boolean
  itemName: string
  onMoveDown: () => void
  onMoveUp: () => void
}) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-1 md:hidden">
      <button
        type="button"
        aria-label={`Subir ${itemName}`}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canMoveUp}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onMoveUp()
        }}
      >
        <MoveUp className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Bajar ${itemName}`}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canMoveDown}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onMoveDown()
        }}
      >
        <MoveDown className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

type SortablePortfolioListProps = {
  items: Tattoo[]
  onItemsChange: Dispatch<SetStateAction<Tattoo[]>>
  tattooStyles: string[]
  statusFilter?: AdminStatusFilter
}

export function SortablePortfolioList({
  items: orderedItems,
  onItemsChange: setOrderedItems,
  tattooStyles,
  statusFilter = "all",
}: SortablePortfolioListProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function persistOrder(nextItems: Tattoo[]) {
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const result = await reorderPortfolioItems(nextItems.map((item) => item.id))

      if (!result.ok) {
        setIsError(true)
        setMessage("No se pudo guardar el orden")
        return
      }

      setMessage("Orden guardado")
    })
  }

  function isPortfolioItem(item: unknown): item is Tattoo {
    return Boolean(item && typeof item === "object" && "id" in item && "title" in item)
  }

  function updateItemFromForm(formData: FormData, result?: { item?: unknown } | void) {
    const id = Number(formData.get("id"))
    const savedItem = result?.item

    if (isPortfolioItem(savedItem)) {
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

  function handleDrop(targetId: number) {
    if (draggedId === null || draggedId === targetId) {
      setDropPosition(null)
      return
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedId)
    const toIndex = orderedItems.findIndex((item) => item.id === targetId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextIndex = getTargetIndex(fromIndex, toIndex, dropPosition?.edge ?? "before")
    const nextItems = moveItem(orderedItems, fromIndex, nextIndex)

    setDropPosition(null)
    setOrderedItems(nextItems)
    persistOrder(nextItems)
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, itemId: number) {
    const ghost = document.createElement("div")

    ghost.textContent = "Mover"
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
    setDraggedId(itemId)
    setDropPosition(null)
    setOpenItemId(null)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, itemId: number) {
    event.preventDefault()

    if (draggedId === null || draggedId === itemId) {
      setDropPosition(null)
      return
    }

    setDropPosition({ id: itemId, edge: getDropEdge(event) })
  }

  function moveItemByStep(itemId: number, direction: -1 | 1) {
    const fromIndex = orderedItems.findIndex((item) => item.id === itemId)
    const toIndex = fromIndex + direction

    if (fromIndex < 0 || toIndex < 0 || toIndex >= orderedItems.length) {
      return
    }

    const nextItems = moveItem(orderedItems, fromIndex, toIndex)

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
      {visibleItems.map(({ item, index }) => (
        <div
          key={item.id}
          className="grid gap-2"
          onDragOver={(event) => handleDragOver(event, item.id)}
          onDrop={() => handleDrop(item.id)}
        >
          {dropPosition?.id === item.id && dropPosition.edge === "before" && <DropPlaceholder tone="primary" />}
          <div
            className={`group rounded-md border bg-card transition-opacity ${
              item.isActive ? "border-border" : "border-dashed border-destructive/50 opacity-65"
            } ${
              draggedId === item.id ? "opacity-40" : ""
            }`}
          >
            <div
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left"
              onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setOpenItemId(openItemId === item.id ? null : item.id)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={`Mover ${item.title}`}
                  className="hidden shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing md:block"
                  draggable
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onDragEnd={() => {
                    setDraggedId(null)
                    setDropPosition(null)
                  }}
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  onMouseDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>
                <MobileMoveButtons
                  canMoveDown={index < orderedItems.length - 1}
                  canMoveUp={index > 0}
                  itemName={item.title}
                  onMoveDown={() => moveItemByStep(item.id, 1)}
                  onMoveUp={() => moveItemByStep(item.id, -1)}
                />
                <AdminItemThumbnail src={item.image} alt={item.title} />
                <div className="min-w-0">
                  <p className="truncate text-lg tracking-wide transition-colors hover:text-primary">{item.title}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge isActive={item.isActive} />
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                    openItemId === item.id ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
            {openItemId === item.id && <div className="grid gap-3 border-t border-border p-3">
              <AdminActionForm action={updatePortfolioItem} className="grid gap-2" onSuccess={updateItemFromForm} requiredFields={portfolioRequiredFields}>
                <input name="id" type="hidden" value={item.id} />
                <LabeledField label="Título">
                  <input className={fieldClass} name="title" defaultValue={item.title} />
                </LabeledField>
                <FieldError name="title" className={errorIndentClass} />
                <LabeledField label="Estilo">
                  <TattooStyleSelect className={fieldClass} defaultValue={item.style} styles={tattooStyles} />
                </LabeledField>
                <LabeledField label="Fecha">
                  <input className={fieldClass} name="published_date" type="date" defaultValue={item.publishedDate ?? new Date().toISOString().slice(0, 10)} />
                </LabeledField>
                <LabeledField label="Imagen">
                  <ImageInput defaultUrl={item.image} />
                </LabeledField>
                <FieldError name="image" className={errorIndentClass} />
                <LabeledField label="Descripción" alignTop>
                  <textarea className={tallFieldClass} name="description" defaultValue={item.description ?? ""} />
                </LabeledField>
                <LabeledField label="Tags">
                  <input className={fieldClass} name="tags" defaultValue={(item.tags ?? []).join(", ")} placeholder="Separados por coma" />
                </LabeledField>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-3">
                    <ActiveToggle defaultChecked={item.isFeatured ?? false} label="Destacado" name="is_featured" />
                    <ActiveToggle defaultChecked={item.isActive ?? true} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenItemId(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="default">
                      Guardar
                    </Button>
                  </div>
                </div>
              </AdminActionForm>
              <div className="flex justify-end">
                <DeleteButton
                  itemId={item.id}
                  itemName={item.title}
                  deleteAction={deletePortfolioItem}
                  onSuccess={removeItemFromForm}
                />
              </div>
            </div>}
          </div>
          {dropPosition?.id === item.id && dropPosition.edge === "after" && <DropPlaceholder tone="primary" />}
        </div>
      ))}
      {statusFilter !== "all" && visibleItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay tatuajes {statusFilter === "active" ? "activos" : "inactivos"}.</p>
      )}
    </div>
  )
}

type SortableFlashListProps = {
  items: FlashDesign[]
  onItemsChange: Dispatch<SetStateAction<FlashDesign[]>>
  statusFilter?: AdminStatusFilter
}

export function SortableFlashList({
  items: orderedItems,
  onItemsChange: setOrderedItems,
  statusFilter = "all",
}: SortableFlashListProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function persistOrder(nextItems: FlashDesign[]) {
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const result = await reorderFlashDesigns(nextItems.map((item) => item.id))

      if (!result.ok) {
        setIsError(true)
        setMessage("No se pudo guardar el orden")
        return
      }

      setMessage("Orden guardado")
    })
  }

  function isFlashItem(item: unknown): item is FlashDesign {
    return Boolean(item && typeof item === "object" && "id" in item && "name" in item)
  }

  function updateItemFromForm(formData: FormData, result?: { item?: unknown } | void) {
    const id = Number(formData.get("id"))
    const savedItem = result?.item

    if (isFlashItem(savedItem)) {
      setOrderedItems((currentItems) => currentItems.map((item) => (item.id === id ? savedItem : item)))
      return
    }

    setOrderedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              name: String(formData.get("name") ?? item.name),
              price: Number(formData.get("price") ?? item.price),
              style: String(formData.get("style") ?? item.style),
              image: String(formData.get("image_url") || item.image),
              size: String(formData.get("size") ?? item.size),
              status: String(formData.get("status") ?? item.status) as FlashDesign["status"],
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

  function handleDrop(targetId: number) {
    if (draggedId === null || draggedId === targetId) {
      setDropPosition(null)
      return
    }

    const fromIndex = orderedItems.findIndex((item) => item.id === draggedId)
    const toIndex = orderedItems.findIndex((item) => item.id === targetId)

    if (fromIndex < 0 || toIndex < 0) {
      return
    }

    const nextIndex = getTargetIndex(fromIndex, toIndex, dropPosition?.edge ?? "before")
    const nextItems = moveItem(orderedItems, fromIndex, nextIndex)

    setDropPosition(null)
    setOrderedItems(nextItems)
    persistOrder(nextItems)
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, itemId: number) {
    const ghost = document.createElement("div")

    ghost.textContent = "Mover"
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
    setDraggedId(itemId)
    setDropPosition(null)
    setOpenItemId(null)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, itemId: number) {
    event.preventDefault()

    if (draggedId === null || draggedId === itemId) {
      setDropPosition(null)
      return
    }

    setDropPosition({ id: itemId, edge: getDropEdge(event) })
  }

  function moveItemByStep(itemId: number, direction: -1 | 1) {
    const fromIndex = orderedItems.findIndex((item) => item.id === itemId)
    const toIndex = fromIndex + direction

    if (fromIndex < 0 || toIndex < 0 || toIndex >= orderedItems.length) {
      return
    }

    const nextItems = moveItem(orderedItems, fromIndex, toIndex)

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
      {visibleItems.map(({ item, index }) => (
        <div
          key={item.id}
          className="grid gap-2"
          onDragOver={(event) => handleDragOver(event, item.id)}
          onDrop={() => handleDrop(item.id)}
        >
          {dropPosition?.id === item.id && dropPosition.edge === "before" && <DropPlaceholder tone="secondary" />}
          <div
            className={`group rounded-md border bg-card transition-opacity ${
              item.isActive ? "border-border" : "border-dashed border-destructive/50 opacity-65"
            } ${
              draggedId === item.id ? "opacity-40" : ""
            }`}
          >
            <div
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left"
              onClick={() => setOpenItemId(openItemId === item.id ? null : item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setOpenItemId(openItemId === item.id ? null : item.id)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={`Mover ${item.name}`}
                  className="hidden shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing md:block"
                  draggable
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onDragEnd={() => {
                    setDraggedId(null)
                    setDropPosition(null)
                  }}
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  onMouseDown={(event) => event.stopPropagation()}
                  type="button"
                >
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>
                <MobileMoveButtons
                  canMoveDown={index < orderedItems.length - 1}
                  canMoveUp={index > 0}
                  itemName={item.name}
                  onMoveDown={() => moveItemByStep(item.id, 1)}
                  onMoveUp={() => moveItemByStep(item.id, -1)}
                />
                <AdminItemThumbnail src={item.image} alt={item.name} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                      <p className="truncate text-lg tracking-wide transition-colors hover:text-primary">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.status}
                      </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge isActive={item.isActive} />
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                    openItemId === item.id ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
            {openItemId === item.id && <div className="grid gap-3 border-t border-border p-3">
              <AdminActionForm action={updateFlashDesign} className="grid gap-2" onSuccess={updateItemFromForm} requiredFields={flashRequiredFields}>
                <input name="id" type="hidden" value={item.id} />
                <LabeledField label="Nombre">
                  <input className={fieldClass} name="name" defaultValue={item.name} />
                </LabeledField>
                <FieldError name="name" className={errorIndentClass} />
                <LabeledField label="Precio">
                  <input className={fieldClass} name="price" type="number" min="0" step="1" inputMode="numeric" defaultValue={item.price} />
                </LabeledField>
                <LabeledField label="Estilo">
                  <input className={fieldClass} name="style" defaultValue={item.style} />
                </LabeledField>
                <LabeledField label="Imagen">
                  <ImageInput defaultUrl={item.image} />
                </LabeledField>
                <FieldError name="image" className={errorIndentClass} />
                <LabeledField label="Tags">
                  <input className={fieldClass} name="tags" defaultValue={(item.tags ?? []).join(", ")} placeholder="Separados por coma" />
                </LabeledField>
                <LabeledField label="Tamaño">
                  <input className={fieldClass} name="size" defaultValue={item.size} />
                </LabeledField>
                <LabeledField label="Estado">
                  <select className={fieldClass} name="status" defaultValue={item.status}>
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Reclamado">Reclamado</option>
                  </select>
                </LabeledField>
                <ActiveToggle defaultChecked={item.isActive ?? true} />
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpenItemId(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="default">
                    Guardar
                  </Button>
                </div>
              </AdminActionForm>
              <div className="flex justify-end">
              <DeleteButton
                itemId={item.id}
                itemName={item.name} 
                deleteAction={deleteFlashDesign}
                onSuccess={removeItemFromForm}
              />
            </div>
            </div>}
          </div>
          {dropPosition?.id === item.id && dropPosition.edge === "after" && <DropPlaceholder tone="secondary" />}
        </div>
      ))}
      {statusFilter !== "all" && visibleItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay diseños {statusFilter === "active" ? "activos" : "inactivos"}.</p>
      )}
    </div>
  )
}
