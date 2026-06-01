type SectionBase<Type extends string, Content, Layout, Style> = {
  id: string
  type: Type
  enabled: boolean
  order: number
  content: Content
  layout: Layout
  style: Style
}

export type FooterSectionContent = {
  tagline: string
  legalText: string
}

export type FooterSectionLayout = {
  variant: "default"
}

export type FooterSectionStyle = {
  background: "card"
}

export type FooterSection = SectionBase<"footer", FooterSectionContent, FooterSectionLayout, FooterSectionStyle>

export const footerSectionFallback: FooterSection = {
  id: "site-footer",
  type: "footer",
  enabled: true,
  order: 10,
  content: {
    tagline: "",
    legalText: "",
  },
  layout: {
    variant: "default",
  },
  style: {
    background: "card",
  },
}
