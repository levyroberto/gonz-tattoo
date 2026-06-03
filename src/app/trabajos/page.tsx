import type { Metadata } from "next"
import { Suspense } from "react"

import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getGlobalFooterSection, getPageSection, getPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Trabajos | GONZ TATTOO",
  description: "Galería de tatuajes realizados. Old school, tradicional y diseños con línea, contraste y presencia.",
}

export default async function TrabajosPage() {
  const [tattoos, settings, footer, section] = await Promise.all([
    getPortfolioItems(),
    getSiteSettings(),
    getGlobalFooterSection(),
    getPageSection("portfolio"),
  ])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <Suspense fallback={null}>
        {section.type === "portfolioPage" && (
          <PortfolioGallery tattoos={tattoos} content={section.content} layout={section.layout} style={section.style} />
        )}
      </Suspense>
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
