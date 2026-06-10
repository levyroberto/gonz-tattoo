export interface FlashDesign {
  id: number
  name: string
  price: number
  image: string
  status: "Disponible" | "Reservado" | "Reclamado"
  style: string
  size: string
  displayOrder?: number
  isActive?: boolean
  tags?: string[]
}

/** Clases CSS del badge de estado, compartidas por FlashCard y FlashDesignCard. */
export const flashStatusBadgeStyles: Record<FlashDesign["status"], string> = {
  Disponible: "border-primary bg-primary text-primary-foreground",
  Reservado: "border-secondary/60 bg-background/80 text-secondary",
  Reclamado: "border-muted-foreground/50 bg-background/80 text-muted-foreground",
}
