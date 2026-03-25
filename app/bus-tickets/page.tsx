'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Search, ArrowLeftRight, ArrowRight, Shield, Clock, Zap } from 'lucide-react'
import { POPULAR_CITIES } from '@/lib/data'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const topRoutes = [
  { from: 'Mumbai', to: 'Pune', price: 199 },
  { from: 'Delhi', to: 'Agra', price: 249 },
  { from: 'Bangalore', to: 'Chennai', price: 399 },
  { from: 'Hyderabad', to: 'Vizag', price: 549 },
  { from: 'Jaipur', to: 'Jodhpur', price: 299 },
  { from: 'Mumbai', to: 'Goa', price: 599 },
]

export default function BusTicketsPage() {
  const router = useRouter()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([])
  const [toSuggestions, setToSuggestions] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch('/api/citylist.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(data => {
        if (data.Result === 'true') {
          setCities(data.citylist.map((c: any) => ({ ...c, title: c.title.trim() })))
        }
      }).catch(e => console.error(e))
  }, [])

  function getSuggestions(val: string) {
    if (!val || val.length < 1) return []
    return cities.filter(c => c.title.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5)
  }

  function handleSearch() {
    if (!from.trim() || !to.trim()) return
    const fromCity = cities.find(c => c.title.toLowerCase() === from.trim().toLowerCase())
    const toCity = cities.find(c => c.title.toLowerCase() === to.trim().toLowerCase())
    if (!fromCity || !toCity) return
    const params = new URLSearchParams({
      fromId: fromCity.id,
      fromName: fromCity.title,
      toId: toCity.id,
      toName: toCity.title,
      date
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Book Bus Tickets</h1>
          <p className="text-white/60 text-base">Find and book affordable bus tickets across 2000+ routes in India</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-10 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_auto] gap-4 items-end">
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">From</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  value={from}
                  onChange={e => { setFrom(e.target.value); setFromSuggestions(getSuggestions(e.target.value)) }}
                  onBlur={() => setTimeout(() => setFromSuggestions([]), 150)}
                  placeholder="Departure city"
                  className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-colors"
                />
                {fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                    {fromSuggestions.map(item => (
                      <button key={item.id} onMouseDown={() => { setFrom(item.title); setFromSuggestions([]) }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2.5">
                        <MapPin size={13} className="text-slate-400" /> {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => { setFrom(to); setTo(from) }} className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all self-end mb-0.5 mx-auto">
              <ArrowLeftRight size={15} />
            </button>

            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">To</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  value={to}
                  onChange={e => { setTo(e.target.value); setToSuggestions(getSuggestions(e.target.value)) }}
                  onBlur={() => setTimeout(() => setToSuggestions([]), 150)}
                  placeholder="Destination city"
                  className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-colors"
                />
                {toSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                    {toSuggestions.map(item => (
                      <button key={item.id} onMouseDown={() => { setTo(item.title); setToSuggestions([]) }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2.5">
                        <MapPin size={13} className="text-slate-400" /> {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 outline-none transition-colors" />
              </div>
            </div>

            <button onClick={handleSearch} className="h-[50px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-7 rounded-xl flex items-center justify-center gap-2 shadow-brand transition-all self-end">
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        {/* Quick route links */}
        <h2 className="font-display font-bold text-xl text-slate-900 mb-6">Quick Book — Top Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {topRoutes.map((r, i) => (
            <a key={i} href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`} className="group flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{r.from} → {r.to}</p>
                  <p className="text-xs text-green-600 font-bold">From ₹{r.price}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
            </a>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: 'Safe & Secure', desc: 'All payments are encrypted and your personal data is protected.' },
            { icon: Clock, title: 'Instant Confirmation', desc: 'Get your e-ticket instantly after booking. No waiting needed.' },
            { icon: Zap, title: 'Easy Cancellation', desc: 'Cancel anytime with hassle-free refunds within 24 hours.' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <item.icon size={24} className="text-brand-500 mb-3" />
              <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
