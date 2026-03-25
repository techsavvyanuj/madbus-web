'use client'

import { ArrowRight, TrendingUp, Clock, Bus, Flame } from 'lucide-react'

const routes = [
  { from: 'Mumbai', to: 'Pune', duration: '3 hrs', buses: 45, price: 199, hot: true },
  { from: 'Delhi', to: 'Agra', duration: '4 hrs', buses: 38, price: 249, hot: false },
  { from: 'Bangalore', to: 'Chennai', duration: '6 hrs', buses: 52, price: 399, hot: true },
  { from: 'Hyderabad', to: 'Vizag', duration: '8 hrs', buses: 29, price: 549, hot: false },
  { from: 'Indore', to: 'Bhopal', duration: '2.5 hrs', buses: 61, price: 149, hot: false },
  { from: 'Jaipur', to: 'Jodhpur', duration: '5 hrs', buses: 34, price: 299, hot: true },
  { from: 'Kolkata', to: 'Bhubaneswar', duration: '7 hrs', buses: 22, price: 449, hot: false },
  { from: 'Surat', to: 'Ahmedabad', duration: '3.5 hrs', buses: 47, price: 229, hot: false },
]

export default function PopularRoutes() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-brand-500" />
            </div>
            <span className="text-brand-500 text-sm font-semibold uppercase tracking-widest">Popular Routes</span>
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900">Most booked today</h2>
          <p className="text-slate-500 text-sm mt-1">Discover the most popular bus routes across India</p>
        </div>
        <a href="/routes" className="group text-sm font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 px-4 py-2.5 rounded-xl transition-all">
          View all routes <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {routes.map((r, i) => (
          <a
            key={i}
            href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
            className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
          >
            {/* Top gradient accent */}
            <div className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-5">
              {/* Hot badge */}
              {r.hot && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full">
                  <Flame size={10} /> HOT
                </div>
              )}

              {/* Route */}
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

              {/* Info row */}
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

              {/* Price */}
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
    </section>
  )
}
