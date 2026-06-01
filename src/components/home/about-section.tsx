"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { AboutSectionContent, AboutSectionLayout, AboutSectionStyle } from "@/data/home-sections"
import type { SiteSettings } from "@/lib/supabase/content"

type AboutSectionProps = {
  settings: SiteSettings
  content: AboutSectionContent
  layout: AboutSectionLayout
  style: AboutSectionStyle
}

const sectionBackgroundClassNames: Record<AboutSectionStyle["background"], string> = {
  card: "bg-card",
}

const statToneClassNames: Record<AboutSectionContent["stats"][number]["tone"], string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
}

export function AboutSection({ settings, content, layout, style }: AboutSectionProps) {
  return (
    <section id="about" className={`relative py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`} data-image-side={layout.imageSide}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="relative aspect-[4/5] vintage-border overflow-hidden">
              <Image src={style.image} alt="Artista tatuando en el estudio" fill sizes="(min-width: 1024px) 50vw, 100vw" unoptimized className="object-cover" />
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
              {content.title}
            </h2>

            <div className="space-y-4 text-muted-foreground font-serif leading-relaxed">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="text-foreground italic">&quot;{content.quote}&quot;</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border">
              {content.stats.map((stat) => (
                <div key={stat.label}>
                  <span className={`block text-3xl font-sans ${statToneClassNames[stat.tone]}`}>{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
