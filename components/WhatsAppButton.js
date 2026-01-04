'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/5561993336757"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Image src="/assets/whatsapp.png" alt="WhatsApp" width={56} height={56} className="h-14 w-14" />
    </motion.a>
  )
}