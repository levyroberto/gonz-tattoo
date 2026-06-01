export interface FlashDesign {
  id: number
  name: string
  price: number
  image: string
  status: "Disponible" | "Reservado" | "Reclamado"
  style: string
  placement: string
  size: string
  displayOrder?: number
  isActive?: boolean
}
