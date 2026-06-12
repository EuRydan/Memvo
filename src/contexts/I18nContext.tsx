'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import pt from '@/locales/pt.json'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const dictionaries: Record<string, any> = { pt, en, es }

type Locale = 'pt' | 'en' | 'es'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    const saved = localStorage.getItem('memvor-locale') as Locale
    if (saved && dictionaries[saved]) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (dictionaries[newLocale]) {
      setLocaleState(newLocale)
      localStorage.setItem('memvor-locale', newLocale)
    }
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let val = dictionaries[locale]
    for (const k of keys) {
      if (val[k] === undefined) return key
      val = val[k]
    }
    return val as string
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
