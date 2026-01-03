'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src="/assets/logo.png" 
              alt="RD Imóveis DF Logo" 
              width={60} 
              height={60}
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-rd-blue">RD IMÓVEIS DF</h1>
              <p className="text-xs text-gray-600 tracking-wide">Idealize! Sonhe! Realize!</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/properties?purpose=comprar" className="text-gray-700 hover:text-rd-blue transition-colors font-medium">
              COMPRAR
            </Link>
            <Link href="/properties?purpose=alugar" className="text-gray-700 hover:text-rd-blue transition-colors font-medium">
              ALUGUEL
            </Link>
            <Link href="/properties?purpose=lancamentos" className="text-gray-700 hover:text-rd-blue transition-colors font-medium">
              LANÇAMENTOS
            </Link>
            <Link href="/emprestimos" className="text-gray-700 hover:text-rd-blue transition-colors font-medium">
              EMPRESTIMOS SIAPE & INSS
            </Link>
            <a
              href="https://wa.me/5561993336757?text=Oi,%20quero%20simular%20o%20valor%20do%20meu%20imovel!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-rd-blue transition-colors font-medium"
            >
              SAIBA O VALOR DO SEU IMÓVEL
            </a>
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
        </div>
      </div>
    </motion.nav>
  )
}