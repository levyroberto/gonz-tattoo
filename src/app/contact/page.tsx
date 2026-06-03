import type { Metadata } from "next"

import { ContactPageContent } from "@/components/contact/contact-page-content"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getGlobalFooterSection, getPageSection, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Contacto | GONZ TATTOO",
  description: "Consultá por tu tatuaje. Mandá tu idea, ubicación, tamaño y referencias directo al artista.",
}

export default async function ContactPage() {
  const [settings, footer, section] = await Promise.all([getSiteSettings(), getGlobalFooterSection(), getPageSection("contact")])

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      {section.type === "contactPage" && (
        <ContactPageContent settings={settings} content={section.content} layout={section.layout} style={section.style} />
      )}
      <SiteFooter footer={footer} settings={settings} />
    </main>
  )
}
