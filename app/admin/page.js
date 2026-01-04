'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [heroImage, setHeroImage] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`)
                const data = await res.json()
                setHeroImage(data['hero-image']?.url || '')
            } catch (err) {
                console.error('Erro ao carregar imagem de fundo', err)
            }
        }
        load()
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Erro ao fazer login')
            }

            // Salvar token no localStorage
            localStorage.setItem('admin_token', data.access_token)
            localStorage.setItem('admin_email', email)

            // Redirecionar para dashboard
            router.push('/admin/dashboard')
        } catch (err) {
            setError(err.message || 'Email ou senha inválidos')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rd-blue to-blue-700 bg-cover bg-center"
            style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}
        >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <div className="text-center mb-8 flex flex-col items-center gap-3">
                        <Image
                            src="/assets/logo.png"
                            alt="RD IMÓVEIS DF"
                            width={120}
                            height={120}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                        <h1 className="text-3xl font-bold text-gray-900">LOGIN ADMIN</h1>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue focus:border-transparent"
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rd-blue hover:bg-rd-blue-hover text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Carregando...' : 'Entrar'}
                        </button>
                    </form>

                </div>
            </motion.div>
        </div>
    )
}
