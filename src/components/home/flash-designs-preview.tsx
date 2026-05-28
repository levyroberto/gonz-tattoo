"use client"

import { motion } from "framer-motion"

import { flashDesigns } from "@/data/flash-designs"

import { FlashCard } from "./flash-card"

export function FlashDesignsPreview() {
  return (
    <section id="flash" className="relative py-24 bg-background grunge-texture">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Walk-In Ready</span>
          <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
            FLASH <span className="text-primary">TATTOOS</span>
          </h2>
          <p className="text-muted-foreground font-serif italic mt-4 max-w-xl mx-auto">
            Classic designs ready to go. Walk in, pick your piece, get inked.
          </p>
        </motion.div>

        <div className="relative paper-texture vintage-border p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {flashDesigns.map((design, index) => (
              <FlashCard key={design.id} design={design} index={index} />
            ))}
          </div>

          <div className="absolute top-2 right-4 text-muted-foreground/50 font-sans text-sm">SHEET #42</div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-12">
          <a href="/flash" className="inline-block px-8 py-4 bg-secondary text-secondary-foreground font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-secondary/90 hover:shadow-[0_0_15px_oklch(0.55_0.12_85/0.3)]">
            Browse All Flash
          </a>
        </motion.div>
      </div>
    </section>
  )
}
