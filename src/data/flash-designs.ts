export interface FlashDesign {
  id: number
  name: string
  price: string
  image: string
  status: "Available" | "Reserved" | "Claimed"
  style: string
  placement: string
  size: string
}

export const flashDesigns: FlashDesign[] = [
  {
    id: 1,
    name: "Skull & Roses",
    price: "$200",
    image: "/images/flash-1.png",
    status: "Available",
    style: "Traditional",
    placement: "Forearm, calf, shoulder",
    size: "Palm size",
  },
  {
    id: 2,
    name: "Anchor",
    price: "$150",
    image: "/images/flash-2.png",
    status: "Available",
    style: "Old School",
    placement: "Bicep, ankle, ribs",
    size: "3-4 inches",
  },
  {
    id: 3,
    name: "Swallow",
    price: "$120",
    image: "/images/flash-3.png",
    status: "Reserved",
    style: "American Traditional",
    placement: "Chest, wrist, collarbone",
    size: "2-3 inches",
  },
  {
    id: 4,
    name: "Panther Head",
    price: "$180",
    image: "/images/flash-4.png",
    status: "Available",
    style: "Traditional",
    placement: "Shoulder, thigh, forearm",
    size: "Medium",
  },
  {
    id: 5,
    name: "Snake Dagger",
    price: "$220",
    image: "/images/flash-5.png",
    status: "Claimed",
    style: "Neo-Traditional",
    placement: "Forearm, shin, outer arm",
    size: "Long narrow",
  },
  {
    id: 6,
    name: "Sacred Heart",
    price: "$160",
    image: "/images/flash-6.png",
    status: "Available",
    style: "Old School",
    placement: "Chest, upper arm, calf",
    size: "4-5 inches",
  },
]
