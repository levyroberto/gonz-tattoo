"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getSectionDefinition, getSectionImageField, parseSectionContentFromForm, parseSectionLayoutFromForm } from "@/data/home-section-schema"
import { createSupabaseAuthServerClient } from "@/lib/supabase/server"
import { resolveImageUrl } from "@/lib/supabase/storage"

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getHomeSectionContentFromForm(formData: FormData) {
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!definition) return null

  return parseSectionContentFromForm(formData, definition)
}

function getHomeSectionLayoutFromForm(formData: FormData) {
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!definition) return null

  return parseSectionLayoutFromForm(formData, definition)
}

async function getNextHomeSectionDisplayOrder() {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) return 10

  const { data } = await supabase
    .from("site_sections")
    .select("display_order")
    .eq("page_key", "home")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(data?.display_order ?? 0) + 10
}

export async function updateHomeSectionEnabled(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionKey = String(formData.get("section_key") ?? "")

  if (!supabase || !sectionKey) {
    return { ok: false, error: "home-section-toggle" }
  }

  const { error } = await supabase
    .from("site_sections")
    .update({ enabled: formData.get("enabled") === "on", updated_at: new Date().toISOString() })
    .eq("page_key", "home")
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section visibility update failed:", error.message)
    return { ok: false, error: `home-section-toggle: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function reorderHomeSections(sectionKeys: string[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "home-section-reorder" }
  }

  const updates = await Promise.all(
    sectionKeys.map((sectionKey, index) =>
      supabase
        .from("site_sections")
        .update({ display_order: (index + 1) * 10, updated_at: new Date().toISOString() })
        .eq("page_key", "home")
        .eq("section_key", sectionKey)
    )
  )
  const error = updates.find((result) => result.error)?.error

  if (error) {
    console.error("Home section reorder failed:", error.message)
    return { ok: false, error: `home-section-reorder: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function createHomeSection(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!supabase || !definition || !definition.creatable) {
    return { ok: false, error: "home-section-create" }
  }

  const title = getRequiredString(formData, "title")
  const titleFieldKey = definition.titleFields[0]
  const defaults = {
    ...definition.defaults,
    content: {
      ...definition.defaults.content,
      ...(titleFieldKey && title ? { [titleFieldKey]: title } : {}),
    },
  }

  const displayOrder = await getNextHomeSectionDisplayOrder()
  const sectionKey = `home-${sectionType}-${randomUUID()}`

  const { error } = await supabase.from("site_sections").insert({
    page_key: "home",
    section_key: sectionKey,
    type: sectionType,
    enabled: false,
    display_order: displayOrder,
    content: defaults.content,
    layout: defaults.layout,
    style: defaults.style,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Home section create failed:", error.message)
    return { ok: false, error: `home-section-create: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return {
    ok: true,
    item: { id: sectionKey, type: sectionType, enabled: false, order: displayOrder, ...defaults },
  }
}

export async function deleteHomeSection(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionKey = String(formData.get("section_key") ?? "")

  if (!supabase || !sectionKey) {
    return { ok: false, error: "home-section-delete" }
  }

  const { error } = await supabase
    .from("site_sections")
    .delete()
    .eq("page_key", "home")
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section delete failed:", error.message)
    return { ok: false, error: `home-section-delete: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function updateHomeSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const pageKey = String(formData.get("page_key") ?? "home").trim() || "home"
  const sectionKey = String(formData.get("section_key") ?? "")
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)
  const content = getHomeSectionContentFromForm(formData)
  const layout = getHomeSectionLayoutFromForm(formData)

  if (!supabase || !sectionKey || !definition || !content || !layout) {
    return { ok: false, error: "home-section-content" }
  }

  const imageField = getSectionImageField(definition)
  let stylePayload: Record<string, unknown> | null = null

  if (imageField) {
    const image = await resolveImageUrl(supabase, formData, imageField.imageFolder ?? "hero")

    if (!image.ok) {
      return { ok: false, error: image.error }
    }

    if (!image.imageUrl && imageField.required !== false) {
      return { ok: false, error: "home-section-content: falta imagen de fondo" }
    }

    stylePayload = { ...definition.defaults.style, [imageField.key]: image.imageUrl }
  }

  const { error } = await supabase
    .from("site_sections")
    .update({
      content,
      layout,
      ...(stylePayload ? { style: stylePayload } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section content update failed:", error.message)
    return { ok: false, error: `home-section-content: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return {
    ok: true,
    item: { sectionKey, content, layout, ...(stylePayload ? { style: stylePayload } : {}) },
  }
}

export async function updateFooterSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "footer-section-content" }
  }

  const content = {
    tagline: getRequiredString(formData, "tagline"),
    legalText: getRequiredString(formData, "legal_text"),
  }

  const { error } = await supabase
    .from("site_sections")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("page_key", "global")
    .eq("section_key", "site-footer")

  if (error) {
    console.error("Footer section content update failed:", error.message)
    return { ok: false, error: `footer-section-content: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/trabajos")
  revalidatePath("/disenos")
  revalidatePath("/contact")
  revalidatePath("/admin")

  return { ok: true, item: { content } }
}

export async function updatePageSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const pageKey = getRequiredString(formData, "page_key")
  const sectionKey = getRequiredString(formData, "section_key")
  const sectionType = getRequiredString(formData, "type")
  const definition = getSectionDefinition(sectionType)

  if (!pageKey || !sectionKey || !definition) {
    return { ok: false, error: "page-section-content" }
  }

  const content = parseSectionContentFromForm(formData, definition)
  const layout = parseSectionLayoutFromForm(formData, definition)

  const imageField = getSectionImageField(definition)
  let stylePayload: Record<string, unknown> = { ...definition.defaults.style }

  if (imageField) {
    const image = await resolveImageUrl(supabase, formData, imageField.imageFolder ?? "portfolio")

    if (!image.ok) {
      return { ok: false, error: image.error }
    }

    stylePayload = { ...stylePayload, [imageField.key]: image.imageUrl }
  }

  const { error } = await supabase
    .from("site_sections")
    .upsert(
      {
        page_key: pageKey,
        section_key: sectionKey,
        type: sectionType,
        enabled: true,
        display_order: 10,
        content,
        layout,
        style: stylePayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key,section_key" }
    )

  if (error) {
    console.error("Page section content update failed:", error.message)
    return { ok: false, error: `page-section-content: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath(`/${pageKey}`)
  revalidatePath("/admin")
  revalidatePath("/admin/pantallas")

  return { ok: true, item: { pageKey, sectionKey, content, layout, style: stylePayload } }
}
