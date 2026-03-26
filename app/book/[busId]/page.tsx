'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

export default function BookPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const busId = params?.busId as string
  const date = searchParams.get('date') || ''
  const fromId = searchParams.get('fromId') || ''
  const toId = searchParams.get('toId') || ''
  
  const [bus, setBus] = useState<any>(null)
  const [layout, setLayout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  
  const [passengers, setPassengers] = useState<any[]>([])
  const [authOpen, setAuthOpen] = useState(false)
  
  const [step, setStep] = useState(1)
  const [coupons, setCoupons] = useState<any[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [gateways, setGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState<any>(null)

  useEffect(() => {
    const savedBus = sessionStorage.getItem('selected_bus')
    if (savedBus) {
      setBus(JSON.parse(savedBus))
    }
    
    // Fetch layout
    fetch('/api/bus_layout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: "0",
        bus_id: busId,
        trip_date: date
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.Result === "true" && data.BusLayoutData?.[0]) {
          setLayout(data.BusLayoutData[0])
        } else {
          setError(data.ResponseMsg || 'Could not fetch seat layout.')
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [busId, date])

  // Generate passenger inputs when seats change
  useEffect(() => {
    setPassengers(prev => {
      const newPassengers = selectedSeats.map(seat => {
        const existing = prev.find(p => p.seat_no === seat.seat_number)
        if (existing) return existing
        return { seat_no: seat.seat_number, name: '', age: '', gender: 'Male' }
      })
      return newPassengers
    })
  }, [selectedSeats])

  function handleSeatClick(seat: any) {
    if (seat.is_booked) return
    if (selectedSeats.find(s => s.seat_number === seat.seat_number)) {
      setSelectedSeats(prev => prev.filter(s => s.seat_number !== seat.seat_number))
    } else {
      if (selectedSeats.length >= 6) return alert("You can select max 6 seats at once")
      setSelectedSeats(prev => [...prev, seat])
    }
  }

  function handlePassengerUpdate(index: number, field: string, value: string) {
    setPassengers(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function handleProceedToCheckout() {
    const userStr = localStorage.getItem('madbus_user')
    if (!userStr) {
      setAuthOpen(true)
      return
    }
    for (const p of passengers) {
      if (!p.name || !p.age) {
        return alert("Please fill all passenger details")
      }
    }
    if (selectedSeats.length === 0) return alert("Please select at least one seat")
    
    // Fetch Gateways
    fetch('/api/paymentgateway.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => {
        if (d.Result === "true" && d.paymentdata) {
          setGateways(d.paymentdata)
          if (d.paymentdata.length > 0) setSelectedGateway(d.paymentdata[0])
        }
      })

    // Fetch Coupons
    const user = JSON.parse(userStr)
    fetch('/api/u_couponlist.php', {
      method: 'POST',
      body: JSON.stringify({ uid: user.id || "0", operator_id: bus?.operator_id || "0" })
    }).then(r => r.json()).then(d => {
      if (d.Result === "true" && d.couponlist) setCoupons(d.couponlist)
    })

    setStep(2)
  }

  async function handleBook() {
    const userStr = localStorage.getItem('madbus_user')
    if (!userStr || !selectedGateway) return
    const user = JSON.parse(userStr)
    
    let subtotal = parseFloat(bus?.ticket_price || bus?.point_price || layout?.ticket_price || 0) * selectedSeats.length
    let total = subtotal
    let cou_amt = 0

    if (selectedCoupon) {
      // Validate coupon API
      const creq = await fetch('/api/u_check_coupon.php', {
        method: 'POST', body: JSON.stringify({ uid: user.id || "0", cid: selectedCoupon.id })
      })
      const cres = await creq.json()
      if (cres.Result !== "true") {
        return alert("Coupon invalid!")
      }
      cou_amt = parseFloat(selectedCoupon.coupon_val || "0")
      total = total - cou_amt
    }

    const payload = {
      uid: user.id || "0",
      name: user.name || "User",
      bus_id: busId,
      operator_id: bus?.operator_id || "0",
      email: user.email || "",
      ccode: user.ccode || "+91",
      mobile: user.mobile || "",
      tax_amt: "0",
      pickup_id: bus?.id_pickup_drop || "0",
      drop_id: bus?.id_pickup_drop || "0",
      ticket_price: bus?.ticket_price || layout?.ticket_price || "0",
      total: String(total),
      cou_amt: String(cou_amt),
      boarding_city: bus?.boarding_city || "",
      drop_city: bus?.drop_city || "",
      wall_amt: "0",
      bus_picktime: bus?.bus_picktime || "",
      bus_droptime: bus?.bus_droptime || "",
      Difference_pick_drop: bus?.Difference_pick_drop || "",
      book_date: date,
      total_seat: String(selectedSeats.length),
      payment_method_id: selectedGateway.id,
      transaction_id: "TXN" + Date.now(),
      seat_list: selectedSeats.map(s => s.seat_number).join(','),
      sub_pick_time: bus?.bus_picktime || "",
      sub_pick_place: bus?.boarding_city || "",
      sub_pick_address: bus?.boarding_city || "",
      sub_pick_mobile: user.mobile || "0000000000",
      sub_drop_time: bus?.bus_droptime || "",
      sub_drop_place: bus?.drop_city || "",
      sub_drop_address: bus?.drop_city || "",
      subtotal: String(subtotal),
      user_type: user.user_type || "User",
      commission: bus?.agent_commission || "0",
      comm_per: "1",
      PessengerData: passengers
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ticket_book.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.Result === "true") {
        alert("Booking Confirmed Successfully!")
        router.push('/my-trips')
      } else {
        alert("Failed to book: " + (data.ResponseMsg || "Unknown error"))
      }
    } catch (e: any) {
      alert("Error booking ticket: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  function renderLayoutGrid(grid: any[], label: string) {
    if (!grid || grid.length === 0) return null
    return (
      <div className="mb-8">
        <h3 className="font-semibold text-slate-700 mb-4">{label}</h3>
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="w-12 border-r-2 border-slate-200 flex items-center justify-center">
             <div className="text-[10px] text-slate-400 font-bold -rotate-90 whitespace-nowrap tracking-widest uppercase">Front</div>
          </div>
          <div className="flex flex-col gap-3 p-4 border-2 border-slate-200 rounded-xl bg-slate-50 relative overflow-x-auto min-h-[120px]">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-3">
                {row.map((seat: any, sIdx: number) => {
                  if (!seat || !seat.seat_number) return <div key={sIdx} className="w-10 h-10 flex-shrink-0" />
                  
                  const isSelected = !!selectedSeats.find(s => s.seat_number === seat.seat_number)
                  
                  return (
                    <button
                      key={sIdx}
                      disabled={seat.is_booked}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-10 h-10 flex-shrink-0 rounded text-xs font-bold transition-all flex items-center justify-center border-t-4
                        ${seat.is_booked ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : 
                          isSelected ? 'bg-brand-500 text-white border-brand-700 shadow-lg scale-105' : 
                          'bg-white text-slate-600 border-green-400 hover:border-brand-500 hover:shadow-md'
                        }`}
                    >
                      {seat.seat_number}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  let finalSubtotal = parseFloat(bus?.ticket_price || bus?.point_price || layout?.ticket_price || 0) * selectedSeats.length
  let finalCoupon = parseFloat(selectedCoupon?.coupon_val || 0)
  let finalTotal = finalSubtotal - finalCoupon

  return (
    <>
      <Navbar />
      
      <div className="bg-slate-50 min-h-screen pb-20">
        <div className="bg-brand-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <button onClick={() => step === 2 ? setStep(1) : router.back()} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm font-medium">
              <ArrowLeft size={16} /> {step === 2 ? 'Back to Seat Selection' : 'Go Back'}
            </button>
            <h1 className="text-2xl font-bold font-display">{bus?.bus_title || 'Select Seats'}</h1>
            <p className="text-white/80 text-sm mt-1">{bus?.boarding_city} to {bus?.drop_city} · {date}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading && step === 1 ? (
            <div className="py-20 text-center text-slate-500">
               <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
               Loading seat layout...
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
              <p className="font-semibold text-slate-800">{error}</p>
            </div>
          ) : step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-6 mb-8 text-sm">
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-white border border-green-400 rounded border-t-4" /> Available</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-brand-500 border border-brand-700 rounded border-t-4" /> Selected</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-slate-200 border border-slate-300 rounded border-t-4" /> Booked</div>
                  </div>

                  {renderLayoutGrid(layout?.lower_layout, 'Lower Deck')}
                  {renderLayoutGrid(layout?.upper_layout, 'Upper Deck')}
                </div>
              </div>

              <div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Boarding Details</h3>
                  
                  {selectedSeats.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Please select at least one seat
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {passengers.map((p, i) => (
                          <div key={p.seat_no} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                            <div className="font-bold text-sm text-brand-600">Seat {p.seat_no}</div>
                            <input 
                              type="text" placeholder="Full Name" value={p.name} onChange={(e) => handlePassengerUpdate(i, 'name', e.target.value)}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none"
                            />
                            <div className="flex gap-3">
                              <input 
                                type="number" placeholder="Age" value={p.age} onChange={(e) => handlePassengerUpdate(i, 'age', e.target.value)}
                                className="w-20 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none"
                              />
                              <select 
                                value={p.gender} onChange={(e) => handlePassengerUpdate(i, 'gender', e.target.value)}
                                className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600 font-medium">Subtotal</span>
                          <span className="font-bold text-2xl text-slate-900">
                            ₹{finalSubtotal}
                          </span>
                        </div>
                        <button 
                          onClick={handleProceedToCheckout}
                          disabled={selectedSeats.length === 0}
                          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-brand hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Checkout Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
               <div className="space-y-6">
                  {/* Coupons */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Available Coupons</h3>
                    {coupons.length === 0 ? (
                       <p className="text-sm text-slate-500">No active coupons available for this route.</p>
                    ) : (
                       <div className="space-y-3">
                          {coupons.map((c, i) => (
                             <div 
                                key={i} 
                                onClick={() => setSelectedCoupon(c.id === selectedCoupon?.id ? null : c)}
                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center
                                  ${selectedCoupon?.id === c.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 bg-slate-50 hover:border-brand-200'}
                                `}
                             >
                               <div>
                                  <div className="font-bold text-slate-800 uppercase tracking-widest">{c.coupon_code}</div>
                                  <div className="text-sm text-slate-500">{c.coupon_title}</div>
                               </div>
                               <div className="font-bold text-green-600 text-lg">-₹{c.coupon_val}</div>
                             </div>
                          ))}
                       </div>
                    )}
                  </div>
                  
                  {/* Gateways */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                       {gateways.map((g, i) => {
                         const icons: Record<string,string> = {
                           'Razorpay': '💳', 'Paypal': '🅿️', 'Stripe': '⚡', 'PayStack': '🔵',
                           'FlutterWave': '🌊', 'Paytm': '💰', 'SenangPay': '🏦', 'MercadoPago': '🌎',
                           'Payfast': '⚡', 'Midtrans': '🏧', '2checkout': '2️⃣', 'Khalti Payment': '🔴',
                         }
                         const icon = icons[g.title] || '💳'
                         return (
                           <div 
                             key={i} 
                             onClick={() => setSelectedGateway(g)}
                             className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2
                                ${selectedGateway?.id === g.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-brand-200'}
                             `}
                           >
                             <span className="text-3xl">{icon}</span>
                             <div className="font-bold text-sm text-slate-800 text-center">{g.title}</div>
                           </div>
                         )
                       })}
                    </div>
                  </div>
               </div>

               {/* Right Summary */}
               <div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                     <h3 className="font-bold text-lg text-slate-800 mb-4">Summary</h3>
                     <div className="space-y-3 text-sm text-slate-600 mb-6 border-b border-slate-100 pb-6">
                        <div className="flex justify-between">
                           <span>Base Fare x{selectedSeats.length}</span>
                           <span className="font-semibold">₹{finalSubtotal}</span>
                        </div>
                        {selectedCoupon && (
                           <div className="flex justify-between text-green-600">
                             <span>Coupon ({selectedCoupon.coupon_code})</span>
                             <span className="font-semibold">-₹{finalCoupon}</span>
                           </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-100">
                           <span>Total</span>
                           <span>₹{finalTotal}</span>
                        </div>
                     </div>
                     <button 
                        onClick={handleBook}
                        disabled={loading || !selectedGateway}
                        className="w-full h-[54px] bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent flex-shrink-0 animate-spin rounded-full" /> : <CheckCircle2 size={20} />}
                        Pay & Confirm ₹{finalTotal}
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
