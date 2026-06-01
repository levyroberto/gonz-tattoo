"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { SiteSettings } from "@/lib/supabase/content"

type AboutSectionProps = {
  settings: SiteSettings
}

export function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section id="about" className="relative py-24 bg-card grunge-texture">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="relative aspect-[4/5] vintage-border overflow-hidden">
              <Image src="/images/artist/artist-portrait-01.jpg" alt="Artista tatuando en el estudio" fill sizes="(min-width: 1024px) 50vw, 100vw" unoptimized className="object-cover" />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary flex items-center justify-center">
              <div className="text-center">
                <span className="block text-4xl font-sans text-primary-foreground">{settings.artistYears}</span>
                <span className="text-xs tracking-wider text-primary-foreground/80 uppercase">👹</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{settings.artistName}</span>
            <h2 className="text-5xl md:text-6xl font-sans tracking-wider mt-2 mb-6 text-foreground">
              
            </h2>

            <div className="space-y-4 text-muted-foreground font-serif leading-relaxed">
              <p>Trabaja la tradición del tatuaje con líneas firmes, contraste sólido y una mirada personal sobre cada pieza.</p>
              <p>Su base está en el old school y el tradicional: diseños claros, colores con presencia y tatuajes pensados para durar.</p>
              <p className="text-foreground italic">&quot;La idea es que cada tatuaje tenga fuerza, lectura y carácter propio.&quot;</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
              <div>
                <span className="block text-3xl font-sans text-primary">+10</span>
                <span className="text-sm text-muted-foreground">Años de experiencia</span>
              </div>
              <div>
                <span className="block text-3xl font-sans text-secondary">500+</span>
                <span className="text-sm text-muted-foreground">Diseños personalizados</span>
              </div>
              <div>
                <span className="block text-3xl font-sans text-accent">15+</span>
                <span className="text-sm text-muted-foreground">Reconocimientos</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
