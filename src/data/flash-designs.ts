export interface FlashDesign {
  id: number
  name: string
  price: string
  image: string
}

export const flashDesigns: FlashDesign[] = [
  { id: 1, name: "Skull & Roses", price: "$200", image: "/images/flash-1.png" },
  { id: 2, name: "Anchor", price: "$150", image: "/images/flash-2.png" },
  { id: 3, name: "Swallow", price: "$120", image: "/images/flash-3.png" },
  { id: 4, name: "Panther Head", price: "$180", image: "/images/flash-4.png" },
  { id: 5, name: "Snake Dagger", price: "$220", image: "/images/flash-5.png" },
  { id: 6, name: "Sacred Heart", price: "$160", image: "/images/flash-6.png" },
]
