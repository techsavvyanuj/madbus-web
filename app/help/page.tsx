'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, ChevronDown, Phone, Mail, MessageCircle, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const contactOptions = [
  { icon: Phone, title: 'Call Us', desc: '+91 8827 150 778', action: 'tel:+918827150778', label: 'Available 24/7' },
  { icon: Mail, title: 'Email Us', desc: 'support@madbus.in', action: 'mailto:support@madbus.in', label: 'Response within 4 hours' },
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our team', action: '#', label: 'Online now' },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveFaqs, setLiveFaqs] = useState<any[]>([])
  const [faqLoading, setFaqLoading] = useState(true)

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('madbus_user') : null
    const uid = userStr ? JSON.parse(userStr)?.id || '0' : '0'

    fetch('/api/faq.php', {
      method: 'POST',
      body: JSON.stringify({ uid })
    })
      .then(r => r.json())
      .then(d => {
        if (d.Result === 'true' && d.FaqData) {
          setLiveFaqs(d.FaqData)
        }
      })
      .catch(() => {})
      .finally(() => setFaqLoading(false))
  }, [])

  // Fallback FAQs in case API returns empty
  const fallbackFaqs = [
    { question: 'How do I book a bus ticket?', answer: 'Simply enter your departure city, destination, and travel date on the search page. Browse available buses, select your preferred one, choose your seat, and complete the payment.' },
    { question: 'Can I book a ticket for someone else?', answer: 'Yes! During the booking process, you can enter the passenger details of the person traveling. The e-ticket will be sent to your registered email.' },
    { question: 'How do I cancel my booking?', answer: 'Go to "My Trips", find your booking, and click "Cancel". Refunds are processed based on the cancellation policy of the bus operator.' },
    { question: 'When will I receive my refund?', answer: 'Refunds are typically processed within 24 hours. The amount will be credited to your original payment method within 5-7 business days.' },
    { question: 'What payment methods are accepted?', answer: 'We accept UPI, debit/credit cards, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.' },
    { question: 'How do I track my bus?', answer: 'You can track your bus in real-time through the MadBus app. Go to "My Trips" and click on "Track Bus" for live location updates.' },
  ]

  const allFaqs = liveFaqs.length > 0
    ? liveFaqs.map(f => ({ question: f.question || f.title, answer: f.answer || f.description }))
    : fallbackFaqs

  const filtered = allFaqs.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><HelpCircle size={16} className="text-white" /></div>
            <span className="text-white/70 text-sm font-semibold uppercase tracking-widest">Support</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Help Center</h1>
          <p className="text-white/60 text-base mb-6">Find answers to your questions or get in touch with our support team</p>
          <div className="max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for help..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm font-medium outline-none focus:border-white/40 transition-colors" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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

        {/* FAQs */}
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-8">Frequently Asked Questions</h2>

        {faqLoading ? (
          <div className="py-10 text-center"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const isOpen = openFaq === String(i)
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(isOpen ? null : String(i))}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-800 text-sm">{item.question}</span>
                    <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 animate-fade-in">
                      <p className="text-sm text-slate-500 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && !faqLoading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium text-slate-600 mb-2">No results for &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery('')} className="text-brand-500 text-sm font-semibold hover:underline">Clear search</button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
