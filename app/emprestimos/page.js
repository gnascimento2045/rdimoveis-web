'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Emprestimos() {
  const operations = [
    {
      title: 'Novo Empréstimo',
      description: 'Solicite um empréstimo consignado novo com as melhores taxas do mercado.'
    },
    {
      title: 'Portabilidade',
      description: 'Transfira seu empréstimo consignado de outra instituição com facilidade.'
    },
    {
      title: 'Refinanciamento - Renovação',
      description: 'Renove ou refinancie seu empréstimo consignado existente.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 flex items-center justify-center bg-gradient-to-r from-slate-900 via-rd-blue to-blue-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=srgb&fm=jpg&q=85)', backgroundSize: 'cover' }}></div>
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white"
            >
              <p className="text-xs sm:text-sm font-bold text-blue-200 mb-3 sm:mb-4 uppercase tracking-wider">SOLUÇÕES FINANCEIRAS</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                EMPRÉSTIMOS<br />CONSIGNADOS
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
                Taxas reduzidas e processo rápido para servidores públicos federais e aposentados do INSS
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="https://wa.me/5561993336757?text=Oi%2C%20Quero%20uma%20simula%C3%A7%C3%A3o%20SIAPE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-rd-blue hover:bg-gray-100 rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-xl transition-colors text-center"
                >
                  SIAPE
                </a>
                <a
                  href="https://wa.me/5561993336757?text=Oi%2C%20Quero%20uma%20simula%C3%A7%C3%A3o%20INSS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-rd-blue hover:bg-gray-100 rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-xl transition-colors text-center"
                >
                  INSS
                </a>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/20">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-2">+15 anos</p>
                <p className="text-sm sm:text-base text-blue-100">De experiência no mercado</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/20">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-2">Taxas baixas</p>
                <p className="text-sm sm:text-base text-blue-100">A partir de 1,5% a.m.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/20">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-2">Pagamento rápido</p>
                <p className="text-sm sm:text-base text-blue-100">Liberação em até 24 horas úteis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/20">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-2">100% Seguro</p>
                <p className="text-sm sm:text-base text-blue-100">Desconto automático em folha</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* O que é Empréstimo Consignado */}
      <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-4">
              O que é o Empréstimo Consignado?
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                O empréstimo consignado é uma modalidade de crédito destinada principalmente a servidores públicos federais e aposentados do INSS. A principal característica é que o valor da parcela é descontado automaticamente da folha de pagamento do cliente.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-3 sm:gap-4">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Taxas Reduzidas</h3>
                    <p className="text-sm sm:text-base text-gray-700">As taxas são significativamente menores porque o risco é menor para o banco, já que o desconto é garantido na folha.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Processo Rápido</h3>
                    <p className="text-sm sm:text-base text-gray-700">Aprovação rápida e crédito em poucos dias úteis, sem burocracias excessivas.</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Segurança Garantida</h3>
                    <p className="text-sm sm:text-base text-gray-700">O pagamento é garantido pelo desconto automático em folha, dando segurança total ao banco.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Operações */}
      <section id="operacoes" className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 text-center px-4">
              Nossas Operações
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 text-center max-w-2xl mx-auto px-4">
              Conheça as modalidades de empréstimo consignado que oferecemos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {operations.map((op, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-rd-blue mb-4">{op.title}</h3>
                <p className="text-gray-700 leading-relaxed">{op.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-rd-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Contratar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Fale com um dos nossos especialistas e simule as melhores condições para você.
          </p>
          <a
            href="https://wa.me/5561993336757"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-rd-blue hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-bold shadow-xl transition-colors"
          >
            Falar com um Especialista
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
