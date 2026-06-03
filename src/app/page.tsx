import { HomeSectionRenderer } from "@/components/home/home-section-renderer"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getFlashDesigns, getGlobalFooterSection, getHomeSections, getPageSection, getPortfolioItems, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [portfolioItems, flashDesigns, settings, sections, footer, contactSection] = await Promise.all([
    getPortfolioItems(),
    getFlashDesigns(),
    getSiteSettings(),
    getHomeSections(),
    getGlobalFooterSection(),
    getPageSection("contact"),
  ])

  const aboutImage = contactSection.type === "contactPage" ? contactSection.style.image : ""

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
