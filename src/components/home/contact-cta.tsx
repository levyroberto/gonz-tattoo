"use client"

import { motion } from "framer-motion"

import type { ContactCtaSectionContent, ContactCtaSectionLayout, ContactCtaSectionStyle } from "@/data/home-sections"
import type { SiteSettings } from "@/lib/supabase/content"
import { WhatsAppButton, InstagramButton } from "@/components/ui/buttons"

type ContactCTAProps = {
  settings: SiteSettings
  content: ContactCtaSectionContent
  layout: ContactCtaSectionLayout
  style: ContactCtaSectionStyle
}

const sectionBackgroundClassNames: Record<ContactCtaSectionStyle["background"], string> = {
  default: "bg-background",
}

export function ContactCTA({ settings, content, layout, style }: ContactCTAProps) {
  const whatsappUrl = settings.whatsappUrl?.trim() || undefined
  const instagramUrl = settings.instagramUrl?.trim() || undefined
  const hasWhatsapp = Boolean(whatsappUrl && content.whatsappLabel)
  const hasInstagram = Boolean(instagramUrl && content.instagramLabel)

  return (
    <section id="contact" className={`relative py-24 ${sectionBackgroundClassNames[style.background]} grunge-texture overflow-hidden`} data-alignment={layout.alignment}>
      {style.divider === "glow" && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto">
          <p className="text-primary/40 tracking-[-1px] mb-4 text-sm" aria-hidden="true">{"///////////"}</p>
          {content.eyebrow && <span className="text-secondary tracking-[0.3em] text-sm uppercase font-serif">{content.eyebrow}</span>}
          {(content.title || content.highlightedTitle) && (
            <h2 className="text-5xl md:text-7xl font-sans tracking-wider mt-2 mb-6 fire-glow">
              {content.title} <span className="text-primary">{content.highlightedTitle}</span>
            </h2>
          )}
          {content.description && (
            <p className="text-muted-foreground font-serif italic text-lg mb-12">
              {content.description}
            </p>
          )}

          {(hasWhatsapp || hasInstagram) && (
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
              {hasWhatsapp && whatsappUrl && (
                <WhatsAppButton href={whatsappUrl} className="w-full md:w-auto">
                  {content.whatsappLabel}
                </WhatsAppButton>
              )}
              {hasInstagram && instagramUrl && (
                <InstagramButton href={instagramUrl} className="w-full md:w-auto">
                  {content.instagramLabel}
                </InstagramButton>
              )}
            </div>
          )}

          <div className="text-muted-foreground font-serif">
            {settings.studioAddress && <p className="text-lg">{settings.studioAddress}</p>}
            {settings.studioHours && (
              <p className="mt-2">
                {content.hoursLabel && <span className="text-foreground">{content.hoursLabel}</span>} {settings.studioHours}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
