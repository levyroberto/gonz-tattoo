"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { type CSSProperties, type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import { normalizeInternalLink } from "@/lib/internal-links"
import { OutlineButton } from "@/components/ui/buttons"

export type SharedGalleryLayoutStyle = "carousel" | "grid" | "framed-grid" | "bento-grid" | "wide-grid" | "grunge-gallery"

export type SharedGalleryItem = {
  id: number
  title: string
  subtitle?: string
  image: string
  href?: string
  badge?: string
  badgeTone?: "primary" | "secondary" | "muted"
  meta?: string
  onOpen?: () => void
  renderCarouselCard?: (index: number) => ReactNode
  renderFramedGridCard?: (index: number) => ReactNode
}

type GalleryAction = {
  href: string
  label: string
}

type SharedGalleryLayoutProps = {
  action?: GalleryAction
  columnsDesktop?: number
  eyebrow?: string
  items: SharedGalleryItem[]
}

type GalleryGridStyle = CSSProperties & {
  "--gallery-card-width": string
  "--gallery-columns-desktop": number
  "--gallery-grid-max-width": string
}

const badgeClassNames: Record<NonNullable<SharedGalleryItem["badgeTone"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "border border-secondary/60 bg-background/80 text-secondary",
  muted: "border border-muted-foreground/50 bg-background/85 text-muted-foreground",
}

function GalleryItemButton({
  children,
  className,
  item,
}: {
  children: ReactNode
  className: string
  item: SharedGalleryItem
}) {
  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={item.onOpen} className={className}>
      {children}
    </button>
  )
}

export function CarouselGalleryLayout({ action, items }: SharedGalleryLayoutProps) {
  const initialIndex = items.length > 0 ? Math.floor(items.length / 2) : 0
  const loopCopyCount = 21
  const centerCopy = Math.floor(loopCopyCount / 2)
  const initialTrackIndex = items.length > 1 ? centerCopy * items.length + initialIndex : initialIndex
  const [trackIndex, setTrackIndex] = useState(initialTrackIndex)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [carouselMetrics, setCarouselMetrics] = useState({ viewportWidth: 0, slideWidth: 0 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef(0)
  const dragVerticalOffsetRef = useRef(0)
  const pressedItemIdRef = useRef<number | null>(null)
  const pressStartYRef = useRef<number | null>(null)
  const hasMultipleItems = items.length > 1
  const slideGap = 24
  const loopedItems = hasMultipleItems ? Array.from({ length: loopCopyCount }, () => items).flat() : items
  const activeIndex = hasMultipleItems ? ((trackIndex % items.length) + items.length) % items.length : trackIndex

  const getTrackOffset = useCallback((index = trackIndex, dragOffset = 0) => {
    return (
      carouselMetrics.viewportWidth / 2 -
      carouselMetrics.slideWidth / 2 -
      index * (carouselMetrics.slideWidth + slideGap) +
      dragOffset
    )
  }, [carouselMetrics.slideWidth, carouselMetrics.viewportWidth, trackIndex])

  const setTrackOffset = useCallback((offset = 0) => {
    if (!trackRef.current) {
      return
    }

    trackRef.current.style.transform = `translateX(${getTrackOffset(trackIndex, offset)}px)`
  }, [getTrackOffset, trackIndex])

  useEffect(() => {
    function updateCarouselMetrics() {
      setCarouselMetrics({
        viewportWidth: viewportRef.current?.clientWidth ?? 0,
        slideWidth: slideRef.current?.clientWidth ?? 0,
      })
    }

    updateCarouselMetrics()
    window.addEventListener("resize", updateCarouselMetrics)

    return () => window.removeEventListener("resize", updateCarouselMetrics)
  }, [items.length])

  useEffect(() => {
    setTrackOffset()
  }, [setTrackOffset])

  function showPreviousItem() {
    setTrackIndex((index) => index - 1)
  }

  function showNextItem() {
    setTrackIndex((index) => index + 1)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasMultipleItems) {
      return
    }

    const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-item-id]")

    pressedItemIdRef.current = Number(slide?.dataset.galleryItemId) || null
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStartX(event.clientX)
    pressStartYRef.current = event.clientY
    dragOffsetRef.current = 0
    dragVerticalOffsetRef.current = 0
    setIsDragging(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX === null) {
      return
    }

    dragOffsetRef.current = event.clientX - dragStartX
    dragVerticalOffsetRef.current = pressStartYRef.current === null ? 0 : event.clientY - pressStartYRef.current
    setTrackOffset(dragOffsetRef.current)
  }

  function handlePointerEnd() {
    if (dragStartX === null) {
      return
    }

    const dragOffset = dragOffsetRef.current
    const wasDragging = Math.abs(dragOffset) > 8 || Math.abs(dragVerticalOffsetRef.current) > 8

    if (!wasDragging) {
      const item = items.find((candidate) => candidate.id === pressedItemIdRef.current)

      item?.onOpen?.()
    } else {
      if (dragOffset > 70) {
        showPreviousItem()
      }

      if (dragOffset < -70) {
        showNextItem()
      }
    }

    setDragStartX(null)
    dragOffsetRef.current = 0
    dragVerticalOffsetRef.current = 0
    pressStartYRef.current = null
    pressedItemIdRef.current = null
    setIsDragging(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative">
        <div ref={viewportRef} className="overflow-hidden">
          <div
            ref={trackRef}
            className={`flex touch-pan-y select-none gap-6 will-change-transform ${
              isDragging ? "" : "transition-transform duration-500 ease-out"
            }`}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            style={{ transform: `translateX(${getTrackOffset()}px)` }}
          >
            {loopedItems.map((item, index) => {
              const realIndex = hasMultipleItems ? index % items.length : index

              return (
                <div
                  key={`${item.id}-${index}`}
                  ref={index === 0 ? slideRef : undefined}
                  data-gallery-item-id={item.id}
                  className="w-[min(36rem,calc(100vw-2rem))] shrink-0"
                >
                  {item.renderCarouselCard ? item.renderCarouselCard(realIndex) : <FramedGridCard item={item} index={realIndex} />}
                </div>
              )
            })}
          </div>
        </div>

        {hasMultipleItems && (
          <>
            <button
              type="button"
              aria-label="Ver anterior"
              onClick={showPreviousItem}
              className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-primary bg-background/85 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Ver siguiente"
              onClick={showNextItem}
              className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-primary bg-background/85 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {hasMultipleItems && (
        <div className="mt-5 flex justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver ${item.title}`}
              aria-pressed={activeIndex === index}
              onClick={() => setTrackIndex(Math.floor(trackIndex / items.length) * items.length + index)}
              className={`size-2.5 border transition-colors ${
                activeIndex === index ? "border-primary bg-primary" : "border-border bg-transparent hover:border-secondary"
              }`}
            />
          ))}
        </div>
      )}

      {action && <PrimaryOutlineAction action={action} />}
    </div>
  )
}

function PrimaryOutlineAction({ action, className }: { action: GalleryAction; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`mt-10 flex items-center justify-center gap-6 ${className ?? ""}`}
    >
      <span className="hidden h-px w-16 bg-border md:block" aria-hidden="true" />
      <OutlineButton href={normalizeInternalLink(action.href)} size="md">
        {action.label}
      </OutlineButton>
      <span className="hidden h-px w-16 bg-border md:block" aria-hidden="true" />
    </motion.div>
  )
}

type WideGridCellRatio = "tall" | "square"

function getWideGridRatio(index: number): WideGridCellRatio {
  const pattern: WideGridCellRatio[] = ["tall", "square", "tall", "square", "square", "tall", "square", "tall"]

  return pattern[index % pattern.length]
}

function formatWideGridIndex(index: number) {
  return String(index + 1).padStart(2, "0")
}

function WideGridCell({ index, item }: { index: number; item: SharedGalleryItem }) {
  const ratio = getWideGridRatio(index)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      className={`group relative cursor-pointer overflow-hidden bg-[#111] ${ratio === "tall" ? "aspect-[3/4]" : "aspect-square"}`}
    >
      <GalleryItemButton item={item} className="block size-full text-left">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover brightness-[0.88] contrast-[1.08] saturate-[0.7] transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06] group-hover:contrast-[1.1]"
        />
        <div className="absolute inset-0 flex flex-col justify-end px-3 pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-[clamp(13px,2vw,18px)] font-medium leading-tight tracking-[0.04em] text-[#f0ece4]">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[#888]">
              {item.subtitle}
            </p>
          )}
        </div>
        <span className="absolute right-3 top-2.5 text-[10px] tracking-[0.15em] text-[#444] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {formatWideGridIndex(index)}
        </span>
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#c8a97e] transition-[width] duration-[450ms] ease-out group-hover:w-full" />
      </GalleryItemButton>
    </motion.div>
  )
}

export function WideGridLayout({ action, items }: SharedGalleryLayoutProps) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#0a0a0a]">
      <div className="flex items-baseline justify-between border-b border-[#222] px-6 py-8">
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#555]">
          Estudio - obras
        </span>
        <span className="text-[11px] tracking-[0.2em] text-[#333]">
          {items.length} piezas
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-[2px] md:grid-cols-4">
        {items.map((item, index) => (
          <WideGridCell key={item.id} item={item} index={index} />
        ))}
      </div>

      {action && <PrimaryOutlineAction action={action} className="py-6 border-t border-[#1a1a1a]" />}
    </div>
  )
}

const grungeRotations = [
  "-rotate-[1.1deg]",
  "rotate-[0.7deg]",
  "-rotate-[0.5deg]",
  "rotate-[1.4deg]",
  "rotate-[0.1deg]",
  "-rotate-[1.8deg]",
  "rotate-[0.9deg]",
  "-rotate-[0.3deg]",
]

const grungeAspects = ["55%", "62%", "50%", "58%", "53%", "60%", "48%", "56%"]

function getGrungeRotation(index: number) {
  return grungeRotations[index % grungeRotations.length]
}

function getGrungeAspect(index: number) {
  return grungeAspects[index % grungeAspects.length]
}

function getGrungeStickerTone(item: SharedGalleryItem) {
  return item.badgeTone === "secondary" || item.badgeTone === "muted" ? "cream" : "red"
}

function GrungeTape({ side }: { side: "left" | "right" }) {
  const position = side === "left" ? "left-[18%] top-[-8px] -rotate-2" : "right-[22%] top-[-6px] rotate-[1.5deg]"

  return <span className={`pointer-events-none absolute h-[18px] w-14 bg-[#c8b89a] opacity-55 ${position}`} />
}

function GrungeSticker({ item }: { item: SharedGalleryItem }) {
  if (!item.badge) {
    return null
  }

  const tone = getGrungeStickerTone(item)
  const colorClassName = tone === "red"
    ? "border-[#8a1818] bg-[#b02020] text-[#e8dcc8]"
    : "rotate-2 border-[#a09070] bg-[#c8b89a] text-[#0d0c0a]"

  return (
    <span className={`pointer-events-none absolute left-3 top-3 border-[1.5px] px-[7px] py-[3px] font-sans text-[10px] font-black uppercase tracking-[0.2em] -rotate-3 ${colorClassName}`}>
      {item.badge}
    </span>
  )
}

function GrungePosterCard({ index, item }: { index: number; item: SharedGalleryItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.35) }}
      className={`relative mb-5 w-full cursor-pointer ${getGrungeRotation(index)}`}
    >
      <GalleryItemButton item={item} className="group block w-full text-left">
        <div className="relative overflow-hidden border-[3px] border-[#1a1814] transition-transform duration-200 ease-out group-hover:scale-[1.015]">
          <div className="relative w-full" style={{ paddingTop: getGrungeAspect(index) }}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 680px"
              className="object-cover sepia-[0.35] contrast-[1.2] saturate-[0.6] transition-all duration-300 group-hover:sepia-[0.2] group-hover:saturate-[0.8]"
            />

            <div className="absolute inset-0 flex flex-col justify-end">
              <span className="pointer-events-none absolute right-3.5 top-2.5 select-none font-sans text-[clamp(48px,10vw,72px)] leading-none text-white opacity-[0.07]">
                {formatWideGridIndex(index)}
              </span>
              <GrungeSticker item={item} />
              <GrungeTape side="left" />
              <GrungeTape side="right" />
              <div className="flex items-baseline justify-between gap-2 border-t-2 border-[#b02020] bg-[rgba(10,9,7,0.88)] px-3.5 py-2.5">
                <span className="font-sans text-[clamp(20px,5vw,32px)] leading-none tracking-[0.06em] text-[#e8dcc8]">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="whitespace-nowrap font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#b02020]">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </GalleryItemButton>
    </motion.div>
  )
}

export function GrungeGalleryLayout({ action, eyebrow, items }: SharedGalleryLayoutProps) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#0d0c0a]">
      <div className="flex items-center justify-between border-b-2 border-[#1e1e1e] px-5 py-6">
        {eyebrow && (
          <span className="font-sans text-[clamp(18px,4vw,24px)] tracking-[0.12em] text-[#c8b89a]">
            {eyebrow}
          </span>
        )}
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.4em] text-[#3a3630]">
          Buenos Aires
        </span>
      </div>

      <div className="mx-auto flex max-w-[760px] flex-col px-4 pt-8">
        {items.map((item, index) => (
          <GrungePosterCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {action && <PrimaryOutlineAction action={action} className="border-t border-[#1a1814]" />}
    </div>
  )
}

function getDesktopColumnCount(columnsDesktop?: number) {
  const columnCount = Number(columnsDesktop)

  return Number.isInteger(columnCount) && columnCount >= 2 && columnCount <= 8 ? columnCount : 3
}

function getGridMaxWidth(columnsDesktop: number, gap: string, extraWidth = "0px") {
  return `calc(${columnsDesktop} * var(--gallery-card-width) + ${columnsDesktop - 1} * ${gap} + ${extraWidth} + 1px)`
}

export function BracketGridLayout({ action, columnsDesktop, items }: SharedGalleryLayoutProps) {
  const desktopColumnCount = getDesktopColumnCount(columnsDesktop)
  const gridStyle: GalleryGridStyle = {
    "--gallery-card-width": "calc((900px - 2 * 3px) / 3)",
    "--gallery-columns-desktop": desktopColumnCount,
    "--gallery-grid-max-width": getGridMaxWidth(desktopColumnCount, "3px"),
  }

  return (
    <>
      <div
        className="grid grid-cols-2 gap-[3px] md:relative md:left-1/2 md:w-[min(calc(100vw-2rem),var(--gallery-grid-max-width))] md:-translate-x-1/2 md:grid-cols-[repeat(auto-fit,minmax(min(100%,var(--gallery-card-width)),var(--gallery-card-width)))] md:justify-center"
        style={gridStyle}
      >
        {items.map((item, index) => (
          <GalleryItemButton
            key={item.id}
            item={item}
            className="group relative block aspect-[3/4] cursor-pointer overflow-hidden text-left"
          >
            <span className="pointer-events-none absolute inset-0 z-[2] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="block size-full object-cover grayscale-[20%] contrast-[1.05] transition duration-500 ease-out group-hover:scale-[1.06] group-hover:grayscale-0 group-hover:contrast-[1.1]"
            />
            <span className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent px-4 py-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {item.subtitle && <span className="mb-1 text-[10px] uppercase tracking-[0.3em] text-primary">{item.subtitle}</span>}
              <span className="font-sans text-[17px] leading-tight text-foreground">{item.title}</span>
              {item.meta && <span className="mt-1 text-xs font-bold tracking-wide text-primary">{item.meta}</span>}
            </span>
            <span className="pointer-events-none absolute left-2 top-2 z-[4] size-4 border-l border-t border-primary/60" />
            <span className="pointer-events-none absolute bottom-2 right-2 z-[4] size-4 border-b border-r border-primary/60" />
            {item.badge && (
              <span className={`absolute left-3 top-3 z-[4] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${badgeClassNames[item.badgeTone ?? "muted"]}`}>
                {item.badge}
              </span>
            )}
            <span className="pointer-events-none absolute right-3 top-2.5 z-[4] font-sans text-[11px] tracking-wide text-primary/70">
              {String(index + 1).padStart(2, "0")}
            </span>
          </GalleryItemButton>
        ))}
      </div>

      {action && <PrimaryOutlineAction action={action} />}
    </>
  )
}

function FramedGridCard({ index, item }: { index: number; item: SharedGalleryItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative aspect-square w-full overflow-hidden bg-muted/30"
    >
      <GalleryItemButton item={item} className="block size-full text-left">
        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {item.badge && (
          <span className={`absolute right-3 top-3 border px-2.5 py-1 text-[0.65rem] font-sans uppercase tracking-widest ${badgeClassNames[item.badgeTone ?? "muted"]}`}>
            {item.badge}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-background/90 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-sans tracking-wider text-foreground md:text-base">{item.title}</span>
            {item.meta && <span className="shrink-0 text-sm font-sans text-primary md:text-base">{item.meta}</span>}
          </div>
          {item.subtitle && !item.meta && <span className="text-xs uppercase tracking-wider text-primary">{item.subtitle}</span>}
        </div>
      </GalleryItemButton>
    </motion.div>
  )
}

export function FramedGridLayout({ action, columnsDesktop, items }: SharedGalleryLayoutProps) {
  const desktopColumnCount = getDesktopColumnCount(columnsDesktop)
  const gridStyle: GalleryGridStyle = {
    "--gallery-card-width": "calc((min(100vw - 2rem, 1200px) - 2 * 1rem - 2rem - 2px) / 3)",
    "--gallery-columns-desktop": desktopColumnCount,
    "--gallery-grid-max-width": getGridMaxWidth(desktopColumnCount, "1rem", "2rem"),
  }

  return (
    <>
      <div className="relative paper-texture vintage-border p-3 md:left-1/2 md:w-[min(calc(100vw-2rem),var(--gallery-grid-max-width))] md:-translate-x-1/2 md:p-4" style={gridStyle}>
        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(var(--gallery-columns-desktop),minmax(0,1fr))] md:gap-4"
        >
          {items.map((item, index) => (
            item.renderFramedGridCard ? item.renderFramedGridCard(index) : <FramedGridCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      {action && <PrimaryOutlineAction action={action} />}
    </>
  )
}

function getBentoCardClassName(index: number) {
  const position = index % 4

  if (position === 0) {
    return "md:col-span-2 aspect-[16/10]"
  }

  if (position === 1) {
    return "md:col-start-3 md:row-span-2 aspect-[9/14] md:aspect-auto"
  }

  return "aspect-square"
}

export function BentoGridLayout({ action, items }: SharedGalleryLayoutProps) {
  return (
    <>
      <div className="mx-auto grid max-w-[920px] grid-cols-1 gap-2.5 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
            className={`group relative overflow-hidden bg-muted/30 ${getBentoCardClassName(index)}`}
          >
            <GalleryItemButton item={item} className="block size-full text-left">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover saturate-[0.9] contrast-[1.05] transition duration-700 ease-out group-hover:scale-[1.08] group-hover:saturate-[1.15] group-hover:contrast-[1.08]"
              />
              <span className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_50%,rgba(0,0,0,0.25)_100%)]" />
              {item.subtitle && (
                <span className="absolute left-3 top-3 z-[4] text-[9px] uppercase tracking-[0.2em] text-foreground/45">
                  {item.subtitle}
                </span>
              )}
              {item.badge && (
                <span className={`absolute right-3 top-3 z-[4] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${badgeClassNames[item.badgeTone ?? "muted"]}`}>
                  {item.badge}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 py-3.5">
                <span className="font-sans text-xl leading-none tracking-wide text-foreground">{item.title}</span>
                {item.meta && <span className="shrink-0 text-sm font-bold tracking-wide text-primary">{item.meta}</span>}
              </span>
              <span className="absolute bottom-0 left-0 z-[5] h-0.5 w-0 bg-primary transition-[width] duration-500 ease-out group-hover:w-full" />
            </GalleryItemButton>
          </motion.div>
        ))}
      </div>

      {action && <PrimaryOutlineAction action={action} />}
    </>
  )
}
