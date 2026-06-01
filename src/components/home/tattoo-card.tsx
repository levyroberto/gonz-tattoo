"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { Tattoo } from "@/data/tattoos"

interface TattooCardProps {
  tattoo: Tattoo
  index: number
  onOpen?: (tattoo: Tattoo) => void
}

export function TattooCard({ tattoo, index, onOpen }: TattooCardProps) {
  return (
    <motion.button
      key={tattoo.id}
      type="button"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative aspect-square w-full overflow-hidden vintage-border cursor-pointer text-left"
      onClick={() => onOpen?.(tattoo)}
    >
      <Image src={tattoo.image} alt={tattoo.title} fill className="object-cover" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="text-center">
        </div>
      </div>
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
    </motion.button>
  )
}
