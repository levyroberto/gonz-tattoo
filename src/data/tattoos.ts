export interface Tattoo {
  id: number
  title: string
  style: string
  image: string
}

export const featuredWorks: Tattoo[] = [
  { id: 1, title: "Reaper's Call", style: "Traditional", image: "/images/tattoo-1.png" },
  { id: 2, title: "Serpent Rose", style: "Neo-Traditional", image: "/images/tattoo-2.png" },
  { id: 3, title: "Iron Eagle", style: "American Traditional", image: "/images/tattoo-3.png" },
  { id: 4, title: "Dagger Heart", style: "Old School", image: "/images/tattoo-4.png" },
]
