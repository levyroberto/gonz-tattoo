"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

import type { HeroSectionContent, HeroSectionLayout, HeroSectionStyle } from "@/data/home-sections"
import { normalizeInternalLink } from "@/lib/internal-links"
import { PrimaryButton, GoldButton } from "@/components/ui/buttons"

const HERO_VISIT_COUNT_KEY = "gonz-hero-visit-count"

type HeroSectionProps = {
  content: HeroSectionContent
  layout: HeroSectionLayout
  style: HeroSectionStyle
}

export function HeroSection({ content, layout, style }: HeroSectionProps) {
  const [mobileImagePosition, setMobileImagePosition] = useState<"left" | "right">("left")
  const hasPrimaryButton = Boolean(content.primaryButtonHref && content.primaryButtonLabel)
  const hasSecondaryButton = Boolean(content.secondaryButtonHref && content.secondaryButtonLabel)

  useEffect(() => {
    if (layout.imagePositionMode !== "rotating-mobile") {
      return
    }

    let frame = 0
    const currentVisitCount = Number(window.localStorage.getItem(HERO_VISIT_COUNT_KEY) ?? "0")
    const nextVisitCount = currentVisitCount + 1
    const shouldShowRightSide = Math.floor((nextVisitCount - 1) / 3) % 2 === 1

    window.localStorage.setItem(HERO_VISIT_COUNT_KEY, String(nextVisitCount))
    frame = window.requestAnimationFrame(() => {
      setMobileImagePosition(shouldShowRightSide ? "right" : "left")
    })

    return () => window.cancelAnimationFrame(frame)
  }, [layout.imagePositionMode])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grunge-texture">
      {/* SVG filter: rough edges para la capa metal */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="metal-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.055" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {style.backgroundImage && (
        <Image
          src={style.backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover md:object-center ${
            mobileImagePosition === "right" ? "object-right" : "object-left"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-background/70 worn-edges" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background/80" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-primary/30" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-primary/30" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-primary/30" />
      </div>


      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,oklch(0.03_0.01_0/0.95)_0%,oklch(0.04_0.01_0/0.82)_42%,transparent_72%)] md:hidden" />

        {content.eyebrow && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 mb-6">
            <span className="inline-block px-4 py-1 text-sm tracking-[0.3em] text-secondary border border-secondary/50 uppercase font-serif">
              {content.eyebrow}
            </span>
          </motion.div>
        )}

        {(content.brandPrimary || content.brandAccent) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative isolate z-0 inline-block mb-4"
          >
            {/* Capa metal: siempre al fondo, detrás de todo el texto del hero */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 flex select-none items-center justify-center text-7xl md:text-9xl lg:text-[12rem]"
              style={{
                fontFamily: "var(--font-metal)",
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: "oklch(0.19 0.20 19)",
                whiteSpace: "nowrap",
                transform: "scaleX(0.40) scaleY(0.70)",
              }}
            >
              {[content.brandPrimary, content.brandAccent].filter(Boolean).join(" ")}
            </span>

            {/* Título principal: Bebas Neue encima */}
            <h1 className="relative z-10 text-7xl md:text-9xl lg:text-[12rem] font-sans tracking-wider leading-none fire-glow">
              <span className="text-foreground">{content.brandPrimary}</span>
              <span className="text-primary">{content.brandAccent}</span>
            </h1>
          </motion.div>
        )}

        {/* Ornamento de banda */}
        {(content.brandPrimary || content.brandAccent) && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="relative z-10 flex items-center justify-center gap-2 mb-6"
            aria-hidden="true"
          >
            <span className="h-px w-16 md:w-24 bg-primary/50" />
            <span className="size-1.5 rotate-45 bg-primary/70" />
            <span className="h-px w-6 bg-primary/40" />
            <span className="size-2.5 rotate-45 border border-primary/60" />
            <span className="h-px w-6 bg-primary/40" />
            <span className="size-1.5 rotate-45 bg-primary/70" />
            <span className="h-px w-16 md:w-24 bg-primary/50" />
          </motion.div>
        )}

        {content.description && (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="relative z-10 text-xl md:text-2xl text-muted-foreground font-serif italic max-w-2xl mx-auto mb-12">
            {content.description}
          </motion.p>
        )}

        {(hasPrimaryButton || hasSecondaryButton) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasPrimaryButton && (
              <PrimaryButton href={normalizeInternalLink(content.primaryButtonHref)} size="lg">
                {content.primaryButtonLabel}
              </PrimaryButton>
            )}
            {hasSecondaryButton && (
              <GoldButton href={normalizeInternalLink(content.secondaryButtonHref)} size="lg">
                {content.secondaryButtonLabel}
              </GoldButton>
            )}
          </motion.div>
        )}

      </div>
    </section>
  )
}
