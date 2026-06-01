"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

const HERO_VISIT_COUNT_KEY = "gonz-hero-visit-count"

export function HeroSection() {
  const [mobileImagePosition, setMobileImagePosition] = useState<"left" | "right">("left")

  useEffect(() => {
    let frame = 0
    const currentVisitCount = Number(window.localStorage.getItem(HERO_VISIT_COUNT_KEY) ?? "0")
    const nextVisitCount = currentVisitCount + 1
    const shouldShowRightSide = Math.floor((nextVisitCount - 1) / 3) % 2 === 1

    window.localStorage.setItem(HERO_VISIT_COUNT_KEY, String(nextVisitCount))
    frame = window.requestAnimationFrame(() => {
      setMobileImagePosition(shouldShowRightSide ? "right" : "left")
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grunge-texture">
      <Image
        src="/images/hero/hero-card.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover md:object-center ${
          mobileImagePosition === "right" ? "object-right" : "object-left"
        }`}
      />
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <span className="inline-block px-4 py-1 text-sm tracking-[0.3em] text-secondary border border-secondary/50 uppercase font-serif">
            Desde 1993 • Almagro
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-7xl md:text-9xl lg:text-[12rem] font-sans tracking-wider leading-none mb-4 fire-glow">
          <span className="text-foreground">GONZ</span>
          <span className="text-primary"> TATTOO</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl md:text-2xl text-muted-foreground font-serif italic max-w-2xl mx-auto mb-12">
        ◾Pro Team support @octopustattoocoloursink
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/trabajos" className="group relative px-8 py-4 bg-primary text-primary-foreground font-sans text-xl tracking-widest uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_oklch(0.55_0.16_50/0.4),0_0_40px_oklch(0.45_0.18_25/0.2)]">
            <span className="relative z-10">Ver mis trabajos</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <a href="/disenos" className="px-8 py-4 border-2 border-secondary text-secondary font-sans text-xl tracking-widest uppercase transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_oklch(0.55_0.12_85/0.3)]">
            Diseños
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
