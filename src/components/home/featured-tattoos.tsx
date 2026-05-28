"use client"

import { motion } from "framer-motion"

import { featuredWorks } from "@/data/tattoos"

import { TattooCard } from "./tattoo-card"

export function FeaturedTattoos() {
  return (
    <section id="portfolio" className="relative py-24 bg-card grunge-texture">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">Recent Work</span>
          <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 text-foreground">
            FEATURED <span className="text-primary">PIECES</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredWorks.map((work, index) => (
            <TattooCard key={work.id} tattoo={work} index={index} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="text-center mt-12">
          <a href="#" className="inline-block px-8 py-4 border-2 border-primary text-primary font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.4)]">
            View Full Portfolio
          </a>
        </motion.div>
      </div>
    </section>
  )
}
