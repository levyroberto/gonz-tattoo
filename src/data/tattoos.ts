export interface Tattoo {
  id: number
  title: string
  style: string
  image: string
  description?: string
  displayOrder?: number
  isActive?: boolean
  isFeatured?: boolean
}
