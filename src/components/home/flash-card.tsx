"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

import type { FlashDesign } from "@/data/flash-designs"
import { formatPrice } from "@/lib/format-price"

interface FlashCardProps {
  design: FlashDesign
  index: number
}

const statusBadgeStyles = {
  Disponible: "border-primary bg-primary text-primary-foreground",
  Reservado: "border-secondary/60 bg-background/80 text-secondary",
  Reclamado: "border-muted-foreground/50 bg-background/80 text-muted-foreground",
}

export function FlashCard({ design, index }: FlashCardProps) {
  return (
    <motion.div
      key={design.id}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative aspect-square w-full overflow-hidden bg-muted/30"
    >
      <Link href={`/disenos?id=${design.id}`} className="block h-full w-full text-left">
        <Image src={design.image} alt={design.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute top-3 right-3 border px-2.5 py-1 text-[0.65rem] font-sans tracking-widest uppercase ${statusBadgeStyles[design.status]}`}>
          {design.status}
        </span>
        <div className="absolute bottom-0 left-0 right-0 bg-background/90 py-2 px-3">
          <div className="flex justify-between items-center">
            <span className="text-sm md:text-base font-sans tracking-wider text-foreground">{design.name}</span>
            <span className="text-sm md:text-base font-sans text-primary">{formatPrice(design.price)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
