type TattooStyleSelectProps = {
  className?: string
  defaultValue?: string
  styles?: string[]
  required?: boolean
}

function getStyleOptions(styles: string[] = [], defaultValue = "") {
  return Array.from(new Set([...styles, defaultValue].map((style) => style.trim()).filter(Boolean)))
}

export function TattooStyleSelect({ className, defaultValue = "", styles, required = false }: TattooStyleSelectProps) {
  const options = getStyleOptions(styles, defaultValue)

  return (
    <select className={className} name="style" defaultValue={defaultValue} required={required}>
      {!defaultValue && (
        <option value="" disabled>
          {options.length > 0 ? "Estilo" : "Cargá estilos en Supabase"}
        </option>
      )}
      {options.map((style) => (
        <option key={style} value={style}>
          {style}
        </option>
      ))}
    </select>
  )
}
