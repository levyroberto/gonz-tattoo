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
