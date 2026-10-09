'use client'

import { useState } from 'react'
import { X, Mail, Phone, MapPin, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Input from '../ui/Input'
import Bouton from '../ui/Bouton'

interface ContactPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactPopup({ isOpen, onClose }: ContactPopupProps) {
  const t = useTranslations('ContactPopup')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [setPopupRef, isPopupVisible] = useOnScreen({ threshold: 0.2,  })

  const handleSubmit = async () => {
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) return
    
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormMessage('')
    setIsSubmitting(false)
    onClose()
    alert('Message envoyé avec succès !')
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={setPopupRef}
        className={`relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ease-out max-h-[90vh] overflow-y-auto ${
          isPopupVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Colonne gauche - Formulaire */}
          <div className="p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {t('subtitle')}
            </p>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder={t('name_placeholder')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                variant="light"
                placeholderPosition="left"
              />
              
              <Input
                type="email"
                placeholder={t('email_placeholder')}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                fullWidth
                variant="light"
                placeholderPosition="left"
              />
              
              <Input
                type="tel"
                placeholder={t('phone_placeholder')}
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                fullWidth
                variant="light"
                placeholderPosition="left"
              />
              
              <div>
                <textarea
                  placeholder={t('message_placeholder')}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] font-sans font-medium text-sm placeholder:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent resize-none"
                />
              </div>
              
              <Bouton
                variant="primary"
                size="medium"
                widthMode="full"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!formName.trim() || !formEmail.trim() || !formMessage.trim()}
                className="flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('send_button')}
              </Bouton>
            </div>
          </div>

          {/* Colonne droite - Informations de contact */}
          <div className="bg-[#01BDA5] p-6 sm:p-8 md:p-10 text-white">
            <h3 className="text-xl font-semibold mb-6">{t('contact_info_title')}</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm opacity-80">{t('email_label')}</p>
                  <p className="font-medium break-all">contact@evadia.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm opacity-80">{t('phone_label')}</p>
                  <p className="font-medium">+261 34 12 345 67</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm opacity-80">{t('address_label')}</p>
                  <p className="font-medium">
                    123 Innovation Avenue, Suite 456<br />
                    Tech District, Antananarivo<br />
                    Madagascar
                  </p>
                </div>
              </div>
            </div>

            {/* Follow us */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm font-medium mb-4">{t('follow_us')}</p>
              <div className="flex flex-wrap gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85 0 3.205-.012 3.584-.069 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.205 0 22.225 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}