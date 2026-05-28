"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { FlashDesign } from "@/data/flash-designs"

interface FlashDesignCardProps {
  design: FlashDesign
  index: number
}

const statusStyles = {
  Available: {
    card: "bg-card",
    image: "opacity-95 group-hover:opacity-100",
    badge: "border-primary bg-primary text-primary-foreground",
    cta: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.4)]",
  },
  Reserved: {
    card: "bg-card/80",
    image: "opacity-70 grayscale-[35%]",
    badge: "border-secondary/60 bg-secondary/10 text-secondary",
    cta: "border border-secondary/60 text-secondary hover:bg-secondary hover:text-secondary-foreground",
  },
  Claimed: {
    card: "bg-card/60",
    image: "opacity-50 grayscale",
    badge: "border-muted-foreground/50 bg-muted/30 text-muted-foreground",
    cta: "border border-border text-muted-foreground cursor-not-allowed",
  },
}

export function FlashDesignCard({ design, index }: FlashDesignCardProps) {
  const styles = statusStyles[design.status]
  const isAvailable = design.status === "Available"

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className={`group relative overflow-hidden vintage-border paper-texture ${styles.card}`}
    >
      <div className="absolute top-3 right-3 z-10 text-muted-foreground/50 font-sans text-xs tracking-widest">
        FLASH #{String(design.id).padStart(2, "0")}
      </div>

      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <Image src={design.image} alt={design.name} fill className={`object-cover transition-all duration-500 group-hover:scale-105 ${styles.image}`} />
        {!isAvailable ? <div className="absolute inset-0 bg-background/20" /> : null}
      </div>

      <div className="space-y-5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-sans tracking-wider text-foreground">{design.name}</h2>
            <p className="mt-1 text-secondary font-serif italic">{design.style}</p>
          </div>
          <span className={`shrink-0 border px-3 py-1 text-xs font-sans tracking-widest uppercase ${styles.badge}`}>
            {design.status}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-sans tracking-widest text-muted-foreground uppercase">Placement</dt>
            <dd className="mt-1 font-serif text-foreground">{design.placement}</dd>
          </div>
          <div>
            <dt className="font-sans tracking-widest text-muted-foreground uppercase">Size</dt>
            <dd className="mt-1 font-serif text-foreground">{design.size}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-4">
          <span className="text-3xl font-sans text-primary">{design.price}</span>
          <a
            href={isAvailable ? "/#contact" : undefined}
            aria-disabled={!isAvailable}
            className={`px-5 py-3 text-center font-sans text-sm tracking-widest uppercase transition-all ${styles.cta}`}
          >
            {isAvailable ? "Claim Design" : design.status}
          </a>
        </div>
      </div>
    </motion.article>
  )
}
