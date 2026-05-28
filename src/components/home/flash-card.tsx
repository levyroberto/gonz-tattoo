"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { FlashDesign } from "@/data/flash-designs"

interface FlashCardProps {
  design: FlashDesign
  index: number
}

export function FlashCard({ design, index }: FlashCardProps) {
  return (
    <motion.div key={design.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }} className="group relative aspect-square bg-muted/30 overflow-hidden cursor-pointer">
      <Image src={design.image} alt={design.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 py-2 px-3">
        <div className="flex justify-between items-center">
          <span className="text-sm md:text-base font-sans tracking-wider text-foreground">{design.name}</span>
          <span className="text-sm md:text-base font-sans text-primary">{design.price}</span>
        </div>
      </div>
    </motion.div>
  )
}
