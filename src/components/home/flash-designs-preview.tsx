"use client"

import { motion } from "framer-motion"

import type { FlashDesign } from "@/data/flash-designs"
import type { FlashPreviewSectionContent, FlashPreviewSectionLayout, FlashPreviewSectionStyle } from "@/data/home-sections"
import { normalizeInternalLink } from "@/lib/internal-links"

import { FlashCard } from "./flash-card"

type FlashDesignsPreviewProps = {
  designs: FlashDesign[]
  content: FlashPreviewSectionContent
  layout: FlashPreviewSectionLayout
  style: FlashPreviewSectionStyle
}

const sectionBackgroundClassNames: Record<FlashPreviewSectionStyle["background"], string> = {
  default: "bg-background",
}

const frameClassNames: Record<FlashPreviewSectionStyle["frame"], string> = {
  paper: "paper-texture vintage-border",
}

const gridClassNames: Record<`${FlashPreviewSectionLayout["columnsMobile"]}-${FlashPreviewSectionLayout["columnsDesktop"]}`, string> = {
  "2-3": "grid-cols-2 md:grid-cols-3",
}

export function FlashDesignsPreview({ designs, content, layout, style }: FlashDesignsPreviewProps) {
  const gridColumns = gridClassNames[`${layout.columnsMobile}-${layout.columnsDesktop}`]
  const hasHeader = Boolean(content.eyebrow || content.highlightedTitle || content.description)
  const hasButton = Boolean(content.buttonHref && content.buttonLabel)

  return (
    <section id="flash" className={`relative py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`}>
      <div className="container mx-auto px-4">
        {hasHeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
            {content.highlightedTitle && (
              <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
                <span className="text-primary">{content.highlightedTitle}</span>
              </h2>
            )}
            {content.description && (
              <p className="text-muted-foreground font-serif italic mt-4 max-w-xl mx-auto">
                {content.description}
              </p>
            )}
          </motion.div>
        )}

        <div className={`relative ${frameClassNames[style.frame]} p-4 md:p-8`}>
          <div className={`grid ${gridColumns} gap-4 md:gap-6`}>
            {designs.map((design, index) => (
              <FlashCard key={design.id} design={design} index={index} />
            ))}
          </div>

        </div>

        {hasButton && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-12">
            <a href={normalizeInternalLink(content.buttonHref)} className="inline-block px-8 py-4 bg-secondary text-secondary-foreground font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-secondary/90 hover:shadow-[0_0_15px_oklch(0.55_0.12_85/0.3)]">
              {content.buttonLabel}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}
