import { Suspense } from "react"

import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function TrabajosPage() {
  const [tattoos, settings] = await Promise.all([getPortfolioItems(), getSiteSettings()])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <Suspense fallback={null}>
        <PortfolioGallery tattoos={tattoos} />
      </Suspense>
      <SiteFooter settings={settings} />
    </main>
  )
}
