"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { Tattoo } from "@/data/tattoos"

interface TattooCardProps {
  tattoo: Tattoo
  index: number
}

export function TattooCard({ tattoo, index }: TattooCardProps) {
  return (
    <motion.div key={tattoo.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group relative aspect-square overflow-hidden vintage-border cursor-pointer">
      <Image src={tattoo.image} alt={tattoo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-3xl font-sans tracking-wider text-foreground">{tattoo.title}</h3>
          <p className="text-secondary font-serif italic mt-2">{tattoo.style}</p>
        </div>
      </div>
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
    </motion.div>
  )
}
