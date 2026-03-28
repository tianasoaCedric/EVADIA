'use client'

import { useState } from 'react'
import Header from './components/molecules/Header'
import RoomCard from './components/ui/RoomCard'
import OfferCard from './components/ui/OfferCard'

export default function Home() {
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const handleMenuClick = () => {
    console.log('Menu ouvert')
    // Ici tu peux ouvrir un menu latéral
  }

  const handleLogoClick = () => {
    console.log('Logo cliqué')
    // Redirection vers l'accueil
  }

  const handleSearchClick = () => {
    setShowSearch(!showSearch)
  }

  const handleAvatarClick = () => {
    console.log('Avatar cliqué')
    // Ouvrir le profil ou le menu utilisateur
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    setUserName('Jean Dupont')
    // setUserPhoto('https://example.com/photo.jpg') // Optionnel
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName(null)
    setUserPhoto(null)
  }

  return (
    <>
      <Header
        currentLang={language}
        onLanguageChange={setLanguage}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userPhoto={userPhoto}
        onMenuClick={handleMenuClick}
        onLogoClick={handleLogoClick}
        onSearchClick={handleSearchClick}
        onAvatarClick={handleAvatarClick}
        showSearchInput={true}
        theme='dark'
      />

      <main className="min-h-screen transition-colors duration-300 top-0 left-0 w-full h-full"
        style={{
          // backgroundImage: 'url("/photos/bc.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // backgroundAttachment: 'fixed', // Effet parallaxe optionnel
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className='flex items-center justify-center h-screen gap-4'>
          <div className="flex items-center justify-center gap-4">
            <OfferCard
              imageUrl="/photos/test.jpg"
              discount={25}
              startDay={1}
              endDay={15}
              month="juin"
              hotelName="IBIS Ankorondrano"
              city="Antananarivo"
              destination="Le centre ville"
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <OfferCard
              imageUrl="/photos/test.jpg"
              discount={25}
              startDay={1}
              endDay={15}
              month="juin"
              hotelName="IBIS Ankorondrano"
              city="Antananarivo"
              destination="Le centre ville"
            />
          </div>
        </div>
        {/* <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Bienvenue sur Evadia
          </h1>
          <p className="text-gray-600 mb-8">
            Langue actuelle : {language === 'FR' ? 'Français' : 'Anglais'}
          </p>

          <div className="flex gap-4">
            {!isLoggedIn ? (
              <Bouton variant="primary" onClick={handleLogin}>
                Se connecter
              </Bouton>
            ) : (
              <Bouton variant="outline" onClick={handleLogout}>
                Se déconnecter
              </Bouton>
            )}
          </div>
        </div> */}
      </main>
    </>
  )
}