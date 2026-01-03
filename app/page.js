import Link from 'next/link'
import Image from 'next/image'
import SearchBar from '@/components/SearchBar'
import PropertyCard from '@/components/PropertyCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { propertyService } from '@/services/api'

export const revalidate = 60

export default async function Home() {
  let properties = []
  try {
    properties = await propertyService.getProperties({ active: true })
    properties = properties.slice(0, 6)
  } catch (error) {
    console.error('Error loading properties:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      <section className="relative pt-20 pb-32 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1625426242633-3be4b3379dfb?crop=entropy&cs=srgb&fm=jpg&q=85)'}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            IDEALIZE!<br />SONHE!<br />REALIZE!
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12 drop-shadow-lg">
            Encontre o imóvel dos seus sonhos em Brasília
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Imóveis em Destaque
            </h2>
            <div className="flex gap-4 mb-12 justify-center">
              <Link href="/properties?purpose=comprar" className="px-6 py-3 font-bold text-rd-blue border-b-4 border-rd-blue">
                COMPRAR
              </Link>
              <Link href="/properties?purpose=alugar" className="px-6 py-3 font-bold text-gray-600 hover:text-gray-800">
                ALUGUEL
              </Link>
              <Link href="/properties?purpose=lancamentos" className="px-6 py-3 font-bold text-gray-600 hover:text-gray-800">
                LANÇAMENTOS
              </Link>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum imóvel disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {properties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/properties"
              className="inline-block bg-rd-blue hover:bg-rd-blue-hover text-white rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* Saiba Quanto Vale Seu Imóvel */}
      <section className="relative py-24 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&q=85)'}}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-2xl">
            Saiba quanto vale seu imóvel
          </h2>
          <a
            href="https://wa.me/5561993336757?text=Oi,%20quero%20simular%20o%20valor%20do%20meu%20imovel!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-rd-blue hover:bg-rd-blue-hover text-white px-8 py-4 text-lg font-bold shadow-lg transition-colors rounded-lg"
          >
            CALCULE AGORA!
          </a>
        </div>
      </section>

      {/* Bairros em Destaque */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Bairros em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/properties?city=Águas%20Claras" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Águas Claras"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Águas Claras | Brasília</h3>
            </Link>

            <Link href="/properties?city=Asa%20Sul" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1449844908441-8829872d2607?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Asa Sul"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Asa Sul | Brasília</h3>
            </Link>

            <Link href="/properties?city=Asa%20Norte" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Asa Norte"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Asa Norte | Brasília</h3>
            </Link>

            <Link href="/properties?city=Taguatinga" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-2df1e051f537?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Taguatinga"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Taguatinga | Brasília</h3>
            </Link>

            <Link href="/properties?city=Sudoeste" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1494783367193-149034c05e41?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Sudoeste"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Sudoeste | Brasília</h3>
            </Link>

            <Link href="/properties?city=Noroeste" className="group cursor-pointer">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1512207736139-e1b3a81b4cf2?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Noroeste"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">Noroeste | Brasília</h3>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-rd-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            VAMOS AGENDAR UMA VISITA
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e realize o sonho da casa própria
          </p>
          <a
            href="https://wa.me/5561993336757"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-rd-blue hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-bold shadow-xl transition-colors"
          >
            Falar com um Corretor
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}