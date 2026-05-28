"use client"

import { motion } from "framer-motion"

import { featuredWorks } from "@/data/tattoos"

import { PortfolioCard } from "./portfolio-card"

const categories = ["All", ...Array.from(new Set(featuredWorks.map((tattoo) => tattoo.style)))]

export function PortfolioGallery() {
  return (
    <section id="portfolio" className="relative bg-background grunge-texture py-20 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Portfolio</span>
          <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
            THE <span className="text-primary">WORK</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
            A tight selection of traditional, old-school, and neo-traditional pieces built with bold lines and lasting contrast.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className={`border px-4 py-2 font-sans text-sm tracking-widest uppercase transition-colors ${
                index === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredWorks.map((tattoo, index) => (
            <PortfolioCard key={tattoo.id} tattoo={tattoo} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
