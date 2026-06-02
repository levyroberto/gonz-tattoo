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
  image?: string
}

const sectionBackgroundClassNames: Record<AboutSectionStyle["background"], string> = {
  card: "bg-card",
}

export function AboutSection({ settings, content, layout, style, image }: AboutSectionProps) {
  return (
    <section id="about" className={`relative scroll-mt-20 py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture`} data-image-side={layout.imageSide}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {image && (
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
              <div className="relative aspect-[4/5] vintage-border overflow-hidden">
                <Image src={image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" unoptimized className="object-cover" />
                <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
              </div>
              {settings.artistYears && (
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary flex items-center justify-center">
                  <span className="block text-4xl font-sans text-primary-foreground">{settings.artistYears}</span>
                </div>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="mb-8 flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-16 bg-primary" />
              <span className="size-2 rotate-45 bg-primary/70" />
              <span className="h-px flex-1 bg-border" />
            </div>

            {content.title && (
              <h2 className="text-5xl md:text-6xl font-sans tracking-wider mb-6 text-foreground">
                {content.title}
              </h2>
            )}

            <div className="space-y-4 text-muted-foreground font-serif leading-relaxed">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {content.quote && <p className="text-foreground italic">&quot;{content.quote}&quot;</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
