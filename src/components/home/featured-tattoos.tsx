"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react"

import type { Tattoo } from "@/data/tattoos"
import type { FeaturedPortfolioSectionContent, FeaturedPortfolioSectionLayout, FeaturedPortfolioSectionStyle } from "@/data/home-sections"
import { TattooImageLightbox } from "@/components/tattoo-image-lightbox"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import { TattooCard } from "./tattoo-card"

type FeaturedTattoosProps = {
  tattoos: Tattoo[]
  content: FeaturedPortfolioSectionContent
  layout: FeaturedPortfolioSectionLayout
  style: FeaturedPortfolioSectionStyle
}

const sectionBackgroundClassNames: Record<FeaturedPortfolioSectionStyle["background"], string> = {
  card: "bg-card",
}

export function FeaturedTattoos({ tattoos, content, layout, style }: FeaturedTattoosProps) {
  const hasHeader = Boolean(content.eyebrow || content.title || content.highlightedTitle)
  const hasButton = Boolean(content.buttonHref && content.buttonLabel)
  const initialIndex = tattoos.length > 0 ? Math.floor(tattoos.length / 2) : 0
  const loopCopyCount = 21
  const centerCopy = Math.floor(loopCopyCount / 2)
  const initialTrackIndex = tattoos.length > 1 ? centerCopy * tattoos.length + initialIndex : initialIndex
  const [trackIndex, setTrackIndex] = useState(initialTrackIndex)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [carouselMetrics, setCarouselMetrics] = useState({ viewportWidth: 0, slideWidth: 0 })
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef(0)
  const dragVerticalOffsetRef = useRef(0)
  const pressedTattooIdRef = useRef<number | null>(null)
  const pressStartYRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)
  const hasMultipleTattoos = tattoos.length > 1
  const slideGap = 24
  const loopedTattoos = hasMultipleTattoos
    ? Array.from({ length: loopCopyCount }, () => tattoos).flat()
    : tattoos
  const activeIndex = hasMultipleTattoos ? ((trackIndex % tattoos.length) + tattoos.length) % tattoos.length : trackIndex

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
  }, [tattoos.length])

  useEffect(() => {
    setTrackOffset()
  }, [setTrackOffset])

  function showPreviousTattoo() {
    setTrackIndex((index) => index - 1)
  }

  function showNextTattoo() {
    setTrackIndex((index) => index + 1)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasMultipleTattoos) {
      return
    }

    const slide = (event.target as HTMLElement).closest<HTMLElement>("[data-tattoo-id]")

    pressedTattooIdRef.current = Number(slide?.dataset.tattooId) || null
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

    if (wasDragging) {
      suppressNextClickRef.current = true
      window.setTimeout(() => {
        suppressNextClickRef.current = false
      }, 0)
    }

    if (!wasDragging) {
      const tattooId = pressedTattooIdRef.current
      const tattoo = tattoos.find((item) => item.id === tattooId)

      if (tattoo && canOpenLightbox()) {
        setSelectedTattoo(tattoo)
      }
    } else {
      if (dragOffset > 70) {
        showPreviousTattoo()
      }

      if (dragOffset < -70) {
        showNextTattoo()
      }
    }

    setDragStartX(null)
    dragOffsetRef.current = 0
    dragVerticalOffsetRef.current = 0
    pressStartYRef.current = null
    pressedTattooIdRef.current = null
    setIsDragging(false)
  }

  function openTattoo(tattoo: Tattoo) {
    if (!canOpenLightbox() || suppressNextClickRef.current) {
      return
    }

    setSelectedTattoo(tattoo)
  }

  return (
    <section id="portfolio" className={`relative py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`} data-layout={layout.variant}>
      <div className="container mx-auto px-4">
        {hasHeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
            {(content.title || content.highlightedTitle) && (
              <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
                {content.title} <span className="text-primary">{content.highlightedTitle}</span>
              </h2>
            )}
          </motion.div>
        )}

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
                {loopedTattoos.map((work, index) => {
                  const realIndex = hasMultipleTattoos ? index % tattoos.length : index

                  return (
                    <div
                      key={`${work.id}-${index}`}
                      ref={index === 0 ? slideRef : undefined}
                      data-tattoo-id={work.id}
                      className="w-[min(36rem,calc(100vw-2rem))] shrink-0"
                    >
                      <TattooCard tattoo={work} index={realIndex} onOpen={openTattoo} />
                    </div>
                  )
                })}
              </div>
            </div>

            {hasMultipleTattoos && (
              <>
                <button
                  type="button"
                  aria-label="Ver tatuaje anterior"
                  onClick={showPreviousTattoo}
                  className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-primary bg-background/85 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Ver tatuaje siguiente"
                  onClick={showNextTattoo}
                  className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center border border-primary bg-background/85 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {hasMultipleTattoos && (
            <div className="mt-5 flex justify-center gap-2">
              {tattoos.map((tattoo, index) => (
                <button
                  key={tattoo.id}
                  type="button"
                  aria-label={`Ver ${tattoo.title}`}
                  aria-pressed={activeIndex === index}
                  onClick={() => setTrackIndex(Math.floor(trackIndex / tattoos.length) * tattoos.length + index)}
                  className={`size-2.5 border transition-colors ${
                    activeIndex === index ? "border-primary bg-primary" : "border-border bg-transparent hover:border-secondary"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {hasButton && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-12">
            <a href={content.buttonHref} className="inline-block px-8 py-4 border-2 border-primary text-primary font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.4)]">
              {content.buttonLabel}
            </a>
          </motion.div>
        )}
      </div>
      <TattooImageLightbox tattoo={selectedTattoo} onClose={() => setSelectedTattoo(null)} />
    </section>
  )
}
