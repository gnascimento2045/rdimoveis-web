import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const WHATSAPP_NUMBER = '5561993336757'

export const formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return 'Sob consulta'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export const formatPriceDisplay = (price, priceOnRequest = false) => {
  if (priceOnRequest) return 'Sob consulta'
  return formatPrice(price)
}

export const getWhatsAppLink = (property) => {
  const message = property
    ? `Olá! Tenho interesse no imóvel: ${property.title}. Gostaria de agendar uma visita.`
    : 'Olá! Gostaria de mais informações sobre os imóveis.'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const maskCurrencyBRL = (value = '') => {
  // Remove todos os caracteres não numéricos
  const digits = value.replace(/\D/g, '')
  
  // Se não houver dígitos ou for zero, retorna vazio
  if (!digits || digits === '0' || digits === '00') return ''
  
  // Converte para número dividindo por 100 (para considerar centavos)
  const number = Number(digits) / 100
  
  // Se não for um número válido ou for zero, retorna vazio
  if (Number.isNaN(number) || number === 0) return ''
  
  // Formata o número como moeda brasileira
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
}

export const currencyToNumber = (value = '') => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

export const formatFinalidade = (finalidade) => {
  const map = {
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lancamento': 'Lançamento'
  }
  return map[finalidade] || finalidade
}

export const formatCondicao = (condicao) => {
  const map = {
    'novo': 'Novo',
    'usado': 'Usado',
    'na_planta': 'Na Planta',
    'mobiliado': 'Mobiliado',
    'nao_mobiliado': 'Não Mobiliado'
  }
  return map[condicao] || condicao
}

export const getFinalidadeBadge = (finalidade) => {
  const map = {
    'venda': 'COMPRAR',
    'comprar': 'COMPRAR',
    'aluguel': 'ALUGUEL',
    'alugar': 'ALUGUEL',
    'lancamento': 'LANÇAMENTO',
    'lancamentos': 'LANÇAMENTO'
  }
  return map[finalidade] || finalidade.toUpperCase()
}

export const getCondicaoBadge = (condicao) => {
  const map = {
    'novo': 'NOVO',
    'usado': 'USADO',
    'na_planta': 'NA PLANTA',
    'mobiliado': 'MOBILIADO',
    'nao_mobiliado': null
  }
  return map[condicao] !== undefined ? map[condicao] : condicao.toUpperCase()
}