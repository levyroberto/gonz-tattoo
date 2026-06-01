"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

import { navLinks } from "@/data/site-content"


export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <>
      {/* ─── Header bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-5 h-16 border-b border-red-900/30 bg-[#0d0d0d]/90 backdrop-blur-sm">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span
              className="text-[#e8e0d0] text-xl tracking-[3px] leading-none"
            >
              GONZ
            </span>
            <span
              className="text-red-600 text-lg leading-none"
            >
              TATTOO
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#e8e0d0]/60 hover:text-[#e8e0d0] tracking-widest text-sm uppercase transition-all hover:tracking-[0.2em]"
            >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white text-sm tracking-[5px] uppercase transition-colors"
              style={{
                clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
              }}
            >
              CONSULTAR
            </Link>
          </nav>

          {/* Burger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col items-end gap-[5px] p-2 z-[200] relative"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            <motion.span
              animate={isOpen ? { rotate: -42, y: 7, width: 28, backgroundColor: "#cc0000" } : { rotate: 0, y: 0, width: 28 }}
              className="block h-[2px] bg-[#e8e0d0]"
              style={{ width: 28 }}
            />
            <motion.span
              animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block h-[2px] bg-red-600"
              style={{ width: 20 }}
            />
            <motion.span
              animate={isOpen ? { rotate: 42, y: -7, width: 28 } : { rotate: 0, y: 0, width: 28 }}
              className="block h-[2px] bg-[#e8e0d0]"
              style={{ width: 28 }}
            />
          </button>
        </div>
      </header>

      {/* ─── Full-screen grunge overlay ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="menu"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-40 bg-[#0d0d0d] md:hidden flex flex-col"
          >
            {/* Ambient red glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 200px 300px at 80% 60%, rgba(180,0,0,0.07) 0%, transparent 70%), radial-gradient(ellipse 150px 200px at 10% 80%, rgba(120,0,0,0.06) 0%, transparent 70%)",
              }}
            />

            {/* Diagonal slash accent */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: "52%",
                width: 2,
                background:
                  "linear-gradient(to bottom, transparent, rgba(180,0,0,0.5) 35%, rgba(180,0,0,0.25) 65%, transparent)",
                transform: "rotate(-8deg) scaleY(1.3)",
                transformOrigin: "center top",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full px-7 pt-20 pb-10">
              {/* Section label */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-red-600 text-[11px] tracking-[4px] mb-8"
              >
                {"// NAVEGACIÓN"}
              </motion.p>

              {/* Nav links */}
              <nav className="flex-1">
                <ul className="list-none m-0 p-0">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, ease: "easeOut" }}
                      className="border-b border-white/[0.04]"
                    >
                      <Link
                        href={link.href}
                        onClick={close}
                        className="group flex items-center justify-between py-[18px] relative overflow-hidden"
                      >
                        {/* hover fill */}
                        <span className="absolute inset-0 bg-red-900/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

                        <span
                          className="text-red-600 text-xs tracking-wide min-w-[28px] relative z-10"
            >
                          0{i + 1}
                        </span>

                        <span
                          className="font-sans flex-1 pl-2 text-[#e8e0d0] group-hover:text-white group-hover:tracking-[4px] transition-all duration-200 leading-none relative z-10"
                          style={{
                            fontSize: "clamp(28px, 9vw, 38px)",
                            letterSpacing: "2px",
                          }}
                        >
                          {link.label}
                        </span>

                        <span className="text-red-600/50 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-200 font-mono text-lg relative z-10">
                          →
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Slash decoration */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                className="text-red-900/40 tracking-[-2px] py-3"
                style={{ fontSize: 22 }}
              >
                {"///////////"}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
              >
                <Link
                  href="/contact"
                  onClick={close}
                  className="block w-full py-4 bg-red-700 hover:bg-red-600 text-white text-center text-xl tracking-[6px] uppercase transition-colors"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  CONSULTAR
                </Link>
              </motion.div>

              {/* Footer tag */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.56 }}
                className="flex items-center gap-2 mt-5"
              >
                <span className="w-1 h-1 rounded-full bg-red-600" />
                <span
                  className="text-[#e8e0d0]/30 text-[10px] tracking-[2px] uppercase"
            >
                  · Pro Team · @octopustattoocoloursink ·
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
