'use client'

import { ArrowRight, Clock, Bus, Flame, TrendingUp, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const allRoutes = [
  { from: 'Mumbai', to: 'Pune', duration: '3 hrs', buses: 45, price: 199, hot: true },
  { from: 'Delhi', to: 'Agra', duration: '4 hrs', buses: 38, price: 249, hot: false },
  { from: 'Bangalore', to: 'Chennai', duration: '6 hrs', buses: 52, price: 399, hot: true },
  { from: 'Hyderabad', to: 'Vizag', duration: '8 hrs', buses: 29, price: 549, hot: false },
  { from: 'Indore', to: 'Bhopal', duration: '2.5 hrs', buses: 61, price: 149, hot: false },
  { from: 'Jaipur', to: 'Jodhpur', duration: '5 hrs', buses: 34, price: 299, hot: true },
  { from: 'Kolkata', to: 'Bhubaneswar', duration: '7 hrs', buses: 22, price: 449, hot: false },
  { from: 'Surat', to: 'Ahmedabad', duration: '3.5 hrs', buses: 47, price: 229, hot: false },
  { from: 'Chennai', to: 'Coimbatore', duration: '8 hrs', buses: 35, price: 499, hot: true },
  { from: 'Mumbai', to: 'Goa', duration: '10 hrs', buses: 56, price: 599, hot: true },
  { from: 'Delhi', to: 'Jaipur', duration: '5 hrs', buses: 42, price: 349, hot: false },
  { from: 'Bangalore', to: 'Mysore', duration: '3 hrs', buses: 38, price: 179, hot: false },
  { from: 'Pune', to: 'Nashik', duration: '4 hrs', buses: 28, price: 299, hot: false },
  { from: 'Hyderabad', to: 'Bangalore', duration: '9 hrs', buses: 44, price: 649, hot: true },
  { from: 'Lucknow', to: 'Varanasi', duration: '6 hrs', buses: 31, price: 399, hot: false },
  { from: 'Chandigarh', to: 'Delhi', duration: '5 hrs', buses: 52, price: 349, hot: false },
  { from: 'Ahmedabad', to: 'Mumbai', duration: '7 hrs', buses: 48, price: 499, hot: true },
  { from: 'Kochi', to: 'Bangalore', duration: '10 hrs', buses: 26, price: 699, hot: false },
  { from: 'Chennai', to: 'Hyderabad', duration: '8 hrs', buses: 33, price: 549, hot: false },
  { from: 'Udaipur', to: 'Jaipur', duration: '6 hrs', buses: 24, price: 399, hot: false },
  { from: 'Nagpur', to: 'Pune', duration: '9 hrs', buses: 22, price: 549, hot: false },
  { from: 'Goa', to: 'Bangalore', duration: '10 hrs', buses: 30, price: 649, hot: false },
  { from: 'Patna', to: 'Kolkata', duration: '7 hrs', buses: 18, price: 449, hot: false },
  { from: 'Dehradun', to: 'Delhi', duration: '6 hrs', buses: 36, price: 399, hot: false },
]

export default function RoutesPage() {
  const [search, setSearch] = useState('')

  const filteredRoutes = allRoutes.filter(r =>
    r.from.toLowerCase().includes(search.toLowerCase()) ||
    r.to.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">All Routes</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Popular Bus Routes
          </h1>
          <p className="text-white/60 text-base mb-6">
            Explore all popular bus routes across India. Click any route to book tickets.
          </p>

          {/* Search bar */}
          <div className="max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search routes by city..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm font-medium outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Routes grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-sm text-slate-500 mb-6">{filteredRoutes.length} routes found</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRoutes.map((r, i) => (
            <a
              key={i}
              href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
              className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top gradient accent */}
              <div className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-5">
                {r.hot && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full">
                    <Flame size={10} /> HOT
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <span className="font-bold text-slate-800 text-[15px]">{r.from}</span>
                  <div className="flex items-center gap-1 flex-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-300" />
                    <div className="flex-1 h-px bg-gradient-to-r from-brand-200 to-purple-200" />
                    <ArrowRight size={12} className="text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-brand-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                  </div>
                  <span className="font-bold text-slate-800 text-[15px]">{r.to}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{r.duration}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Bus size={12} />
                    <span>{r.buses} buses</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Starting from</span>
                    <p className="font-bold text-lg text-green-600">₹{r.price}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium text-slate-600 mb-2">No routes found for &quot;{search}&quot;</p>
            <button onClick={() => setSearch('')} className="text-brand-500 text-sm font-semibold hover:underline">Clear search</button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
