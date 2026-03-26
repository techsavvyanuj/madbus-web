'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeftRight, Search, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'
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
  
  // Home Data states
  const [banners, setBanners] = useState<any[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [currency, setCurrency] = useState('₹')
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // City list
    fetch('/api/citylist.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(data => {
        if (data.Result === 'true') {
          setCities(data.citylist.map((c: any) => ({ ...c, title: c.title.trim() })))
        }
      }).catch(e => console.error(e))

    // Home Data
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('madbus_user') : null
    const uid = userStr ? JSON.parse(userStr).id : "0"
    fetch('/api/home_data.php', { method: 'POST', body: JSON.stringify({ uid }) })
      .then(r => r.json())
      .then(data => {
        if (data.Result === 'true') {
          if (data.banner?.length > 0) setBanners(data.banner)
          if (data.currency) setCurrency(data.currency === 'Rs' ? '₹' : data.currency)
          if (data.tax) sessionStorage.setItem('madbus_tax', data.tax)
        }
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  function getSuggestions(val: string) {
    if (!val || val.length < 1) return []
    return cities.filter(c => c.title.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5)
  }

  function swap() {
    const oldFrom = from
    setFrom(to)
    setTo(oldFrom)
  }

  function handleSearch() {
    setError('')
    if (!from.trim() || !to.trim()) { setError('Please select cities from suggestions.'); return }
    const fromCity = cities.find(c => c.title.toLowerCase() === from.trim().toLowerCase())
    const toCity = cities.find(c => c.title.toLowerCase() === to.trim().toLowerCase())
    if (!fromCity || !toCity) { setError('Please select valid cities.'); return }
    if (fromCity.id === toCity.id) { setError('From and To cannot be same.'); return }
    if (!date) { setError('Select date.'); return }

    const params = new URLSearchParams({ 
      fromId: fromCity.id, fromName: fromCity.title, 
      toId: toCity.id, toName: toCity.title, date 
    })
    if (tripType === 'roundtrip' && returnDate) params.set('returnDate', returnDate)
    router.push(`/search?${params.toString()}`)
  }

  const setQuickDate = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <>
      <div className="relative overflow-hidden min-h-[500px] flex flex-col">
        {banners.length > 0 ? (
          <div className="absolute inset-0 z-0">
            {banners.map((b, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                <img src={`https://admin.madbus.in/${b.img}`} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-brand-700/40" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Image src={heroPoster} alt="Hero" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-brand-700/35" />
          </>
        )}

        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-32 md:pb-36 w-full">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              2,000+ routes · {currency} Lowest Price
            </div>
            <h1 className="font-display text-4xl md:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-4">
              Your next journey<br />
              <em className="not-italic text-yellow-300">starts here.</em>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 mb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <div className="flex gap-1 mb-8 bg-slate-50 p-1 rounded-xl w-fit">
            {(['oneway', 'roundtrip'] as const).map(type => (
              <button key={type} onClick={() => setTripType(type)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tripType === type ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {type === 'oneway' ? 'One Way' : 'Round Trip'}
              </button>
            ))}
          </div>

          {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-4 items-end">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Departure</label>
              <div className="relative group">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 group-focus-within:scale-110 transition-transform" />
                <input type="text" placeholder="From City" value={from} onChange={e => { setFrom(e.target.value); setFromSuggestions(getSuggestions(e.target.value)) }}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 focus:border-brand-400 focus:bg-white rounded-2xl text-slate-800 font-bold outline-none transition-all placeholder:text-slate-400" />
                {fromSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {fromSuggestions.map((c, i) => (
                      <button key={i} onClick={() => { setFrom(c.title); setFromSuggestions([]) }} className="w-full text-left px-5 py-3.5 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors">
                        <MapPin size={14} className="text-slate-300" /> {c.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={swap} className="hidden md:flex bg-brand-50 text-brand-500 w-11 h-11 rounded-xl items-center justify-center hover:bg-brand-500 hover:text-white transition-all duration-300 shadow-sm mb-1.5 rotate-0 active:rotate-180">
              <ArrowLeftRight size={18} />
            </button>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Destination</label>
              <div className="relative group">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 group-focus-within:scale-110 transition-transform" />
                <input type="text" placeholder="To City" value={to} onChange={e => { setTo(e.target.value); setToSuggestions(getSuggestions(e.target.value)) }}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 focus:border-brand-400 focus:bg-white rounded-2xl text-slate-800 font-bold outline-none transition-all placeholder:text-slate-400" />
                {toSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {toSuggestions.map((c, i) => (
                      <button key={i} onClick={() => { setTo(c.title); setToSuggestions([]) }} className="w-full text-left px-5 py-3.5 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors">
                        <MapPin size={14} className="text-slate-300" /> {c.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Journey Date</label>
              <div className="relative group">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 group-focus-within:scale-110 transition-transform pointer-events-none" />
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 focus:border-brand-400 focus:bg-white rounded-2xl text-slate-800 font-bold outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => setQuickDate(0)} className="px-4 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-all bg-slate-50">Today</button>
            <button onClick={() => setQuickDate(1)} className="px-4 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-all bg-slate-50">Tomorrow</button>
            <button onClick={() => setQuickDate(2)} className="px-4 py-1.5 rounded-full border border-slate-100 text-xs font-bold text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-all bg-slate-50">Day After</button>
          </div>

          <button onClick={handleSearch}
            className="w-full mt-8 bg-brand-500 hover:bg-brand-600 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-brand hover:shadow-brand-hover active:scale-[0.99] group">
            <Search size={22} className="group-hover:scale-110 transition-transform" />
            <span className="text-lg">Search Buses</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform opacity-50" />
          </button>
        </div>
      </div>
    </>
  )
}
