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
    }
  }
}
