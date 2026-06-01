"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { TattooImageLightbox } from "@/components/tattoo-image-lightbox"
import type { FlashDesign } from "@/data/flash-designs"
import { useLightboxOpenGuard } from "@/hooks/use-lightbox-open-guard"

import { FlashDesignCard } from "./flash-design-card"

const statuses = ["Todo", "Disponible", "Reservado", "Reclamado"] as const

type FlashStatusFilter = (typeof statuses)[number]

type FlashGalleryProps = {
  designs: FlashDesign[]
  whatsappUrl?: string
}

export function FlashGallery({ designs, whatsappUrl }: FlashGalleryProps) {
  const [selectedDesign, setSelectedDesign] = useState<FlashDesign | null>(null)
  const canOpenLightbox = useLightboxOpenGuard()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedDesignId = searchParams.get("id")
  const requestedStatus = searchParams.get("estado") ?? "Todo"
  const selectedStatus: FlashStatusFilter = statuses.includes(requestedStatus as FlashStatusFilter)
    ? (requestedStatus as FlashStatusFilter)
    : "Todo"
  const selectedDesignById = requestedDesignId
    ? designs.find((design) => String(design.id) === requestedDesignId) ?? null
    : null
  const filteredDesigns = requestedDesignId
    ? selectedDesignById
      ? [selectedDesignById]
      : []
    : selectedStatus === "Todo"
      ? designs
      : designs.filter((design) => design.status === selectedStatus)

  function selectStatus(status: FlashStatusFilter) {
    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete("id")

    if (status === "Todo") {
      nextParams.delete("estado")
    } else {
      nextParams.set("estado", status)
    }

    const query = nextParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function openDesign(design: FlashDesign) {
    if (!canOpenLightbox()) {
      return
    }

    setSelectedDesign(design)
  }

  return (
    <section className="relative bg-background grunge-texture py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Listos para tatuar</span>
          <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
            <span className="text-primary">DISEÑOS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
            Diseños tradicionales listos para elegir, ubicar y tatuar con líneas claras.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {statuses.map((status, index) => (
            <motion.button
              key={status}
              type="button"
              onClick={() => selectStatus(status)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              aria-pressed={selectedStatus === status}
              className={`border px-4 py-2 font-sans text-sm tracking-widest uppercase transition-colors ${
                selectedStatus === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            {requestedDesignId ? "No encontramos ese diseño por ahora." : "No hay diseños con este estado por ahora."}
          </p>
        )}
      </div>
      <TattooImageLightbox
        tattoo={selectedDesign ? { image: selectedDesign.image, title: selectedDesign.name } : null}
        onClose={() => setSelectedDesign(null)}
      />
    </section>
  )
}
