export type ArtworkType = "tattoo" | "flash" | "sculpture" | "painting"

export type ArtworkStatus = "Disponible" | "Reservado" | "Reclamado"

export interface BaseArtwork {
  id: number
  type: ArtworkType
  title: string
  image: string
  tags: string[]
  isActive?: boolean
  displayOrder?: number
}

export interface TattooArtwork extends BaseArtwork {
  type: "tattoo"
  style?: string
  description?: string
  publishedDate?: string
  isFeatured?: boolean
}

export interface SaleableArtwork extends BaseArtwork {
  type: "flash" | "sculpture" | "painting"
  price: number
  status: ArtworkStatus
  style?: string
  dimensions?: string
  material?: string
}

export type Artwork = TattooArtwork | SaleableArtwork

export const artworkStatusBadgeStyles: Record<ArtworkStatus, string> = {
  Disponible: "border-primary bg-primary text-primary-foreground",
  Reservado: "border-secondary/60 bg-background/80 text-secondary",
  Reclamado: "border-muted-foreground/50 bg-background/80 text-muted-foreground",
}

export const ARTWORK_TYPE_LABELS: Record<ArtworkType, string> = {
  tattoo: "Tatuaje",
  flash: "Diseño flash",
  sculpture: "Escultura",
  painting: "Cuadro",
}
