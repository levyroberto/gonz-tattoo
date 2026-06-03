"use server"

import { randomUUID } from "node:crypto"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"

export const IMAGE_BUCKET = "site-images"
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024

export type ImageUploadResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string }

function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension
  }

  return file.type.split("/").pop() || "jpg"
}

export async function resolveImageUrl(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseAuthServerClient>>>,
  formData: FormData,
  folder: "flash" | "hero" | "portfolio"
): Promise<ImageUploadResult> {
  const imageFile = formData.get("image_file")
  const imageUrl = String(formData.get("image_url") ?? "").trim()

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { ok: true, imageUrl }
  }

  if (!imageFile.type.startsWith("image/")) {
    return { ok: false, error: "La imagen debe ser un archivo de imagen." }
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "La imagen no puede superar los 8 MB." }
  }

  const extension = getImageExtension(imageFile)
  const path = `${folder}/${randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, imageFile, {
    contentType: imageFile.type,
    upsert: false,
  })

  if (error) {
    console.error("Supabase image upload failed:", error.message)
    return { ok: false, error: `image-upload: ${error.message}` }
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)

  return { ok: true, imageUrl: data.publicUrl }
}
