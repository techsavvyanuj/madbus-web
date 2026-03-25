'use client'

import { useState } from 'react'
import { Tag, Copy, Check, Gift, Percent, Users, ArrowRight } from 'lucide-react'

const offers = [
  {
    tag: 'New Users',
    title: 'Flat 20% off',
    desc: 'On your first booking. No minimum order value. Valid on all routes.',
    code: 'MADNEW20',
    icon: Gift,
    accent: 'brand',
  },
  {
    tag: 'Weekend Special',
    title: '₹100 Cashback',
    desc: 'Book any ticket above ₹500 this weekend and get ₹100 back instantly.',
    code: 'WEEKEND100',
    icon: Percent,
    accent: 'emerald',
  },
  {
    tag: 'Refer a Friend',
    title: 'Earn ₹50 credits',
    desc: 'When your friend completes their first booking, both of you get ₹50 added to your wallet.',
    code: 'REFERRAL50',
    icon: Users,
    accent: 'amber',
  },
]

const accentStyles: Record<string, { iconBg: string, iconText: string, tagBg: string, tagText: string, border: string }> = {
  brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-500', tagBg: 'bg-brand-50', tagText: 'text-brand-600', border: 'hover:border-brand-200' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-500', tagBg: 'bg-emerald-50', tagText: 'text-emerald-600', border: 'hover:border-emerald-200' },
  amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-500', tagBg: 'bg-amber-50', tagText: 'text-amber-600', border: 'hover:border-amber-200' },
}

export default function OffersSection() {
  return (
    <section id="offers" className="bg-slate-50/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <Tag size={16} className="text-brand-500" />
              </div>
              <span className="text-brand-500 text-sm font-semibold uppercase tracking-widest">Offers & Deals</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900">Exclusive deals for you</h2>
            <p className="text-slate-500 text-sm mt-1">Save more on your next journey with these special offers</p>
          </div>
          <a href="/offers" className="group text-sm font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all">
            All offers <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {offers.map((o, i) => (
            <OfferCard key={i} offer={o} />
          ))}
        </div>
      </div>
    </section>
  )
}

function OfferCard({ offer }: { offer: typeof offers[0] }) {
  const [copied, setCopied] = useState(false)
  const styles = accentStyles[offer.accent]
  const Icon = offer.icon

  function copy() {
    navigator.clipboard?.writeText(offer.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`group bg-white rounded-2xl border border-slate-100 ${styles.border} p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon size={22} className={styles.iconText} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.tagBg} ${styles.tagText}`}>
          {offer.tag}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{offer.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{offer.desc}</p>

      {/* Coupon code */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-slate-700 font-bold text-sm tracking-widest font-mono">{offer.code}</span>
        </div>
        <button
          onClick={copy}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            copied
              ? 'bg-green-50 text-green-500'
              : 'bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-500'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  )
}
