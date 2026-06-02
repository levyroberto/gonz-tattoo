import { ContactPageContent } from "@/components/contact/contact-page-content"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getGlobalFooterSection, getPageSection, getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

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
