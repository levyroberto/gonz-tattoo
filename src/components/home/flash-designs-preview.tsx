"use client"

import { motion } from "framer-motion"

import type { FlashDesign } from "@/data/flash-designs"
import type { FlashPreviewSectionContent, FlashPreviewSectionLayout, FlashPreviewSectionStyle } from "@/data/home-sections"
import { formatPrice } from "@/lib/format-price"

import { FlashCard } from "./flash-card"
import {
  BentoGridLayout,
  BracketGridLayout,
  CarouselGalleryLayout,
  FramedGridLayout,
  GrungeGalleryLayout,
  WideGridLayout,
  type SharedGalleryItem,
  type SharedGalleryLayoutStyle,
} from "./shared-gallery-layouts"

type FlashDesignsPreviewProps = {
  designs: FlashDesign[]
  content: FlashPreviewSectionContent
  layout: FlashPreviewSectionLayout
  style: FlashPreviewSectionStyle
}

const sectionBackgroundClassNames: Record<FlashPreviewSectionStyle["background"], string> = {
  default: "bg-background",
}

const statusBadgeTone: Record<FlashDesign["status"], SharedGalleryItem["badgeTone"]> = {
  Disponible: "primary",
  Reservado: "secondary",
  Reclamado: "muted",
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

export function FlashDesignsPreview({ designs, content, layout, style }: FlashDesignsPreviewProps) {
  const hasHeader = Boolean(content.eyebrow || content.highlightedTitle || content.description)
  const action = content.buttonHref && content.buttonLabel ? { href: content.buttonHref, label: content.buttonLabel } : undefined
  const layoutStyle = layout.layoutStyle
  const columnsDesktop = layout.columnsDesktop
  const chrome = getLayoutChrome(layoutStyle)
  const items: SharedGalleryItem[] = designs.map((design) => ({
    id: design.id,
    title: design.name,
    subtitle: design.style || "Diseño",
    image: design.image,
    href: `/disenos?id=${design.id}`,
    badge: design.status,
    badgeTone: statusBadgeTone[design.status],
    meta: formatPrice(design.price),
    renderCarouselCard: (index) => <FlashCard design={design} index={index} />,
    renderFramedGridCard: (index) => <FlashCard key={design.id} design={design} index={index} />,
  }))

  return (
    <section id="flash" className={`relative overflow-hidden py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`} data-layout={layoutStyle}>
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
              {content.highlightedTitle && (
                <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
                  <span className="text-primary">{content.highlightedTitle}</span>
                </h2>
              )}
              {content.description && (
                <p className={layoutStyle === "bento-grid" ? "mt-4 max-w-md text-muted-foreground font-serif italic" : "text-muted-foreground font-serif italic mt-4 max-w-xl mx-auto"}>
                  {content.description}
                </p>
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
        {layoutStyle === "grid" && <BracketGridLayout items={items} action={action} columnsDesktop={columnsDesktop} />}
        {layoutStyle === "framed-grid" && <FramedGridLayout items={items} action={action} columnsDesktop={columnsDesktop} />}
        {layoutStyle === "bento-grid" && <BentoGridLayout items={items} action={action} />}
        {layoutStyle === "wide-grid" && <WideGridLayout items={items} action={action} />}
        {layoutStyle === "grunge-gallery" && <GrungeGalleryLayout items={items} action={action} eyebrow={content.eyebrow} />}
      </div>
    </section>
  )
}
