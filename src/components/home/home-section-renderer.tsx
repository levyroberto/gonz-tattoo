import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"
import { filterFlashDesigns, filterPortfolioItems } from "@/lib/home-section-filters"
import type { SiteSettings } from "@/lib/supabase/content"

import { AboutSection } from "./about-section"
import { ContactCTA } from "./contact-cta"
import { FeaturedTattoos } from "./featured-tattoos"
import { FlashDesignsPreview } from "./flash-designs-preview"
import { HeroSection } from "./hero-section"

type HomeSectionRendererProps = {
  section: HomeSection
  flashDesigns: FlashDesign[]
  portfolioItems: Tattoo[]
  settings: SiteSettings
}

export function HomeSectionRenderer({
  section,
  flashDesigns,
  portfolioItems,
  settings,
}: HomeSectionRendererProps) {
  switch (section.type) {
    case "hero":
      return <HeroSection content={section.content} layout={section.layout} style={section.style} />
    case "featuredPortfolio":
      return <FeaturedTattoos tattoos={filterPortfolioItems(portfolioItems, section)} content={section.content} layout={section.layout} style={section.style} />
    case "flashPreview":
      return <FlashDesignsPreview designs={filterFlashDesigns(flashDesigns, section)} content={section.content} layout={section.layout} style={section.style} />
    case "about":
      return <AboutSection settings={settings} content={section.content} layout={section.layout} style={section.style} />
    case "contactCta":
      return <ContactCTA settings={settings} content={section.content} layout={section.layout} style={section.style} />
    default:
      return null
  }
}
