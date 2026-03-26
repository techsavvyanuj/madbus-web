'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, ChevronDown, Phone, Mail, MessageCircle, MapPin, Clock, Shield, CreditCard, XCircle, Search, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const contactOptions = [
  { icon: Phone, title: 'Call Us', desc: '+91 8827 150 778', action: 'tel:+918827150778', label: 'Available 24/7' },
  { icon: Mail, title: 'Email Us', desc: 'support@madbus.in', action: 'mailto:support@madbus.in', label: 'Response within 4 hours' },
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our team', action: '#', label: 'Online now' },
]

export default function HelpPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'faq' | 'privacy'>('faq')

  useEffect(() => {
    // Fetch FAQs
    fetch('/api/faq.php', {
      method: 'POST',
      body: JSON.stringify({ uid: "0" })
    })
      .then(r => r.json())
      .then(data => {
        if (data.Result === "true" && data.FaqData) setFaqs(data.FaqData)
      })
      .catch(e => console.error("FAQ Error:", e))

    // Fetch Pages (Privacy, Terms, etc.)
    fetch('/api/pagelist.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(data => {
        if (data.pagelist) setPages(data.pagelist)
      })
      .catch(e => console.error("Pages Error:", e))
      .finally(() => setLoading(false))
  }, [])

  const filteredFaqs = faqs.filter(f =>
    String(f.question).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(f.answer).toLowerCase().includes(searchQuery.toLowerCase())
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
              <HelpCircle size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Support</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Help Center</h1>
          <p className="text-white/60 text-base mb-6">Find answers to your questions or get in touch with our support team</p>

          <div className="max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm font-medium outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs for FAQ vs Policies */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-12 shadow-sm border border-slate-200 max-w-sm">
          <button onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'faq' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
            FAQs
          </button>
          <button onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'privacy' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Privacy & Terms
          </button>
        </div>

        {activeTab === 'faq' ? (
          <>
            {/* Contact cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {contactOptions.map((opt, i) => (
                <a key={i} href={opt.action} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <opt.icon size={22} className="text-brand-500" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{opt.title}</h3>
                  <p className="text-sm text-brand-500 font-medium mb-1">{opt.desc}</p>
                  <p className="text-xs text-slate-400">{opt.label}</p>
                </a>
              ))}
            </div>

            <h2 className="font-display font-bold text-2xl text-slate-900 mb-8">Frequently Asked Questions</h2>

            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800 text-sm">{faq.question}</span>
                        <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 animate-fade-in text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {filteredFaqs.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium text-slate-600 mb-2">No FAQs found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
            <div className="space-y-2">
              {pages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.getElementById(`page-${i}`)
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:text-brand-600 border border-transparent hover:border-slate-100 transition-all flex items-center gap-2"
                >
                  <FileText size={16} className="text-slate-400" /> {p.title}
                </button>
              ))}
            </div>
            <div className="space-y-12">
              {pages.map((p, i) => (
                <div key={i} id={`page-${i}`} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <h2 className="font-display font-bold text-2xl text-slate-900 mb-6 pb-4 border-b border-slate-50">{p.title}</h2>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
