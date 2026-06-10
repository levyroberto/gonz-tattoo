"use client"

import { motion } from "framer-motion"
import Link from "next/link"

import type { FooterSection } from "@/data/global-sections"
import { navLinks } from "@/data/site-content"
import type { SiteSettings } from "@/lib/supabase/content"

type SiteFooterProps = {
  footer: FooterSection
  settings: SiteSettings
}

export function SiteFooter({ footer, settings }: SiteFooterProps) {
  const brandName = settings.brandName ?? ""
  const copyrightText = [brandName, footer.content.legalText].filter(Boolean).join(". ")

  if (!footer.enabled) {
    return null
  }

  return (
    <footer className="relative py-16 paper-texture border-t border-border overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.45 0.18 25 / 0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center gap-8">

        {/* Ornamento horizontal superior */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center gap-0 w-full max-w-sm"
          aria-hidden="true"
        >
          <span className="flex-1 h-px bg-border" />
          <span className="flex-1 h-px bg-border" />
          <span className="size-2 rotate-45 bg-primary/60 shrink-0 mx-3" />
          <span className="flex-1 h-px bg-border" />
          <span className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-sans text-5xl md:text-6xl tracking-[6px] text-foreground leading-none">
            {brandName}
          </span>
          {footer.content.tagline && (
            <span className="font-serif italic text-muted-foreground text-sm tracking-wide mt-2">
              {footer.content.tagline}
            </span>
          )}
        </motion.div>

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="text-muted-foreground hover:text-foreground font-sans tracking-[3px] text-xs uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </motion.nav>

        {/* Redes sociales */}
        {(settings.instagramUrl || settings.whatsappUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-3"
          >
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
          </motion.div>
        )}

        {/* Ornamento inferior + copyright */}
        {copyrightText && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="flex items-center gap-3 w-full max-w-xs" aria-hidden="true">
              <span className="flex-1 h-px bg-border/50" />
              <span className="text-primary/30 tracking-[-1px] text-xs">{"/////////"}</span>
              <span className="flex-1 h-px bg-border/50" />
            </div>
            <p className="text-muted-foreground/50 text-xs font-serif tracking-wide">
              &copy; {new Date().getFullYear()} {copyrightText}
            </p>
          </motion.div>
        )}

      </div>
    </footer>
  )
}
