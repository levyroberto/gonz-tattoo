import type { ButtonPreviewVariant } from "@/data/home-section-schema"
import {
  GoldButton,
  InstagramButton,
  OutlineButton,
  PrimaryButton,
  WhatsAppButton,
} from "@/components/ui/buttons"

const inputClassName =
  "min-w-0 flex-1 bg-transparent text-inherit uppercase tracking-widest text-center outline-none placeholder:normal-case placeholder:tracking-normal placeholder:opacity-50"

type ButtonPreviewFieldProps = {
  defaultValue: string
  label: string
  name: string
  required?: boolean
  variant: ButtonPreviewVariant
}

function PreviewInput({
  defaultValue,
  name,
  required = true,
}: {
  defaultValue: string
  name: string
  required?: boolean
}) {
  return (
    <input
      className={inputClassName}
      name={name}
      defaultValue={defaultValue}
      required={required}
      placeholder="Texto del botón"
    />
  )
}

export function ButtonPreviewField({
  defaultValue,
  label,
  name,
  required = true,
  variant,
}: ButtonPreviewFieldProps) {
  const input = <PreviewInput name={name} defaultValue={defaultValue} required={required} />

  let previewButton: React.ReactNode

  switch (variant) {
    case "primaryFilled":
      previewButton = (
        <PrimaryButton preview size="lg" className="w-full">
          {input}
        </PrimaryButton>
      )
      break
    case "secondaryOutline":
      previewButton = (
        <GoldButton preview size="lg" className="w-full">
          {input}
        </GoldButton>
      )
      break
    case "primaryOutline":
      previewButton = (
        <OutlineButton preview size="md" className="w-full">
          {input}
        </OutlineButton>
      )
      break
    case "whatsapp":
      previewButton = (
        <WhatsAppButton preview className="w-full">
          {input}
        </WhatsAppButton>
      )
      break
    case "instagram":
      previewButton = (
        <InstagramButton preview className="w-full">
          {input}
        </InstagramButton>
      )
      break
  }

  return (
    <label className="grid gap-1 text-sm text-muted-foreground">
      <span className="flex flex-wrap items-center gap-2">
        {label} - vista previa
        <span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Preview
        </span>
      </span>
      {previewButton}
    </label>
  )
}
