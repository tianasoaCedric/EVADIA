'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CreditCard, Plus, Trash2, Star } from 'lucide-react'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'

interface Card {
  id: number
  last4: string
  brand: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

export default function ProfilePaymentMethods() {
  const t = useTranslations('ProfilePaymentMethods')
  const [showForm, setShowForm] = useState(false)
  const [cards, setCards] = useState<Card[]>([
    { id: 1, last4: '4242', brand: 'Visa', expiryMonth: '12', expiryYear: '2028', isDefault: true },
    { id: 2, last4: '5555', brand: 'Mastercard', expiryMonth: '08', expiryYear: '2027', isDefault: false },
  ])

  const handleSetDefault = (id: number) => {
    setCards(cards.map(card => ({ ...card, isDefault: card.id === id })))
  }

  const handleRemoveCard = (id: number) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-6 h-6 text-gray-500" />
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#01BDA5]" />
          <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-[#01BDA5] text-sm font-medium hover:underline"
        >
          <Plus className="w-4 h-4" />
          {t('add_card')}
        </button>
      </div>

      {/* Formulaire d'ajout de carte */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-800 mb-4">{t('add_card_title')}</h3>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder={t('card_number')}
              fullWidth
            />
            <div className="grid grid-cols-2 gap-3">
              <Input type="text" placeholder={t('expiry_month')} />
              <Input type="text" placeholder={t('expiry_year')} />
            </div>
            <Input type="text" placeholder={t('cvv')} fullWidth />
            <div className="flex gap-3">
              <Bouton variant="primary" size="small" onClick={() => setShowForm(false)}>
                {t('save_card')}
              </Bouton>
              <Bouton variant="outline" size="small" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </Bouton>
            </div>
          </div>
        </div>
      )}

      {/* Liste des cartes */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              {getCardIcon(card.brand)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{card.brand}</span>
                  {card.isDefault && (
                    <span className="text-xs px-1.5 py-0.5 bg-[#01BDA5]/10 text-[#01BDA5] rounded-full">
                      {t('default')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">•••• {card.last4}</p>
                <p className="text-xs text-gray-400">Expire {card.expiryMonth}/{card.expiryYear}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!card.isDefault && (
                <button
                  onClick={() => handleSetDefault(card.id)}
                  className="p-1.5 text-gray-500 hover:text-[#01BDA5] transition-colors"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleRemoveCard(card.id)}
                className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('no_cards')}</p>
        </div>
      )}
    </div>
  )
}