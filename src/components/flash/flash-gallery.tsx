"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { TattooImageLightbox } from "@/components/ui/tattoo-image-lightbox"
import type { SaleableArtwork as FlashDesign } from "@/data/artworks"
import type { FlashPageSectionContent, FlashPageSectionLayout, FlashPageSectionStyle } from "@/data/page-sections"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import { FlashDesignCard } from "./flash-design-card"

const SALEABLE_TYPES = ["flash", "sculpture", "painting"] as const
type SaleableType = (typeof SALEABLE_TYPES)[number]

const TYPE_LABELS: Record<SaleableType, string> = {
  flash: "Diseño flash",
  sculpture: "Escultura",
  painting: "Pintura",
}

type FlashGalleryProps = {
  content: FlashPageSectionContent
  designs: FlashDesign[]
  layout: FlashPageSectionLayout
  style: FlashPageSectionStyle
  whatsappUrl?: string
}

const sectionBackgroundClassNames: Record<FlashPageSectionStyle["background"], string> = {
  default: "bg-background",
}

const gridClassNames: Record<`${FlashPageSectionLayout["columnsTablet"]}-${FlashPageSectionLayout["columnsDesktop"]}`, string> = {
  "2-3": "md:grid-cols-2 xl:grid-cols-3",
}

function parseSelectedType(param: string | null): SaleableType | null {
  if (!param) return null
  return SALEABLE_TYPES.includes(param as SaleableType) ? (param as SaleableType) : null
}

export function FlashGallery({ content, designs, layout, style, whatsappUrl }: FlashGalleryProps) {
  const [selectedDesign, setSelectedDesign] = useState<FlashDesign | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const requestedDesignId = searchParams.get("id")
  const selectedType = parseSelectedType(searchParams.get("tipo"))
  const availableTypes = SALEABLE_TYPES.filter((t) => designs.some((d) => d.type === t))

  const selectedDesignById = requestedDesignId
    ? designs.find((d) => String(d.id) === requestedDesignId) ?? null
    : null

  const filteredDesigns = requestedDesignId
    ? selectedDesignById ? [selectedDesignById] : []
    : selectedType === null
      ? designs
      : designs.filter((d) => d.type === selectedType)

  const gridColumns = gridClassNames[`${layout.columnsTablet}-${layout.columnsDesktop}`]

  function selectType(type: SaleableType) {
    const params = new URLSearchParams(searchParams)
    params.delete("id")

    if (selectedType === type) {
      params.delete("tipo")
    } else {
      params.set("tipo", type)
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function openDesign(design: FlashDesign) {
    if (!canOpenLightbox()) return
    setSelectedDesign(design)
  }

  return (
    <section className={`relative ${sectionBackgroundClassNames[style.background]} grunge-texture py-20 md:py-24`} data-layout={layout.layoutStyle}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
          {(content.title || content.highlightedTitle) && (
            <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
              {content.title} <span className="text-primary">{content.highlightedTitle}</span>
            </h1>
          )}
          {content.description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
              {content.description}
            </p>
          )}
        </motion.div>

        {availableTypes.length > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {availableTypes.map((type, index) => {
              const isSelected = selectedType === type
              return (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => selectType(type)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  aria-pressed={isSelected}
                  className={`border px-4 py-2 font-sans text-sm tracking-widest uppercase transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
                  }`}
                >
                  {TYPE_LABELS[type]}
                </motion.button>
              )
            })}
          </div>
        )}

        <div className={`mt-14 grid grid-cols-1 gap-6 ${gridColumns}`}>
          {filteredDesigns.map((design, index) => (
            <FlashDesignCard
              key={design.id}
              design={design}
              index={index}
              onOpen={openDesign}
              whatsappUrl={whatsappUrl}
            />
          ))}
        </div>
        {filteredDesigns.length === 0 && (
          <p className="mt-10 text-center font-serif text-lg italic text-muted-foreground">
            {requestedDesignId ? content.missingDesignState : content.emptyState}
          </p>
        )}
      </div>
      <TattooImageLightbox
        tattoo={selectedDesign ? { image: selectedDesign.image, title: selectedDesign.title } : null}
        onClose={() => setSelectedDesign(null)}
      />
    </section>
  )
}
