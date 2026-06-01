import { HomeSectionRenderer } from "@/components/home/home-section-renderer"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getFlashDesigns, getGlobalFooterSection, getHomeSections, getPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [portfolioItems, flashDesigns, settings, sections, footer] = await Promise.all([
    getPortfolioItems(),
    getFlashDesigns(),
    getSiteSettings(),
    getHomeSections(),
    getGlobalFooterSection(),
  ])

  return (
    <main className="min-h-screen">
      <SiteHeader />
      {sections.map((section) => (
        <HomeSectionRenderer
          key={section.id}
          section={section}
          portfolioItems={portfolioItems}
          flashDesigns={flashDesigns}
          settings={settings}
        />
      ))}
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
