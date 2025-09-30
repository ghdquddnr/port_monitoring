'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, getTheme, setTheme as setThemeUtil } from '@/app/lib/theme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const initialTheme = getTheme()
    setThemeState(initialTheme)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setThemeUtil(newTheme)
  }

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}