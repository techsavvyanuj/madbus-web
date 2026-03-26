'use client'

import { useState, useEffect } from 'react'
import { Ticket, Search, LogIn, ArrowLeft, X, MapPin, Clock, Calendar, CreditCard, User, QrCode, Download } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

export default function MyTripsPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('madbus_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch (e) { }
    }
    setLoading(false)
  }, [])

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">My Trips</h1>
          <p className="text-white/60 text-base">View and manage all your bookings in one place</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {!user ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Ticket size={36} className="text-brand-400" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">Login to view trips</h2>
            <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">
              Login to view your upcoming trips, past journeys, and manage your bookings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-brand active:scale-[0.98]">
                <LogIn size={18} /> Login to view trips
              </button>
              <a href="/bus-tickets" className="flex items-center gap-2 text-brand-500 font-semibold px-6 py-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 transition-all">
                <Search size={16} /> Book a bus
              </a>
            </div>
          </div>
        ) : (
          <TripsDashboard user={user} />
        )}

        {/* Info section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { emoji: '🎫', title: 'E-Tickets', desc: 'Access your tickets anytime, even offline' },
            { emoji: '🔔', title: 'Live Updates', desc: 'Track your bus in real-time with notifications' },
            { emoji: '💸', title: 'Easy Refunds', desc: 'Cancel and get refunds within 24 hours' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-100 cursor-default group">
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform origin-center">{item.emoji}</span>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

function TripsDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('Pending')
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [ticketDetail, setTicketDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ratingVal, setRatingVal] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

  useEffect(() => {
    fetchTrips(activeTab)
  }, [activeTab])

  function fetchTrips(status: string) {
    setLoading(true)
    fetch('/api/booking_history.php', {
      method: 'POST',
      body: JSON.stringify({ uid: user.id || "0", status })
    })
      .then(r => r.json())
      .then(data => {
        if (data.Result === "true" && data.tickethistory) {
          setTrips(data.tickethistory)
        } else {
          setTrips([])
        }
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }

  function openTicketDetail(t: any) {
    setSelectedTicket(t)
    setTicketDetail(null)
    setDetailLoading(true)

    fetch('/api/booking_details.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.id || "0", ticket_id: String(t.ticket_id) })
    })
      .then(r => r.json())
      .then(data => {
        if (data.Result === "true" && data.tickethistory?.length > 0) {
          setTicketDetail(data.tickethistory[0])
        }
      })
      .catch(() => { })
      .finally(() => setDetailLoading(false))
  }

  function cancelTrip(ticketId: string, subtotal: string) {
    if (!confirm("Are you sure you want to cancel this ticket?")) return
    fetch('/api/ticket_cancle.php', {
      method: 'POST',
      body: JSON.stringify({
        ticket_id: ticketId,
        uid: user.id || "0",
        total: subtotal,
        comment_reject: "User cancelled from web app"
      })
    })
      .then(r => r.json())
      .then(data => {
        alert(data.ResponseMsg || "Cancelled!")
        fetchTrips(activeTab)
        setSelectedTicket(null)
      }).catch(() => alert("Error cancelling!"))
  }

  function handleRate() {
    if (!ticketDetail) return
    setRatingSubmitting(true)
    fetch('/api/u_rate_update.php', {
      method: 'POST',
      body: JSON.stringify({
        uid: user.id || "0",
        ticket_id: String(selectedTicket.ticket_id),
        total_rate: String(ratingVal),
        rate_text: ratingComment
      })
    })
      .then(r => r.json())
      .then(d => {
        alert(d.ResponseMsg || "Rating updated!")
        setRatingOpen(false)
        openTicketDetail(selectedTicket) // Refresh
      })
      .finally(() => setRatingSubmitting(false))
  }

  const formatTime = (t: string) => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const d = new Date(); d.setHours(+h, +m)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  // ===== TICKET DETAIL MODAL =====
  if (selectedTicket) {
    const t = ticketDetail || selectedTicket
    const passengers = ticketDetail?.Order_Product_Data || []
    const qr = ticketDetail?.qrcode || null

    return (
      <div>
        <button onClick={() => setSelectedTicket(null)}
          className="inline-flex items-center gap-2 text-brand-600 font-semibold mb-6 hover:underline">
          <ArrowLeft size={16} /> Back to My Trips
        </button>

        {detailLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Loading ticket details...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Ticket header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Ticket #{t.ticket_id || selectedTicket.ticket_id}</p>
                  <h2 className="font-bold text-xl">{t.bus_name || selectedTicket.bus_name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-white/70 text-sm">
                    <span>{t.boarding_city || selectedTicket.boarding_city}</span>
                    <span>→</span>
                    <span>{t.drop_city || selectedTicket.drop_city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{t.total || t.subtotal || selectedTicket.subtotal}</p>
                  <p className="text-white/60 text-xs mt-0.5">Total Paid</p>
                </div>
              </div>

              {/* Route strip */}
              <div className="mt-5 bg-white/10 rounded-xl p-4 flex items-center gap-4">
                <div>
                  <p className="font-bold text-lg">{formatTime(t.bus_picktime || selectedTicket.bus_picktime)}</p>
                  <p className="text-white/70 text-xs">{t.boarding_city || selectedTicket.boarding_city}</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <p className="text-white/50 text-xs">{t.Difference_pick_drop || selectedTicket.Difference_pick_drop}</p>
                  <div className="flex items-center gap-1 w-full mt-1">
                    <div className="flex-1 h-px bg-white/30" />
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <div className="flex-1 h-px bg-white/30" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatTime(t.bus_droptime || selectedTicket.bus_droptime)}</p>
                  <p className="text-white/70 text-xs">{t.drop_city || selectedTicket.drop_city}</p>
                </div>
              </div>
            </div>

            {/* Dashed separator */}
            <div className="flex items-center px-6">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 -ml-9 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3" />
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 -mr-9 flex-shrink-0" />
            </div>

            <div className="p-6 space-y-6">
              {/* Journey info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Journey Date', value: t.book_date || selectedTicket.book_date, icon: '📅' },
                  { label: 'Seats', value: t.total_seat || passengers.length || selectedTicket.total_seat || '—', icon: '💺' },
                  { label: 'Payment', value: t.p_method_name || 'Paid', icon: '💳' },
                  { label: 'Transaction', value: (t.transaction_id || '—').slice(0, 12) + '...', icon: '🔖' },
                ].map((info, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-lg mb-0.5">{info.icon}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">{info.label}</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Passengers */}
              {passengers.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <User size={16} className="text-brand-500" /> Passengers
                  </h3>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      <span>Name</span><span>Age</span><span>Gender</span><span>Seat</span>
                    </div>
                    {passengers.map((p: any, i: number) => (
                      <div key={i} className={`grid grid-cols-4 px-4 py-3 text-sm ${i < passengers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-600">{p.age}</span>
                        <span className="text-slate-600">{p.gender}</span>
                        <span className="bg-brand-50 text-brand-600 font-bold text-xs px-2 py-0.5 rounded-lg border border-brand-100 inline-flex items-center">{p.seat_no}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              {ticketDetail && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[11px] text-slate-400">Name</p>
                      <p className="font-semibold text-slate-800">{ticketDetail.contact_name}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[11px] text-slate-400">Mobile</p>
                      <p className="font-semibold text-slate-800">{ticketDetail.contact_mobile}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[11px] text-slate-400">Email</p>
                      <p className="font-semibold text-slate-800 truncate">{ticketDetail.contact_email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {qr ? (
                    <div className="w-44 h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <img src={qr} alt="Ticket QR Code" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <QrCode size={36} />
                      <p className="text-xs text-center leading-tight">QR generates after<br/>admin approval</p>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Your E-Ticket QR Code</h4>
                  <p className="text-sm text-slate-500 mb-3">Show this QR code to the bus staff when boarding. The QR is generated once the admin processes your booking.</p>
                  <div className="bg-brand-50 rounded-lg px-3 py-2 inline-block border border-brand-100">
                    <p className="font-mono text-xs text-brand-700 font-bold">{t.transaction_id || '—'}</p>
                  </div>
                  {qr && (
                    <div className="mt-3">
                      <a href={qr} download target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors">
                        <Download size={13} /> Download QR
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {activeTab === 'Pending' && (
                  <button
                    onClick={() => cancelTrip(String(selectedTicket.ticket_id), String(t.subtotal || selectedTicket.subtotal))}
                    className="flex-1 h-12 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-colors">
                    Cancel Ticket
                  </button>
                )}
                {activeTab === 'Completed' && t.is_rate === "0" && (
                  <button
                    onClick={() => setRatingOpen(true)}
                    className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors">
                    Rate Trip
                  </button>
                )}
                <button onClick={() => setSelectedTicket(null)}
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Back to Trips
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-scale-in border border-slate-200 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Rate your journey 🚌</h3>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setRatingVal(v)} className={`text-3xl transition-all ${v <= ratingVal ? 'scale-110 drop-shadow-md' : 'opacity-30'}`}>
                    ⭐
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write a comment (optional)..."
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                className="w-full h-24 p-4 border-2 border-slate-100 focus:border-brand-400 rounded-2xl text-sm outline-none transition-all resize-none mb-6 font-medium"
              />

              <div className="flex gap-3">
                <button onClick={() => setRatingOpen(false)} className="flex-1 py-3.5 text-slate-400 font-bold">Cancel</button>
                <button
                  disabled={ratingSubmitting}
                  onClick={handleRate}
                  className="flex-1 bg-brand-500 text-white font-bold py-3.5 rounded-2xl shadow-brand disabled:opacity-50">
                  {ratingSubmitting ? '...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== TRIPS LIST =====
  return (
    <div>
      <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 shadow-sm border border-slate-200">
        {['Pending', 'Completed', 'Cancelled'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <span className="text-3xl">🚎</span>
          <h3 className="font-bold text-lg text-slate-800 mt-2">No {activeTab.toLowerCase()} trips found</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Book a bus to see your trips here.</p>
          <a href="/bus-tickets" className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-600 transition-colors">
            🚌 Search Buses
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((t, i) => (
            <div key={i}
              onClick={() => openTicketDetail(t)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-hover transition-all cursor-pointer hover:border-brand-200 group">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-600 transition-colors">{t.bus_name}</h3>
                  <span className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded">{t.bus_no}</span>
                </div>
                <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1">
                  <div className="text-lg font-bold text-slate-800">₹{t.subtotal}</div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wider ${
                    activeTab === 'Pending' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    activeTab === 'Completed' ? 'text-green-600 bg-green-50 border-green-200' :
                    'text-red-600 bg-red-50 border-red-200'
                  }`}>{activeTab.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-sm">{t.bus_picktime?.slice(0, 5)}</span>
                  <span className="text-xs text-slate-500">{t.boarding_city}</span>
                </div>
                <div className="flex-1 max-w-[100px] h-px bg-slate-200 relative">
                  <div className="w-2 h-2 bg-brand-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-slate-700 text-sm">{t.bus_droptime?.slice(0, 5)}</span>
                  <span className="text-xs text-slate-500">{t.drop_city}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  📅 <span className="font-bold text-slate-700">{t.book_date}</span>
                </div>
                <span className="text-xs text-brand-500 font-semibold group-hover:underline">View Ticket →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
