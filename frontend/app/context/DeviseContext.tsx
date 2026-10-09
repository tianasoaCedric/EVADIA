'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Devise = 'EUR' | 'MGA'

interface DeviseContextValue {
    devise: Devise
    setDevise: (d: Devise) => void
    /** Retourne le bon prix selon la devise active */
    getPrix: (prixMga?: number, prixEur?: number) => number | undefined
    /** Symbole de la devise active */
    symbole: string
}

const DeviseContext = createContext<DeviseContextValue>({
    devise: 'MGA',
    setDevise: () => {},
    getPrix: (prixMga) => prixMga,
    symbole: 'Ar',
})

export function DeviseProvider({ children }: { children: React.ReactNode }) {
    const [devise, setDeviseState] = useState<Devise>('MGA')

    useEffect(() => {
        const stored = localStorage.getItem('selectedDevise') as Devise | null
        if (stored === 'MGA' || stored === 'EUR') setDeviseState(stored)
    }, [])

    const setDevise = (d: Devise) => {
        setDeviseState(d)
        localStorage.setItem('selectedDevise', d)
    }

    const getPrix = (prixMga?: number, prixEur?: number) => {
        if (devise === 'EUR') return prixEur ?? prixMga
        return prixMga ?? prixEur
    }

    const symbole = devise === 'EUR' ? '€' : 'Ar'

    return (
        <DeviseContext.Provider value={{ devise, setDevise, getPrix, symbole }}>
            {children}
        </DeviseContext.Provider>
    )
}

export const useDevise = () => useContext(DeviseContext)
