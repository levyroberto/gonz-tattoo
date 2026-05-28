"use client"

import { motion } from "framer-motion"

import { flashDesigns } from "@/data/flash-designs"

import { FlashDesignCard } from "./flash-design-card"

const statuses = ["All", "Available", "Reserved", "Claimed"]

export function FlashGallery() {
  return (
    <section className="relative bg-background grunge-texture py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Walk-In Ready</span>
          <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
            FLASH <span className="text-primary">SHEETS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
            Traditional designs pulled from the wall, ready for bold placement and clean execution.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {statuses.map((status, index) => (
            <motion.button
              key={status}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className={`border px-4 py-2 font-sans text-sm tracking-widest uppercase transition-colors ${
                index === 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {flashDesigns.map((design, index) => (
            <FlashDesignCard key={design.id} design={design} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
