import DemoOne from "@/components/ui/demo"

type LandingPageProps = {
  isLight: boolean
  onToggleTheme: () => void
  onEnter: () => void
}

export default function LandingPage({ isLight, onToggleTheme, onEnter }: LandingPageProps) {
  return (
    <DemoOne
      brandName="TDesign.ai"
      isLight={isLight}
      onToggleTheme={onToggleTheme}
      onEnter={onEnter}
      onLogin={onEnter}
    />
  )
}
