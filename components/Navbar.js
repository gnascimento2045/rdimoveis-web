'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/assets/logo.png"
              alt="RD Imóveis DF Logo"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-rd-blue">RD IMÓVEIS DF</h1>
              <p className="text-xs text-gray-600 tracking-wide hidden sm:block">Idealize! Sonhe! Realize!</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/emprestimos" className="text-gray-700 hover:text-rd-blue transition-colors font-medium">
              EMPRESTIMOS SIAPE OU INSS
            </Link>
            <span className="text-gray-400">|</span>
            <a
              href="https://wa.me/5561993336757?text=Oi,%20quero%20simular%20o%20valor%20do%20meu%20imovel!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-rd-blue transition-colors font-medium"
            >
              AVALIE E VENDA SEU IMÓVEL
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="https://wa.me/5561993336757"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-rd-blue hover:bg-rd-blue-hover text-white rounded-full px-6 py-2 font-semibold shadow-lg transition-colors flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>FALE CONOSCO AGORA</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-rd-blue transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link 
                href="/emprestimos" 
                className="block text-gray-700 hover:text-rd-blue transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                EMPRESTIMOS SIAPE OU INSS
              </Link>
              <a
                href="https://wa.me/5561993336757?text=Oi,%20quero%20simular%20o%20valor%20do%20meu%20imovel!"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-700 hover:text-rd-blue transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                AVALIE E VENDA SEU IMÓVEL
              </a>
              <a
                href="https://wa.me/5561993336757"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-rd-blue hover:bg-rd-blue-hover text-white rounded-lg px-6 py-3 font-semibold shadow-lg transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>FALE CONOSCO AGORA</span>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}