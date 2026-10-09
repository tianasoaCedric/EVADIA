'use client'

import { useEffect } from 'react'
import { useHeaderTheme } from '@/app/context/HeaderThemeContext'

export default function HideHeader() {
  const { setHidden } = useHeaderTheme()
  useEffect(() => {
    setHidden(true)
    return () => setHidden(false)
  }, [setHidden])
  return null
}
