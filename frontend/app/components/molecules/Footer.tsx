'use client'

import { useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import ContactPopup from './ContactPopup';

export default function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <footer className="bg-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-auto items-start">

            {/* Links */}
            <div className="space-y-3 text-sm">
              <ul className="space-y-2">
                <li>
                  <Link href="/hebergement" className="hover:underline">
                    • Hébergements
                  </Link>
                </li>
                <li>
                  <Link href="/destination" className="hover:underline">
                    • Destination
                  </Link>
                </li>
                <li>
                  <Link href="/offres" className="hover:underline">
                    • Offres
                  </Link>
                </li>
                <li>
                  <Link href="/a-decouvrir" className="hover:underline">
                    • A découvrir
                  </Link>
                </li>
              </ul>
            </div>

            {/* Establishments */}
            <div className="space-y-3 text-sm">
              <h3 className="font-medium text-lg">Pour les établissements</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="hover:underline cursor-pointer"
                  >
                    • Contact
                  </button>
                </li>
                <li>
                  <a href="mailto:contact@evadia.com" className="hover:underline">
                    • Mail
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4 md:flex md:flex-col md:items-end">
              <p className="text-lg text-center md:text-center">Suivez - nous</p>

              <div className="flex justify-center gap-5">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:scale-110 transition-transform"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:scale-110 transition-transform"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.205 0 22.225 0z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:scale-110 transition-transform"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85 0 3.205-.012 3.584-.069 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:scale-110 transition-transform"
                  aria-label="TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center my-10">
            <Link href="/">
              <img
                src="/Evadia_Logo 4.png"
                alt="Evadia"
                className="block hover:opacity-80 transition-opacity"
                width={100}
                height={100}
              />
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-white/40 my-6"></div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-4 text-white/90">
            <p>© Copyright 2026</p>

            <Link href="/mentions-legales" className="hover:underline">
              Mentions légales
            </Link>

            <Link href="/politiques-confidentialite" className="hover:underline">
              Politiques de confidentialités
            </Link>
          </div>
        </div>
      </footer>

      {/* Popup de contact */}
      <ContactPopup 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
}