'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = 'theme-preference'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch (e) {
    // localStorage not available
  }
  
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const initial = getInitialTheme()
    setThemeState(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
    setMounted(true)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_KEY, newTheme)
    } catch (e) {
      // localStorage not available
    }
    
    // Update classes
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}