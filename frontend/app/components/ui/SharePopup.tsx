'use client'

import { useState, useEffect } from 'react'
import { X, Link, Check, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SharePopupProps {
    isOpen: boolean
    onClose: () => void
    title: string
    text?: string
    url: string
}

export default function SharePopup({ isOpen, onClose, title, text, url }: SharePopupProps) {
    const t = useTranslations('SharePopup')
    const [copied, setCopied] = useState(false)
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedText = encodeURIComponent(text || title)

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Erreur copie:', err)
        }
    }

    // Fermer avec Echap
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-[#01BDA5]" />
                        <h3 className="text-lg font-semibold text-gray-800">{t('title')}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label={t('close')}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        {t('subtitle')}
                    </p>

                    {/* Grille des réseaux sociaux */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* Facebook */}
                        <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2] transition-colors">
                                <svg className="w-6 h-6 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">Facebook</span>
                        </a>

                        {/* Twitter/X */}
                        <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black transition-colors">
                                <svg className="w-6 h-6 text-black group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">Twitter</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href={shareLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                                <svg className="w-6 h-6 text-[#25D366] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.032 2.002c-5.514 0-9.99 4.472-9.99 9.982 0 1.76.457 3.478 1.316 4.985L2 22l5.383-1.306a9.96 9.96 0 0 0 4.65 1.168c5.513 0 9.99-4.473 9.99-9.983 0-5.51-4.477-9.982-9.99-9.982z"/>
                                    <path d="M16.438 14.688c-.197-.099-1.17-.578-1.352-.644-.181-.066-.313-.099-.445.099-.133.197-.513.644-.629.776-.116.132-.232.149-.43.05-.197-.099-.832-.307-1.585-.979a5.934 5.934 0 0 1-1.095-1.364c-.116-.165-.013-.255.087-.338.09-.074.198-.198.298-.297.099-.099.132-.165.198-.281.066-.116.033-.215-.017-.302-.05-.086-.445-1.072-.61-1.468-.16-.38-.323-.33-.445-.33-.116 0-.248-.017-.38-.017-.133 0-.347.05-.53.248-.182.198-.695.679-.695 1.655 0 .976.71 1.92.81 2.053.099.132 1.394 2.132 3.382 2.99.472.204.84.326 1.127.417.474.15.905.128 1.246.078.38-.05 1.17-.478 1.335-.94.165-.463.165-.86.116-.94-.05-.082-.165-.132-.363-.231z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">WhatsApp</span>
                        </a>

                        {/* Telegram */}
                        <a
                            href={shareLinks.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#26A5E4]/10 flex items-center justify-center group-hover:bg-[#26A5E4] transition-colors">
                                <svg className="w-6 h-6 text-[#26A5E4] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.13-.07-.18-.07-.05-.18-.03-.26-.01-.11.02-1.86 1.18-5.26 3.48-.5.34-.95.51-1.36.5-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.84.03-.23.35-.47.96-.72 2.11-.92 4.76-1.95 6.59-2.57 1.88-.64 2.55-.75 3.07-.75.2 0 .52.04.75.18.21.13.27.31.29.48.02.19-.03.43-.07.65z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">Telegram</span>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center group-hover:bg-[#0A66C2] transition-colors">
                                <svg className="w-6 h-6 text-[#0A66C2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">LinkedIn</span>
                        </a>

                        {/* Email */}
                        <a
                            href={shareLinks.email}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">Email</span>
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F56040] flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">Instagram</span>
                        </a>

                        {/* TikTok */}
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onClose()}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                            </div>
                            <span className="text-xs text-gray-600">TikTok</span>
                        </a>
                    </div>

                    {/* Copier le lien */}
                    <div className="border-t border-gray-100 pt-4">
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-[#01BDA5] transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Link className="w-5 h-5 text-gray-400 group-hover:text-[#01BDA5] transition-colors" />
                                <span className="text-sm text-gray-700">{t('copy_link')}</span>
                            </div>
                            {copied ? (
                                <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-4 h-4" />
                                    <span className="text-xs">{t('copied')}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">{t('click_to_copy')}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}