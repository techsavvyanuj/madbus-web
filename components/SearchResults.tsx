'use client'

import { useState } from 'react'
import { X, Star, Wifi, Coffee, Plug, Wind, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { MOCK_BUSES } from '@/lib/data'
import AuthModal from './AuthModal'

interface Props {
  from: string
  to: string
  date: string
  onClose: () => void
}

const FILTERS = ['All', 'AC Sleeper', 'Non-AC', 'Volvo', 'Seater']

export default function SearchResults({ from, to, date, onClose }: Props) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')
  const [authOpen, setAuthOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<string | null>(null)

  const formatted = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const filtered = MOCK_BUSES.filter(b => activeFilter === 'All' || b.type.includes(activeFilter))
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'departure') return a.departs.localeCompare(b.departs)
    return 0
  })

  function handleBook(name: string) {
    setSelectedBus(name)
    setAuthOpen(true)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="bg-brand-600 px-6 py-5 flex items-start justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-3 text-white">
                <span className="font-display font-bold text-xl">{from}</span>
                <span className="text-white/50">—</span>
                <span className="font-display font-bold text-xl">{to}</span>
              </div>
              <p className="text-white/65 text-sm mt-0.5">{formatted} · {sorted.length} buses found</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/15 transition-colors mt-0.5">
              <X size={18} />
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between gap-3 flex-wrap flex-shrink-0 bg-slate-50/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === f ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price">Lowest Price</option>
                <option value="rating">Highest Rated</option>
                <option value="departure">Departure Time</option>
              </select>
            </div>
          </div>

          {/* Results list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {sorted.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-base font-medium">No buses match this filter.</p>
                <button onClick={() => setActiveFilter('All')} className="mt-2 text-brand-500 text-sm font-semibold">Clear filters</button>
              </div>
            ) : (
              sorted.map((bus, i) => (
                <BusCard key={i} bus={bus} onBook={() => handleBook(bus.name)} />
              ))
            )}
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} bookingFor={selectedBus ?? undefined} />
    </>
  )
}

function BusCard({ bus, onBook }: { bus: typeof MOCK_BUSES[0]; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const amenityIcons: Record<string, React.ReactNode> = {
    WiFi: <Wifi size={12} />, Charging: <Plug size={12} />, Refreshments: <Coffee size={12} />, AC: <Wind size={12} />
  }

  return (
    <div className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{bus.name}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              bus.type.includes('AC') ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
            }`}>{bus.type}</span>
            {bus.rating >= 4.6 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-600">Top Rated</span>
            )}
          </div>

          {/* Times */}
          <div className="flex items-center gap-3 mb-3">
            <div>
              <p className="font-bold text-slate-900 text-base leading-none">{bus.departs}</p>
              <p className="text-xs text-slate-400 mt-0.5">{bus.fromStop}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{bus.duration}</span>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 text-base leading-none">{bus.arrives}</p>
              <p className="text-xs text-slate-400 mt-0.5">{bus.toStop}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 flex-wrap">
            {bus.amenities.map(a => (
              <span key={a} className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {amenityIcons[a] ?? null} {a}
              </span>
            ))}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-brand-500 font-semibold flex items-center gap-0.5 hover:underline"
            >
              {expanded ? 'Less info' : 'More info'}
              <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {expanded && (
            <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed animate-fade-in">
              <strong className="text-slate-700">Boarding point:</strong> {bus.fromStop} &nbsp;·&nbsp;
              <strong className="text-slate-700">Cancellation:</strong> Free until 2 hrs before departure &nbsp;·&nbsp;
              <strong className="text-slate-700">Operator rating:</strong> ⭐ {bus.rating}/5 from 2,400+ reviews
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900 leading-none">₹{bus.price}</p>
            <p className="text-xs text-slate-400 mt-0.5">per seat</p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-green-700">{bus.rating}</span>
          </div>
          <p className="text-xs font-semibold text-orange-500">{bus.seats} seats left</p>
          <button
            onClick={onBook}
            className="mt-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:shadow-brand active:scale-[0.97] whitespace-nowrap"
          >
            Select Seat
          </button>
        </div>
      </div>
    </div>
  )
}
