"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { Tattoo } from "@/data/tattoos"

interface PortfolioCardProps {
  tattoo: Tattoo
  index: number
}

export function PortfolioCard({ tattoo, index }: PortfolioCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group overflow-hidden vintage-border bg-card"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Image src={tattoo.image} alt={tattoo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-sans tracking-wider text-foreground">{tattoo.title}</h2>
            <p className="text-secondary font-serif italic mt-1">{tattoo.style}</p>
          </div>
          <span className="shrink-0 border border-primary/40 px-3 py-1 text-xs font-sans tracking-widest uppercase text-primary">
            #{String(tattoo.id).padStart(2, "0")}
          </span>
        </div>

        {tattoo.description ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-serif">{tattoo.description}</p>
        ) : null}
      </div>
    </motion.article>
  )
}
