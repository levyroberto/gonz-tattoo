/**
 * OutlineButton — borde rojo, hover relleno.
 * Uso: CTAs de sección, acciones de galería ("Ver todos").
 */

import Link from "next/link"
import type { ReactNode } from "react"

const CLIP_PATH = "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)"

type Size = "sm" | "md" | "lg"

const sizeClasses: Record<Size, string> = {
  sm: "px-6 py-2 text-xs tracking-[4px]",
  md: "px-8 py-3 text-sm tracking-[5px]",
  lg: "px-8 py-4 text-lg tracking-widest",
}

const BASE =
  "inline-block font-sans uppercase transition-all duration-300 border border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_oklch(0.45_0.18_25/0.3)]"

type OutlineButtonProps = {
  children: ReactNode
  size?: Size
  className?: string
  preview?: boolean
  href?: string
  onClick?: () => void
}

export function OutlineButton({ children, size = "md", className = "", preview = false, href, onClick }: OutlineButtonProps) {
  const classes = [BASE, sizeClasses[size], preview ? "inline-flex w-full items-center justify-center" : "inline-block", className]
    .filter(Boolean)
    .join(" ")

  if (preview) {
    return (
      <span className={classes} style={{ clipPath: CLIP_PATH }}>
        {children}
      </span>
    )
  }

  if (href) {
    return (
      <Link href={href} className={classes} style={{ clipPath: CLIP_PATH }}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} style={{ clipPath: CLIP_PATH }}>
      {children}
    </button>
  )
}
