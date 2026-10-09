import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type Devise = 'EUR' | 'MGA';

const DEVISE_KEY = 'selectedDevise';

interface DeviseContextValue {
  devise: Devise;
  setDevise: (d: Devise) => void;
  /** Retourne le bon prix selon la devise active */
  getPrix: (prixMga?: number | string | null, prixEur?: number | string | null) => number | undefined;
  /** Symbole de la devise active */
  symbole: string;
}

const DeviseContext = createContext<DeviseContextValue>({
  devise: 'MGA',
  setDevise: () => {},
  getPrix: (prixMga) => toNumber(prixMga),
  symbole: 'Ar',
});

function toNumber(val?: number | string | null): number | undefined {
  if (val === null || val === undefined) return undefined;
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? undefined : n;
}

export function DeviseProvider({ children }: { children: React.ReactNode }) {
  const [devise, setDeviseState] = useState<Devise>('MGA');

  useEffect(() => {
    SecureStore.getItemAsync(DEVISE_KEY).then((stored) => {
      if (stored === 'MGA' || stored === 'EUR') setDeviseState(stored);
    });
  }, []);

  const setDevise = (d: Devise) => {
    setDeviseState(d);
    SecureStore.setItemAsync(DEVISE_KEY, d);
  };

  const getPrix = (prixMga?: number | string | null, prixEur?: number | string | null) => {
    const mga = toNumber(prixMga);
    const eur = toNumber(prixEur);
    if (devise === 'EUR') return eur ?? mga;
    return mga ?? eur;
  };

  const symbole = devise === 'EUR' ? '€' : 'Ar';

  return (
    <DeviseContext.Provider value={{ devise, setDevise, getPrix, symbole }}>
      {children}
    </DeviseContext.Provider>
  );
}

export const useDevise = () => useContext(DeviseContext);
