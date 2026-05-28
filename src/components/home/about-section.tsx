"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 bg-card grunge-texture">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="relative aspect-[4/5] vintage-border overflow-hidden">
              <Image src="/images/artist.png" alt="Tattoo artist at work" fill className="object-cover" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary flex items-center justify-center">
              <div className="text-center">
                <span className="block text-4xl font-sans text-primary-foreground">25+</span>
                <span className="text-xs tracking-wider text-primary-foreground/80 uppercase">Years</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">The Artist</span>
            <h2 className="text-5xl md:text-6xl font-sans tracking-wider mt-2 mb-6 text-foreground">
              JOHNNY <span className="text-primary">VIPER</span>
            </h2>

            <div className="space-y-4 text-muted-foreground font-serif leading-relaxed">
              <p>Started slinging ink on the Sunset Strip back in &apos;98. Cut my teeth tattooing rock stars, bikers, and anyone bold enough to walk through my door.</p>
              <p>Old school traditional is my bread and butter. Bold lines, solid colors, designs that last a lifetime. None of that trendy stuff that fades in five years.</p>
              <p className="text-foreground italic">&quot;I don&apos;t do small. I don&apos;t do subtle. I do legendary.&quot;</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
              <div>
                <span className="block text-3xl font-sans text-primary">10K+</span>
                <span className="text-sm text-muted-foreground">Tattoos Done</span>
              </div>
              <div>
                <span className="block text-3xl font-sans text-secondary">500+</span>
                <span className="text-sm text-muted-foreground">Custom Designs</span>
              </div>
              <div>
                <span className="block text-3xl font-sans text-accent">15+</span>
                <span className="text-sm text-muted-foreground">Awards Won</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
