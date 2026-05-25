'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'default' | 'dark'

const HeaderThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  hidden: boolean
  setHidden: (v: boolean) => void
}>({ theme: 'default', setTheme: () => {}, hidden: false, setHidden: () => {} })

export function HeaderThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default')
  const [hidden, setHidden] = useState(false)
  return (
    <HeaderThemeContext.Provider value={{ theme, setTheme, hidden, setHidden }}>
      {children}
    </HeaderThemeContext.Provider>
  )
}

export const useHeaderTheme = () => useContext(HeaderThemeContext)
