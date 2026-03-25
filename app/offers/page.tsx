'use client'

import { useState } from 'react'
import { Tag, Copy, Check, Gift, Percent, Users, Clock, Zap, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const allOffers = [
  { tag: 'New Users', title: 'Flat 20% off', desc: 'On your first booking. No minimum order value. Valid on all routes.', code: 'MADNEW20', icon: Gift, accent: 'brand', validity: 'Valid till 31st March' },
  { tag: 'Weekend Special', title: '₹100 Cashback', desc: 'Book any ticket above ₹500 this weekend and get ₹100 back instantly.', code: 'WEEKEND100', icon: Percent, accent: 'emerald', validity: 'Every weekend' },
  { tag: 'Refer a Friend', title: 'Earn ₹50 credits', desc: 'When your friend completes their first booking, both of you get ₹50.', code: 'REFERRAL50', icon: Users, accent: 'amber', validity: 'No expiry' },
  { tag: 'Summer Sale', title: 'Up to 30% off', desc: 'Beat the heat with cool discounts on AC sleeper buses this summer.', code: 'SUMMER30', icon: Zap, accent: 'brand', validity: 'Valid till 30th April' },
  { tag: 'Night Owl', title: '₹75 off night buses', desc: 'Special discount on buses departing between 10 PM and 6 AM.', code: 'NIGHTOWL75', icon: Clock, accent: 'emerald', validity: 'Valid on night buses' },
  { tag: 'Loyalty Reward', title: 'Extra 10% off', desc: 'For users who have completed 5+ bookings. Loyalty deserves rewards.', code: 'LOYAL10', icon: Star, accent: 'amber', validity: 'For loyal users' },
]

const accentStyles: Record<string, { iconBg: string, iconText: string, tagBg: string, tagText: string }> = {
  brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-500', tagBg: 'bg-brand-50', tagText: 'text-brand-600' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', tagBg: 'bg-emerald-50', tagText: 'text-emerald-600' },
  amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-500', tagBg: 'bg-amber-50', tagText: 'text-amber-600' },
}

export default function OffersPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Tag size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Offers & Deals</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Exclusive Offers</h1>
          <p className="text-white/60 text-base">Save more on every journey with these special deals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allOffers.map((o, i) => (
            <OfferCard key={i} offer={o} />
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
          <h3 className="font-semibold text-brand-700 mb-1">💡 How to use offers</h3>
          <p className="text-sm text-brand-600/70">Copy the coupon code and paste it at checkout while booking your bus ticket. Discounts will be applied automatically.</p>
        </div>
      </div>

      <Footer />
    </>
  )
}

function OfferCard({ offer }: { offer: typeof allOffers[0] }) {
  const [copied, setCopied] = useState(false)
  const styles = accentStyles[offer.accent]
  const Icon = offer.icon

  function copy() {
    navigator.clipboard?.writeText(offer.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon size={22} className={styles.iconText} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.tagBg} ${styles.tagText}`}>
          {offer.tag}
        </span>
      </div>

      <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{offer.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-2">{offer.desc}</p>
      <p className="text-xs text-slate-400 mb-5">{offer.validity}</p>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3.5 py-2.5">
          <span className="text-slate-700 font-bold text-sm tracking-widest font-mono">{offer.code}</span>
        </div>
        <button
          onClick={copy}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            copied ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-500'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  )
}
