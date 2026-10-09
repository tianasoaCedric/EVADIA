'use client' // Indique que ce composant doit être rendu côté client (nécessaire pour les hooks et les interactions)

// Import des hooks React 19 et des types TypeScript
import { useState, useTransition, ReactNode, MouseEvent } from 'react'

/**
 * Interface définissant les props (propriétés) acceptées par notre composant Bouton
 */
interface BoutonProps {
  // ReactNode = n'importe quel contenu React (texte, éléments HTML, autres composants)
  children?: ReactNode
  
  // Les différentes variantes de style disponibles
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  
  // Les différentes tailles disponibles
  size?: 'small' | 'medium' | 'large'
  
  // Fonction appelée quand on clique sur le bouton, avec l'événement souris
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  
  // État désactivé du bouton
  disabled?: boolean
  
  // État de chargement (quand on attend une réponse API par exemple)
  isLoading?: boolean
  
  // Classes CSS supplémentaires pour personnaliser le style
  className?: string
  
  // Type de bouton HTML (button, submit, reset)
  type?: 'button' | 'submit' | 'reset'
  widthMode?: 'auto' | 'full'
}

/**
 * Props par défaut : si on ne fournit pas une prop, on utilise ces valeurs
 */
const Bouton = ({ 
  children = "Cliquez-moi",  // Texte par défaut si aucun contenu n'est fourni
  variant = "primary",        // Variante par défaut
  size = "medium",            // Taille par défaut
  onClick = () => {},         // Fonction vide par défaut pour éviter les erreurs
  disabled = false,           // Désactivé par défaut à false
  isLoading = false,          // Pas en chargement par défaut
  className = "",             // Pas de classes supplémentaires par défaut
  type = "button",            // Type button par défaut
  widthMode = 'auto'          // Par défaut, auto = taille selon le texte
}: BoutonProps) => {
  
  /**
   * useState : Hook React qui permet de gérer un état local
   * isClicked : état actuel (true/false)
   * setIsClicked : fonction pour modifier cet état
   * On l'utilise pour ajouter un effet visuel au clic (scale)
   */
  const [isClicked, setIsClicked] = useState(false)
  
    const widthStyles: Record<string, string> = {
    auto: "w-auto",    // Largeur automatique selon le contenu
    full: "w-full"     // Pleine largeur du conteneur parent
  }

  /**
   * useTransition : Hook React 19 pour gérer les mises à jour non urgentes
   * isPending : boolean indiquant si une transition est en cours
   * startTransition : fonction pour démarrer une transition
   * Utile pour les actions asynchrones sans bloquer l'interface
   */
  const [isPending, startTransition] = useTransition()

  /**
   * Object contenant les styles Tailwind pour chaque variante
   * Record<string, string> : un objet avec des clés string et des valeurs string
   */
  const variantStyles: Record<string, string> = {
    primary: "bg-[#01BDA5] hover:bg-[#01A38E] text-white",    // Bleu pour actions principales
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",  // Gris pour actions secondaires
    outline: "border-2 border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5]/10", // Contour bleu
    danger: "bg-red-600 hover:bg-red-700 text-white",       // Rouge pour actions dangereuses
    success: "bg-green-600 hover:bg-green-700 text-white"   // Vert pour actions réussies
  }

  /**
   * Object contenant les styles Tailwind pour chaque taille
   * px : padding horizontal (gauche/droite)
   * py : padding vertical (haut/bas)
   * text : taille du texte
   */
  const sizeStyles: Record<string, string> = {
    small: "px-3 py-1 text-sm",     // Petit : moins d'espacement
    medium: "px-4 py-2.5 text-md",  // Moyen : espacement standard
    large: "px-8 py-3 text-lg"      // Grand : plus d'espacement
  }

  /**
   * Gestionnaire d'événement clic
   * @param e - L'événement souris de type MouseEvent
   */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Vérifie si le bouton n'est pas désactivé, en chargement ou en transition
    if (!disabled && !isLoading && !isPending) {
      // Active l'effet visuel de clic
      setIsClicked(true)
      
      /**
       * startTransition : indique à React que cette mise à jour n'est pas urgente
       * Cela permet de maintenir l'interface réactive pendant l'opération
       * Utile pour les appels API, les calculs lourds, etc.
       */
      startTransition(() => {
        onClick(e) // Appelle la fonction onClick passée en prop
      })
      
      // Réinitialise l'effet visuel après 200ms (délai pour voir l'animation)
      setTimeout(() => setIsClicked(false), 200)
    }
  }

  const responsiveStyles = `
    cursor-pointer
    rounded-full font-medium transition-all duration-200
    transform active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    ${widthStyles[widthMode]}    /* ← Mode de largeur dynamique */
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${isClicked || isPending ? 'scale-95' : 'scale-100'}
    ${className}
  `

  return (
    <button
      type={type}                    // Type du bouton (button, submit, reset)
      onClick={handleClick}         // Gestionnaire d'événement clic
      disabled={disabled || isLoading || isPending} // Désactivé si une condition est vraie
      className={responsiveStyles}  // Classes CSS dynamiques
    >
      {/* Rendu conditionnel : si en chargement ou transition, affiche le loader */}
      {/* {isLoading || isPending ? (
        <span className="flex items-center gap-2"> */}
          {/* SVG d'animation de chargement */}
          {/* <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"> */}
            {/* Cercle extérieur transparent */}
            {/* <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none"
            /> */}
            {/* Cercle intérieur qui tourne pour l'effet de rotation */}
            {/* <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg> */}
          {/* Chargement... */}
        {/* </span>
      ) : ( */}
        {/* // Sinon, affiche le contenu normal (children) */}
        {children}
      {/* )} */}
    </button>
  )
}

export default Bouton