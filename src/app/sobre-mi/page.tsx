import { AboutSection } from "@/components/home/about-section"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function SobreMiPage() {
  const settings = await getSiteSettings()

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <AboutSection settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  )
}
