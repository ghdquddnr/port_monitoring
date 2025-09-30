export type Theme = 'light' | 'dark'

/**
 * Get the current theme from localStorage
 * Falls back to system preference if no theme is saved
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = localStorage.getItem('theme') as Theme | null

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

/**
 * Set the theme in localStorage and apply to document
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem('theme', theme)
  applyTheme(theme)
}

/**
 * Apply theme class to document element
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return
  }

  const root = window.document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
  const currentTheme = getTheme()
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
  return newTheme
}

/**
 * Initialize theme on page load
 * Should be called in root layout or _app
 */
export function initializeTheme(): void {
  const theme = getTheme()
  applyTheme(theme)
}