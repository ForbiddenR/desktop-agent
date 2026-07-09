export {}

declare global {
  interface Window {
    desktop?: {
      isDesktop: true
      platform: NodeJS.Platform
      versions: {
        chrome?: string
        electron?: string
        node?: string
      }
      windowControls?: {
        minimize: () => void
        toggleMaximize: () => void
        close: () => void
      }
    }
  }
}
