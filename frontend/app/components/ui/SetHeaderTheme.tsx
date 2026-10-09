'use client'

import { useEffect } from 'react'
import { useHeaderTheme } from '@/app/context/HeaderThemeContext'

export default function SetHeaderTheme({ theme }: { theme: 'default' | 'dark' }) {
  const { setTheme } = useHeaderTheme()
  useEffect(() => {
    setTheme(theme)
    return () => setTheme('default')
  }, [theme, setTheme])
  return null
}
