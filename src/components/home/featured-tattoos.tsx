"use client"

import { motion } from "framer-motion"
import { useState } from "react"

import { TattooImageLightbox } from "@/components/ui/tattoo-image-lightbox"
import type { FeaturedPortfolioSectionContent, FeaturedPortfolioSectionLayout, FeaturedPortfolioSectionStyle } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import {
  BentoGridLayout,
  BracketGridLayout,
  CarouselGalleryLayout,
  FramedGridLayout,
  type SharedGalleryItem,
  type SharedGalleryLayoutStyle,
} from "./shared-gallery-layouts"
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

function getLayoutChrome(layoutStyle: SharedGalleryLayoutStyle) {
  return {
    hasNoise: layoutStyle === "grid",
    hasAmbient: layoutStyle === "bento-grid",
    headerClassName: layoutStyle === "bento-grid"
      ? "relative mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      : layoutStyle === "grid"
        ? "relative mb-11 text-center"
        : "mb-16 text-center",
  }
}

export function FeaturedTattoos({ tattoos, content, layout, style }: FeaturedTattoosProps) {
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const hasHeader = Boolean(content.eyebrow || content.title || content.highlightedTitle)
  const action = content.buttonHref && content.buttonLabel ? { href: content.buttonHref, label: content.buttonLabel } : undefined
  const layoutStyle = layout.layoutStyle
  const chrome = getLayoutChrome(layoutStyle)

  function openTattoo(tattoo: Tattoo) {
    if (!canOpenLightbox()) {
      return
    }

    setSelectedTattoo(tattoo)
  }

  const items: SharedGalleryItem[] = tattoos.map((tattoo) => ({
    id: tattoo.id,
    title: tattoo.title,
    subtitle: tattoo.style,
    image: tattoo.image,
    onOpen: () => openTattoo(tattoo),
    renderCarouselCard: (index) => <TattooCard tattoo={tattoo} index={index} onOpen={openTattoo} />,
  }))

  return (
    <section id="portfolio" className={`relative overflow-hidden py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`} data-layout={layoutStyle}>
      {chrome.hasNoise && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />
      )}
      {chrome.hasAmbient && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_10%,rgba(180,0,0,0.07)_0%,transparent_70%),radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(180,0,0,0.05)_0%,transparent_60%)]" aria-hidden="true" />
      )}

      <div className="container mx-auto px-4">
        {hasHeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className={chrome.headerClassName}>
            <div className={layoutStyle === "bento-grid" ? "" : "contents"}>
              {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
              {(content.title || content.highlightedTitle) && (
                <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
                  {content.title} <span className="text-primary">{content.highlightedTitle}</span>
                </h2>
              )}
              {layoutStyle === "grid" && (
                <div className="mt-5 flex items-center justify-center gap-4" aria-hidden="true">
                  <span className="h-px w-20 bg-gradient-to-r from-transparent to-border" />
                  <span className="size-1.5 rotate-45 bg-primary" />
                  <span className="h-px w-20 bg-gradient-to-l from-transparent to-border" />
                </div>
              )}
            </div>
            {layoutStyle === "bento-grid" && (
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/45">
                {items.length} piezas
              </span>
            )}
          </motion.div>
        )}

        {layoutStyle === "carousel" && <CarouselGalleryLayout items={items} action={action} />}
        {layoutStyle === "grid" && <BracketGridLayout items={items} action={action} />}
        {layoutStyle === "framed-grid" && <FramedGridLayout items={items} action={action} />}
        {layoutStyle === "bento-grid" && <BentoGridLayout items={items} action={action} />}
      </div>

      <TattooImageLightbox tattoo={selectedTattoo} onClose={() => setSelectedTattoo(null)} />
    </section>
  )
}
