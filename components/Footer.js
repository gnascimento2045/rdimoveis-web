'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/assets/logo.png"
                alt="RD Imóveis DF Logo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold">RD IMÓVEIS DF</h3>
                <p className="text-xs text-gray-400">Idealize! Sonhe! Realize!</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sua imobiliária de confiança em Brasília. Realizando sonhos desde 2024.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Navegação</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors">Imóveis</Link></li>
              <li><a href="https://wa.me/5561993336757" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://wa.me/5561993336757" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>(61) 99333-6757</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/RD-Imóveis-DF/61573584414764/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/rdimoveisdf/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 RD IMÓVEIS DF. Todos os direitos reservados.</p>
          <p className="mt-2">
            Desenvolvido por{' '}
            <a 
              href="https://wa.me/5561992724480" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-rd-blue hover:text-blue-400 transition-colors font-medium"
            >
              GSN TECH
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}