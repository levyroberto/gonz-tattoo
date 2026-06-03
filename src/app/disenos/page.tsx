import type { Metadata } from "next"
import { Suspense } from "react"

import { FlashGallery } from "@/components/flash/flash-gallery"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getGlobalFooterSection, getPageSection, getSaleableArtworks, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Diseños | GONZ TATTOO",
  description: "Diseños flash disponibles para elegir, ubicar y tatuar. Tradicionales, listos para reservar.",
}

export default async function DesignsPage() {
  const [designs, settings, footer, section] = await Promise.all([
    getSaleableArtworks(),
    getSiteSettings(),
    getGlobalFooterSection(),
    getPageSection("flash"),
  ])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <Suspense fallback={null}>
        {section.type === "flashPage" && (
          <FlashGallery content={section.content} designs={designs} layout={section.layout} style={section.style} whatsappUrl={settings.whatsappUrl} />
        )}
      </Suspense>
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
