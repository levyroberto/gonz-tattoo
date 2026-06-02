import { Suspense } from "react"

import { FlashGallery } from "@/components/flash/flash-gallery"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getFlashDesigns, getGlobalFooterSection, getPageSection, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function DesignsPage() {
  const [designs, settings, footer, section] = await Promise.all([
    getFlashDesigns(),
    getSiteSettings(),
    getGlobalFooterSection(),
    getPageSection("flash"),
  ])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <Suspense fallback={null}>
        {section.type === "flashPage" && (
          <FlashGallery designs={designs} whatsappUrl={settings.whatsappUrl} content={section.content} layout={section.layout} style={section.style} />
        )}
      </Suspense>
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
