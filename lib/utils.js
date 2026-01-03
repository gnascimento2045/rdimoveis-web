import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const WHATSAPP_NUMBER = '5561993336757'

export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export const getWhatsAppLink = (property) => {
  const message = property
    ? `Olá! Tenho interesse no imóvel: ${property.title}. Gostaria de agendar uma visita.`
    : 'Olá! Gostaria de mais informações sobre os imóveis.'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Formatar finalidade do imóvel
export const formatFinalidade = (finalidade) => {
  const map = {
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lancamento': 'Lançamento'
  }
  return map[finalidade] || finalidade
}

// Formatar condição do imóvel
export const formatCondicao = (condicao) => {
  const map = {
    'novo': 'Novo',
    'usado': 'Usado',
    'na_planta': 'Na Planta'
  }
  return map[condicao] || condicao
}

// Obter rótulo da finalidade (para badges)
export const getFinalidadeBadge = (finalidade) => {
  const map = {
    'venda': 'VENDA',
    'aluguel': 'ALUGUEL',
    'lancamento': 'LANÇAMENTO'
  }
  return map[finalidade] || finalidade.toUpperCase()
}

// Obter rótulo da condição (para badges)
export const getCondicaoBadge = (condicao) => {
  const map = {
    'novo': 'NOVO',
    'usado': 'USADO',
    'na_planta': 'NA PLANTA'
  }
  return map[condicao] || condicao.toUpperCase()
}