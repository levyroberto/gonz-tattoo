import { AboutSection } from "@/components/home/about-section"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { aboutSectionDefaults } from "@/data/home-sections"
import { getGlobalFooterSection, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function SobreMiPage() {
  const [settings, footer] = await Promise.all([getSiteSettings(), getGlobalFooterSection()])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <AboutSection settings={settings} {...aboutSectionDefaults} />
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
