import Navbar from '@/components/Navbar'
import SearchSection from '@/components/SearchSection'
import PopularRoutes from '@/components/PopularRoutes'
import OffersSection from '@/components/OffersSection'
import WhyMadBus from '@/components/WhyMadBus'
import SocialProof from '@/components/SocialProof'
import AppBanner from '@/components/AppBanner'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <SearchSection />
      <PopularRoutes />
      <OffersSection />
      <WhyMadBus />
      <SocialProof />
      <AppBanner />
      <Footer />
    </main>
  )
}
