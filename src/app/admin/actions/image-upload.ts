"use server"

// Movido a @/lib/supabase/storage — re-exportado para compatibilidad.
export { IMAGE_BUCKET, MAX_IMAGE_SIZE, resolveImageUrl } from "@/lib/supabase/storage"
export type { ImageFolder, ImageUploadResult } from "@/lib/supabase/storage"
