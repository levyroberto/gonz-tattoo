"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import { flashStatusBadgeStyles, type FlashDesign } from "@/data/flash-designs"
import { formatPrice } from "@/lib/format-price"

interface FlashDesignCardProps {
  design: FlashDesign
  index: number
  onOpen?: (design: FlashDesign) => void
  whatsappUrl?: string
}

const statusStyles = {
  Disponible: {
    card: "bg-card",
    badge: "border-primary bg-primary text-primary-foreground",
    cta: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.4)]",
  },
  Reservado: {
    card: "bg-card/80",
    badge: "border-secondary/60 bg-background/80 text-secondary",
  },
  Reclamado: {
    card: "bg-card/60",
    badge: "border-muted-foreground/50 bg-background/80 text-muted-foreground",
  },
}

const availableCtaClass =
  "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.4)]"

function buildWhatsappUrl(baseUrl: string, design: FlashDesign) {
  const separator = baseUrl.includes("?") ? "&" : "?"
  const message = `Hola Gonzalo, quiero consultar por el diseño "${design.name}" ¿Está disponible?`

  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`
}

export function FlashDesignCard({ design, index, onOpen, whatsappUrl }: FlashDesignCardProps) {
  const styles = statusStyles[design.status]
  const isAvailable = design.status === "Disponible"
  const ctaHref = whatsappUrl ? buildWhatsappUrl(whatsappUrl, design) : "/contact"

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className={`group relative overflow-hidden vintage-border paper-texture ${styles.card}`}
    >
      <div className="absolute top-3 right-3 z-10 text-muted-foreground/50 font-sans text-xs tracking-widest">
        DISEÑO #{String(design.id).padStart(2, "0")}
      </div>

      <button
        type="button"
        aria-label={`Ampliar ${design.name}`}
        onClick={() => onOpen?.(design)}
        className="relative block aspect-square w-full overflow-hidden bg-muted/20 text-left"
      >
        <Image src={design.image} alt={design.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute bottom-4 right-4 border px-3 py-1 text-xs font-sans tracking-widest uppercase ${flashStatusBadgeStyles[design.status]}`}>
          {design.status}
        </span>
      </button>

      <div className="space-y-5 p-5 md:p-6">
        <div>
          <h2 className="text-3xl font-sans tracking-wider text-foreground">{design.name}</h2>
          <p className="mt-1 text-secondary font-serif italic">{design.style}</p>
        </div>

        <dl className="grid grid-cols-1 gap-3 border-y border-border py-4 text-sm">
          <div>
            <dt className="font-sans tracking-widest text-muted-foreground uppercase">Tamaño</dt>
            <dd className="mt-1 font-serif text-foreground">{design.size}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-4">
          <span className="text-3xl font-sans text-primary">{formatPrice(design.price)}</span>
          {isAvailable ? (
            <a
              href={ctaHref}
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noopener noreferrer" : undefined}
              className={`px-5 py-3 text-center font-sans text-sm tracking-widest uppercase transition-all ${availableCtaClass}`}
            >
              Consultar diseño
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
