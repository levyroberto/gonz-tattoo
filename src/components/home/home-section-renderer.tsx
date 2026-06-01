import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"
import type { SiteSettings } from "@/lib/supabase/content"

import { AboutSection } from "./about-section"
import { ContactCTA } from "./contact-cta"
import { FeaturedTattoos } from "./featured-tattoos"
import { FlashDesignsPreview } from "./flash-designs-preview"
import { HeroSection } from "./hero-section"

type HomeSectionRendererProps = {
  section: HomeSection
  featuredTattoos: Tattoo[]
  featuredFlashDesigns: FlashDesign[]
  settings: SiteSettings
}

export function HomeSectionRenderer({
  section,
  featuredTattoos,
  featuredFlashDesigns,
  settings,
}: HomeSectionRendererProps) {
  switch (section.type) {
    case "hero":
      return <HeroSection />
    case "featuredPortfolio":
      return <FeaturedTattoos tattoos={featuredTattoos} />
    case "flashPreview":
      return <FlashDesignsPreview designs={featuredFlashDesigns} />
    case "about":
      return <AboutSection settings={settings} />
    case "contactCta":
      return <ContactCTA settings={settings} />
    default:
      return null
  }
}
