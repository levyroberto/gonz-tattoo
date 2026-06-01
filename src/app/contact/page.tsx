import { ContactPageContent } from "@/components/contact/contact-page-content"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { getSiteSettings } from "@/lib/supabase/content"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <main className="min-h-screen bg-background pt-16 md:pt-20">
      <SiteHeader />
      <ContactPageContent settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  )
}
