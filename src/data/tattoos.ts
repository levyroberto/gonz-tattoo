export interface Tattoo {
  id: number
  title: string
  style: string
  image: string
  description?: string
}

export const featuredWorks: Tattoo[] = [
  {
    id: 1,
    title: "Reaper's Call",
    style: "Traditional",
    image: "/images/tattoo-1.png",
    description: "Bold blackwork, heavy shading, and classic old-school menace.",
  },
  {
    id: 2,
    title: "Serpent Rose",
    style: "Neo-Traditional",
    image: "/images/tattoo-2.png",
    description: "A sharp rose-and-serpent piece with saturated color and strong lines.",
  },
  {
    id: 3,
    title: "Iron Eagle",
    style: "American Traditional",
    image: "/images/tattoo-3.png",
    description: "A timeless eagle composition built around clean reads and solid contrast.",
  },
  {
    id: 4,
    title: "Dagger Heart",
    style: "Old School",
    image: "/images/tattoo-4.png",
    description: "Classic dagger-and-heart imagery with a punchy traditional palette.",
  },
]
