'use client'

import { useState, useEffect } from 'react'
import { Ticket, Search, LogIn, Calendar, Clock, MapPin } from 'lucide-react'
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
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-brand active:scale-[0.98]"
              >
                <LogIn size={18} />
                Login to view trips
              </button>
              <a href="/bus-tickets" className="flex items-center gap-2 text-brand-500 font-semibold px-6 py-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 transition-all">
                <Search size={16} />
                Book a bus
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
    </>
  )
}

function TripsDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('Pending')
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      }).catch(e => alert("Error cancelling!"))
  }

  return (
    <div>
      <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 shadow-sm border border-slate-200">
        {['Pending', 'Completed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
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
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-hover transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 border-b border-slate-100 pb-3 gap-2">
                 <div>
                   <h3 className="font-bold text-lg text-slate-800">{t.bus_name}</h3>
                   <span className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded">{t.bus_no}</span>
                 </div>
                 <div className="text-left sm:text-right">
                   <div className="text-lg font-bold text-slate-800">₹{t.subtotal}</div>
                   <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm">{t.bus_picktime}</span>
                    <span className="text-xs text-slate-500">{t.boarding_city}</span>
                 </div>
                 <div className="flex-1 max-w-[100px] h-px bg-slate-200 relative">
                    <div className="w-2 h-2 bg-brand-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <div className="flex flex-col text-right">
                    <span className="font-bold text-slate-700 text-sm">{t.bus_droptime}</span>
                    <span className="text-xs text-slate-500">{t.drop_city}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="text-xs text-slate-500 font-medium">Date: <span className="font-bold text-slate-700">{t.book_date}</span></div>
                 {activeTab === 'Pending' && (
                   <button onClick={() => cancelTrip(t.ticket_id, t.subtotal)} className="text-xs font-bold text-red-500 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
                     Cancel Ticket
                   </button>
                 )}
                 {activeTab === 'Cancelled' && (
                   <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 tracking-wider">CANCELLED</span>
                 )}
                 {activeTab === 'Completed' && (
                   <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 tracking-wider">COMPLETED</span>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
