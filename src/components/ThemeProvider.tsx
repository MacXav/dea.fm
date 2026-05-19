'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeSettings = {
  font: string
  accentColor: string
  backgroundColor: string
  cardColor: string
  textColor: string
  radius: string
}

const defaultTheme: ThemeSettings = {
  font: 'font-sans',
  accentColor: '#a855f7',
  backgroundColor: '#111827',
  cardColor: 'rgba(255, 255, 255, 0.08)',
  textColor: '#ffffff',
  radius: '1rem',
}

type ThemeContextType = {
  theme: ThemeSettings
  updateTheme: (updates: Partial<ThemeSettings>) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('dea-fm-theme')

    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme({
          ...defaultTheme,
          ...parsedTheme,
        })
      } catch (error) {
        console.error('Could not parse saved theme:', error)
      }
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    root.style.setProperty('--site-accent', theme.accentColor)
    root.style.setProperty('--site-bg', theme.backgroundColor)
    root.style.setProperty('--site-card', theme.cardColor)
    root.style.setProperty('--site-text', theme.textColor)
    root.style.setProperty('--site-radius', theme.radius)

    localStorage.setItem('dea-fm-theme', JSON.stringify(theme))
  }, [theme, mounted])

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((currentTheme) => ({
      ...currentTheme,
      ...updates,
    }))
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
    localStorage.removeItem('dea-fm-theme')
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      <div className={theme.font}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useThemeSettings() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeSettings must be used inside ThemeProvider')
  }

  return context
}