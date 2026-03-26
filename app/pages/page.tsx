'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState(0)

  useEffect(() => {
    fetch('/api/pagelist.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => {
        if (d.Result === 'true' && d.pagelist) setPages(d.pagelist)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><FileText size={16} className="text-white" /></div>
            <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Policies & Information</h1>
          <p className="text-white/60 text-base">Terms of Service, Privacy Policy & more</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="text-center py-20"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">No pages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {/* Sidebar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 h-fit sticky top-24 shadow-sm">
              {pages.map((p, i) => (
                <button key={i} onClick={() => setActivePage(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activePage === i ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  {p.title}
                </button>
              ))}
            </div>
            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="font-bold text-2xl text-slate-800 mb-6 pb-4 border-b border-slate-100">
                {pages[activePage]?.title}
              </h2>
              <div className="prose prose-slate prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: pages[activePage]?.description || '' }} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
