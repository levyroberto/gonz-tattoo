import { HomeSectionRenderer } from "@/components/home/home-section-renderer"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getAboutImage, getFlashDesigns, getGlobalFooterSection, getHomeSections, getPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [portfolioItems, flashDesigns, settings, sections, footer, aboutImage] = await Promise.all([
    getPortfolioItems(),
    getFlashDesigns(),
    getSiteSettings(),
    getHomeSections(),
    getGlobalFooterSection(),
    getAboutImage(),
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
          aboutImage={aboutImage}
        />
      ))}
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
