'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, Wifi, Coffee, Plug, Wind, ChevronDown, SlidersHorizontal, ArrowLeft, MapPin, Calendar, Bus, ArrowRight } from 'lucide-react'
import { MOCK_BUSES } from '@/lib/data'
import AuthModal from '@/components/AuthModal'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const FILTERS = ['All', 'AC Sleeper', 'Non-AC', 'Volvo', 'Seater']

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchPage />
    </Suspense>
  )
}

function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Backwards compatibility for old params
  const fromName = searchParams.get('fromName') || searchParams.get('from') || ''
  const toName = searchParams.get('toName') || searchParams.get('to') || ''
  const fromId = searchParams.get('fromId') || ''
  const toId = searchParams.get('toId') || ''
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')
  const [authOpen, setAuthOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<any>(null)
  
  const [buses, setBuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If we don't have IDs, we might be navigating from old links. 
    // Ideally we should resolve IDs, but for now we skip if no ID.
    if (!fromId || !toId || !date) {
      setLoading(false)
      return
    }

    setLoading(true)
    const payload = {
      uid: "0", 
      boarding_id: fromId,
      drop_id: toId,
      trip_date: date,
      sort: 1, 
      pickupfilter: 0,
      dropfilter: 0,
      bustype: 0,
      operatorlist: "0",
      facilitylist: "0"
    }

    fetch('/api/bus_search.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.Result === "true" && Array.isArray(data.BusData)) {
          setBuses(data.BusData)
        } else {
          setBuses([])
        }
      })
      .catch(err => {
        console.error("Failed to fetch buses:", err)
        setBuses([])
      })
      .finally(() => setLoading(false))
  }, [fromId, toId, date])

  // Format date for display
  const formatted = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  // Filtering (basic client side filter as an example)
  const filtered = buses.filter(b => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'AC Sleeper') return b.bus_ac === 1 && b.is_sleeper === 1
    if (activeFilter === 'Non-AC') return b.bus_ac === 0
    if (activeFilter === 'Volvo') return b.bus_title.toLowerCase().includes('volvo')
    if (activeFilter === 'Seater') return b.is_sleeper === 0
    return true
  })

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return parseFloat(a.ticket_price) - parseFloat(b.ticket_price)
    if (sortBy === 'rating') return parseFloat(b.bus_rate || '0') - parseFloat(a.bus_rate || '0')
    if (sortBy === 'departure') return a.bus_picktime.localeCompare(b.bus_picktime)
    return 0
  })

  function handleBook(bus: any) {
    if (typeof window !== 'undefined') {
      // Save full bus data so the booking page doesn't have to re-fetch the entire search
      sessionStorage.setItem('selected_bus', JSON.stringify(bus))
      
      const params = new URLSearchParams()
      params.set('date', date)
      params.set('fromId', fromId)
      params.set('toId', toId)
      router.push(`/book/${bus.bus_id}?${params.toString()}`)
    }
  }

  return (
    <>
      <Navbar />

      {/* Search header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <a href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Back to search
          </a>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-white mb-1">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-white/60" />
                  <span className="font-display font-bold text-2xl">{fromName || 'Origin'}</span>
                </div>
                <ArrowRight size={18} className="text-white/40" />
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-white/60" />
                  <span className="font-display font-bold text-2xl">{toName || 'Destination'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{formatted}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Bus size={13} />
                  <span>{loading ? 'Searching...' : `${sorted.length} buses found`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[50vh]">
        {/* Filters & Sort */}
        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3 flex-wrap shadow-card">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeFilter === f ? 'bg-brand-500 text-white shadow-brand' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rated</option>
              <option value="departure">Departure Time</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Finding best buses for your route...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium text-slate-600 mb-2">No buses match this filter</p>
              <button onClick={() => setActiveFilter('All')} className="text-brand-500 text-sm font-semibold hover:underline">Clear filters</button>
            </div>
          ) : (
            sorted.map((bus, i) => (
              <BusCard key={i} bus={bus} onBook={() => handleBook(bus)} />
            ))
          )}
        </div>
      </div>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} bookingFor={selectedBus ?? undefined} />
    </>
  )
}

function BusCard({ bus, onBook }: { bus: any; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const amenityIcons: Record<string, React.ReactNode> = {
    WiFi: <Wifi size={12} />, Charging: <Plug size={12} />, Refreshments: <Coffee size={12} />, AC: <Wind size={12} />
  }

  const typeStr = `${bus.bus_ac == 1 ? 'AC' : 'Non-AC'} ${bus.is_sleeper == 1 ? 'Sleeper' : 'Seater'}`
  const ratingNum = parseFloat(bus.bus_rate || '0')
  const ratingStr = ratingNum.toFixed(1)
  const isTopRated = ratingNum >= 4.0
  const amenities = (bus.bus_facilities || []).map((f: any) => f.facilityname).filter(Boolean)

  // Format time (e.g., 20:00:00 -> 8:00 PM)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(parseInt(h, 10), parseInt(m, 10))
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:border-slate-200">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className="font-bold text-slate-800">{bus.bus_title}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                bus.bus_ac == 1 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{typeStr}</span>
              {isTopRated && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-600">Top Rated</span>
              )}
            </div>

            {/* Times */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="font-bold text-slate-900 text-lg leading-none">{formatTime(bus.bus_picktime)}</p>
                <p className="text-xs text-slate-400 mt-1">{bus.boarding_city}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[200px]">
                <span className="text-xs text-slate-400 font-medium">{bus.Difference_pick_drop}</span>
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-lg leading-none">{formatTime(bus.bus_droptime)}</p>
                <p className="text-xs text-slate-400 mt-1">{bus.drop_city}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex items-center gap-2 flex-wrap">
              {amenities.map((a: string, idx: number) => (
                <span key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
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
              <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed animate-fade-in border border-slate-100">
                <strong className="text-slate-700">Bus No:</strong> {bus.bus_no} &nbsp;·&nbsp;
                <strong className="text-slate-700">Cancellation:</strong> Checked by operator &nbsp;·&nbsp;
                <strong className="text-slate-700">Reviews:</strong> {bus.total_review} verified reviews
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900 leading-none">₹{bus.ticket_price}</p>
              <p className="text-xs text-slate-400 mt-0.5">per seat</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-green-700">{ratingStr}</span>
            </div>
            <p className="text-xs font-semibold text-orange-500">{bus.left_seat} seats left</p>
            <button
              onClick={onBook}
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all hover:shadow-brand active:scale-[0.97] whitespace-nowrap"
            >
              Select Seat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
