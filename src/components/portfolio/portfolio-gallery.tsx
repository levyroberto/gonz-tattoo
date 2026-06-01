"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { TattooImageLightbox } from "@/components/tattoo-image-lightbox"
import type { Tattoo } from "@/data/tattoos"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import { PortfolioCard } from "./portfolio-card"

type PortfolioGalleryProps = {
  tattoos: Tattoo[]
}

export function PortfolioGallery({ tattoos }: PortfolioGalleryProps) {
  const categories = ["Todo", ...Array.from(new Set(tattoos.map((tattoo) => tattoo.style)))]
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedCategory = searchParams.get("estilo") ?? "Todo"
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : "Todo"
  const visibleTattoos = selectedCategory === "Todo" ? tattoos : tattoos.filter((tattoo) => tattoo.style === selectedCategory)

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
    <section id="portfolio" className="relative bg-background grunge-texture py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Mis trabajos</span>
          <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
            TRABAJOS <span className="text-primary">REALIZADOS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
          Algunos trabajos realizados, con línea, contraste y presencia.
          </p>
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

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTattoos.map((tattoo, index) => (
            <PortfolioCard key={tattoo.id} tattoo={tattoo} index={index} onOpen={openTattoo} />
          ))}
        </div>
      </div>
      <TattooImageLightbox tattoo={selectedTattoo} onClose={() => setSelectedTattoo(null)} />
    </section>
  )
}
