"use client"

import { motion } from "framer-motion"

import type { SiteSettings } from "@/lib/supabase/content"

type ContactCTAProps = {
  settings: SiteSettings
}

export function ContactCTA({ settings }: ContactCTAProps) {
  return (
    <section id="contact" className="relative py-24 bg-background grunge-texture overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto">
          <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">¿Listo para tatuarte?</span>
          <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 mb-6 fire-glow">
            CONSULTÁ TU <span className="text-primary">IDEA</span>
          </h2>
          <p className="text-muted-foreground font-serif italic text-lg mb-12">
            Los diseños se pueden consultar directo. Los trabajos personalizados se coordinan por mensaje.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
            {settings.whatsappUrl && (
              <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.55_0.16_50/0.4),0_0_40px_oklch(0.45_0.18_25/0.2)] w-full md:w-auto justify-center">
                WhatsApp
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-8 py-4 border-2 border-secondary text-secondary font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_oklch(0.55_0.12_85/0.3)] w-full md:w-auto justify-center">
                Instagram
              </a>
            )}
          </div>

          <div className="text-muted-foreground font-serif">
            {settings.studioAddress && <p className="text-lg">{settings.studioAddress}</p>}
            {settings.studioHours && (
              <p className="mt-2">
                <span className="text-foreground">Horario:</span> {settings.studioHours}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
