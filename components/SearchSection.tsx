'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeftRight, Search, MapPin, Calendar } from 'lucide-react'
import { POPULAR_CITIES } from '@/lib/data'
import heroPoster from '../2304.w064.n002.76B.p1.76.jpg'

export default function SearchSection() {
  const router = useRouter()
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [returnDate, setReturnDate] = useState('')
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([])
  const [toSuggestions, setToSuggestions] = useState<any[]>([])
  const [error, setError] = useState('')
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

  function swap() {
    setFrom(to)
    setTo(from)
  }

  function handleSearch() {
    setError('')
    if (!from.trim() || !to.trim()) { setError('Please select both departure and destination cities from the suggestions.'); return }
    
    const fromCity = cities.find(c => c.title.toLowerCase() === from.trim().toLowerCase())
    const toCity = cities.find(c => c.title.toLowerCase() === to.trim().toLowerCase())
    
    if (!fromCity || !toCity) { setError('Please select valid cities from the dropdown suggestions.'); return }
    if (fromCity.id === toCity.id) { setError('Departure and destination cannot be the same city.'); return }
    if (!date) { setError('Please select a journey date.'); return }
    
    // Navigate to search results page
    const params = new URLSearchParams({ 
      fromId: fromCity.id, 
      fromName: fromCity.title, 
      toId: toCity.id, 
      toName: toCity.title, 
      date 
    })
    
    if (tripType === 'roundtrip' && returnDate) params.set('returnDate', returnDate)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <Image
          src={heroPoster}
          alt="Bus journey poster"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-brand-700/35" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Diagonal accent */}
        <div className="absolute right-0 top-0 w-[480px] h-[480px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-32 md:pb-36">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              2,000+ routes · Instant confirmation
            </div>
            <h1 className="font-display text-4xl md:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-4">
              Your next journey<br />
              <em className="not-italic text-yellow-300">starts here.</em>
            </h1>
            <p className="text-white/75 text-base md:text-lg font-normal leading-relaxed">
              Book bus tickets across India in under 2 minutes. Verified operators, real-time seats, easy cancellation.
            </p>
          </div>
        </div>
      </div>

      {/* Search Card — overlapping the hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 -mt-20 md:-mt-24 mb-10">
        <div className="bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.12)] overflow-visible border border-slate-100">
          {/* Trip type tabs */}
          <div className="flex items-center gap-1 px-6 pt-5 pb-0">
            {(['oneway', 'roundtrip'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tripType === t
                    ? 'bg-brand-50 text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t === 'oneway' ? 'One Way' : 'Round Trip'}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1px_1fr_auto] gap-3 items-end">

              {/* FROM */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">From</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    value={from}
                    onChange={e => { setFrom(e.target.value); setFromSuggestions(getSuggestions(e.target.value)) }}
                    onBlur={() => setTimeout(() => setFromSuggestions([]), 150)}
                    placeholder="Departure city"
                    className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-colors bg-slate-50/50 focus:bg-white"
                  />
                  {fromSuggestions.length > 0 && (
                    <SuggestionDropdown items={fromSuggestions} onSelect={v => { setFrom(v); setFromSuggestions([]) }} />
                  )}
                </div>
              </div>

              {/* SWAP */}
              <button
                onClick={swap}
                className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all self-end mb-0.5 mx-auto"
                title="Swap cities"
              >
                <ArrowLeftRight size={15} />
              </button>

              {/* TO */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">To</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
                  <input
                    value={to}
                    onChange={e => { setTo(e.target.value); setToSuggestions(getSuggestions(e.target.value)) }}
                    onBlur={() => setTimeout(() => setToSuggestions([]), 150)}
                    placeholder="Destination city"
                    className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-colors bg-slate-50/50 focus:bg-white"
                  />
                  {toSuggestions.length > 0 && (
                    <SuggestionDropdown items={toSuggestions} onSelect={v => { setTo(v); setToSuggestions([]) }} />
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-slate-200 self-stretch my-1" />

              {/* DATE */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Date of Journey</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 outline-none transition-colors bg-slate-50/50 focus:bg-white"
                  />
                </div>
                {tripType === 'roundtrip' && (
                  <div className="relative mt-2">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                    <input
                      type="date"
                      value={returnDate}
                      min={date || today}
                      onChange={e => setReturnDate(e.target.value)}
                      placeholder="Return date"
                      className="w-full pl-9 pr-3 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm font-semibold text-slate-800 outline-none transition-colors bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={handleSearch}
                className="h-[50px] bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-7 rounded-xl flex items-center justify-center gap-2 shadow-brand hover:shadow-brand-lg transition-all active:scale-[0.98] whitespace-nowrap self-end"
              >
                <Search size={16} />
                Search Buses
              </button>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full inline-block" />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function SuggestionDropdown({ items, onSelect }: { items: any[]; onSelect: (v: string) => void }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden animate-slide-down">
      {items.map(item => (
        <button
          key={item.id}
          onMouseDown={() => onSelect(item.title)}
          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2.5 transition-colors"
        >
          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
          {item.title}
        </button>
      ))}
    </div>
  )
}
