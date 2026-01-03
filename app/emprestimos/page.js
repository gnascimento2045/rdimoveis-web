'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Emprestimos() {
  const operations = [
    {
      title: 'Margem Livre - Empréstimo Novo',
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
      <section className="relative pt-20 pb-32 flex items-center justify-center bg-gradient-to-r from-rd-blue to-blue-700">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            EMPRÉSTIMOS CONSIGNADOS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-white mb-8"
          >
            SIAPE & INSS
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Soluções financeiras com as melhores taxas para servidores públicos federais e aposentados do INSS
          </motion.p>
        </div>
      </section>

      {/* O que é Empréstimo Consignado */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              O que é o Empréstimo Consignado?
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                O empréstimo consignado é uma modalidade de crédito destinada principalmente a servidores públicos federais e aposentados do INSS. A principal característica é que o valor da parcela é descontado automaticamente da folha de pagamento do cliente.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Taxas Reduzidas</h3>
                    <p className="text-gray-700">As taxas são significativamente menores porque o risco é menor para o banco, já que o desconto é garantido na folha.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Processo Rápido</h3>
                    <p className="text-gray-700">Aprovação rápida e crédito em poucos dias úteis, sem burocracias excessivas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-rd-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Segurança Garantida</h3>
                    <p className="text-gray-700">O pagamento é garantido pelo desconto automático em folha, dando segurança total ao banco.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Operações */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Nossas Operações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
