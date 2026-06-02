"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { TattooImageLightbox } from "@/components/tattoo-image-lightbox"
import type { PortfolioPageSectionContent, PortfolioPageSectionLayout, PortfolioPageSectionStyle } from "@/data/page-sections"
import type { Tattoo } from "@/data/tattoos"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import { PortfolioCard } from "./portfolio-card"

type PortfolioGalleryProps = {
  content: PortfolioPageSectionContent
  layout: PortfolioPageSectionLayout
  style: PortfolioPageSectionStyle
  tattoos: Tattoo[]
}

const sectionBackgroundClassNames: Record<PortfolioPageSectionStyle["background"], string> = {
  default: "bg-background",
}

const gridClassNames: Record<`${PortfolioPageSectionLayout["columnsTablet"]}-${PortfolioPageSectionLayout["columnsDesktop"]}`, string> = {
  "2-4": "sm:grid-cols-2 xl:grid-cols-4",
}

export function PortfolioGallery({ content, layout, style, tattoos }: PortfolioGalleryProps) {
  const categories = ["Todo", ...Array.from(new Set(tattoos.map((tattoo) => tattoo.style?.trim()).filter((style): style is string => Boolean(style))))]
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedCategory = searchParams.get("estilo") ?? "Todo"
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : "Todo"
  const visibleTattoos = selectedCategory === "Todo" ? tattoos : tattoos.filter((tattoo) => tattoo.style === selectedCategory)

  const gridColumns = gridClassNames[`${layout.columnsTablet}-${layout.columnsDesktop}`]

  function selectCategory(category: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (category === "Todo") {
      nextParams.delete("estilo")
    } else {
      nextParams.set("estilo", category)
    }

    const query = nextParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function openTattoo(tattoo: Tattoo) {
    if (!canOpenLightbox()) {
      return
    }

    setSelectedTattoo(tattoo)
  }

  return (
    <section id="portfolio" className={`relative ${sectionBackgroundClassNames[style.background]} grunge-texture py-20 md:py-24`} data-layout={layout.layoutStyle}>
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

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              aria-pressed={selectedCategory === category}
              className={`border px-4 py-2 font-sans text-sm tracking-widest uppercase transition-colors ${
                selectedCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        <div className={`mt-14 grid grid-cols-1 gap-6 ${gridColumns}`}>
          {visibleTattoos.map((tattoo, index) => (
            <PortfolioCard key={tattoo.id} tattoo={tattoo} index={index} onOpen={openTattoo} />
          ))}
        </div>
      </div>
      <TattooImageLightbox tattoo={selectedTattoo} onClose={() => setSelectedTattoo(null)} />
    </section>
  )
}
