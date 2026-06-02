"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import type { ContactPageSectionContent, ContactPageSectionLayout, ContactPageSectionStyle } from "@/data/page-sections"
import type { SiteSettings } from "@/lib/supabase/content"

type ContactPageContentProps = {
  content: ContactPageSectionContent
  layout: ContactPageSectionLayout
  settings: SiteSettings
  style: ContactPageSectionStyle
}

const sectionBackgroundClassNames: Record<ContactPageSectionStyle["background"], string> = {
  default: "bg-background",
}

export function ContactPageContent({ content, layout, settings, style }: ContactPageContentProps) {
  return (
    <section className={`relative ${sectionBackgroundClassNames[style.background]} grunge-texture py-20 md:py-24`} data-layout={layout.layoutStyle}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
          {(content.title || content.highlightedTitle) && (
            <h1 className="mt-3 text-6xl md:text-8xl lg:text-9xl font-sans tracking-wider leading-none fire-glow">
              {content.title}<span className="text-primary">{content.highlightedTitle}</span>
            </h1>
          )}
          {content.description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground font-serif italic">
              {content.description}
            </p>
          )}
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {style.image && (
              <div className="relative aspect-[4/5] vintage-border overflow-hidden">
                <Image src={style.image} alt="Artista tatuando en el estudio" fill sizes="(min-width: 1024px) 45vw, 100vw" unoptimized className="object-cover" />
                <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
              </div>
            )}
            <div className="absolute -bottom-5 -right-5 bg-primary px-6 py-5 text-center">
              <span className="block text-4xl font-sans text-primary-foreground">{settings.artistYears}</span>
              <span className="text-xs tracking-wider text-primary-foreground/80 uppercase">{content.yearsLabel}</span>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.article
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="vintage-border paper-texture p-6 md:p-8"
            >
              <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.cardEyebrow}</span>
              <h2 className="mt-2 text-4xl md:text-5xl font-sans tracking-wider text-foreground">
                {content.cardTitle} <span className="text-primary">{content.cardHighlightedTitle}</span>
              </h2>
              <p className="mt-5 text-muted-foreground font-serif leading-relaxed">
                {content.cardDescription}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {settings.whatsappUrl && (
                  <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center bg-primary px-8 py-4 text-primary-foreground font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.55_0.16_50/0.4),0_0_40px_oklch(0.45_0.18_25/0.2)]">
                    {content.whatsappLabel}
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center border-2 border-secondary px-8 py-4 text-secondary font-sans text-lg tracking-widest uppercase transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_oklch(0.55_0.12_85/0.3)]">
                    {content.instagramLabel}
                  </a>
                )}
              </div>
            </motion.article>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-12 grid grid-cols-1 gap-4 border-y border-border py-8 text-center md:grid-cols-3"
        >
          <div>
            <span className="block text-3xl font-sans text-primary">{content.addressValue}</span>
            <span className="text-sm text-muted-foreground font-serif">{settings.studioAddress}</span>
          </div>
          <div>
            <span className="block text-3xl font-sans text-secondary">{content.scheduleValue}</span>
            <span className="text-sm text-muted-foreground font-serif">{settings.studioHours}</span>
          </div>
          <div>
            <span className="block text-3xl font-sans text-accent">{content.directValue}</span>
            <span className="text-sm text-muted-foreground font-serif">{content.directLabel}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
