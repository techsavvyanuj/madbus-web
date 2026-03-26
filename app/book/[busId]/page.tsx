'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertCircle, Phone, Mail, MapPin, QrCode, User, Clock, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

export default function BookPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const busId = params?.busId as string
  const date = searchParams.get('date') || ''
  
  // step 1 = seat select, 2 = contact details, 3 = payment, 4 = confirmed
  const [step, setStep] = useState(1)
  const [bus, setBus] = useState<any>(null)
  const [layout, setLayout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  const [passengers, setPassengers] = useState<any[]>([])
  const [authOpen, setAuthOpen] = useState(false)

  // Contact / Boarding details
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  
  const [pickupStops, setPickupStops] = useState<any[]>([])
  const [dropStops, setDropStops] = useState<any[]>([])
  const [selectedPickup, setSelectedPickup] = useState<any>(null)
  const [selectedDrop, setSelectedDrop] = useState<any>(null)

  // Payment / coupon
  const [coupons, setCoupons] = useState<any[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [gateways, setGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState<any>(null)

  // Booking result
  const [bookingId, setBookingId] = useState<string>('')

  useEffect(() => {
    const savedBus = sessionStorage.getItem('selected_bus')
    let b: any = null
    if (savedBus) {
      b = JSON.parse(savedBus)
      setBus(b)
    }

    // Pre-fill contact from user
    const userStr = localStorage.getItem('madbus_user')
    if (userStr) {
      const u = JSON.parse(userStr)
      setContactName(u.name || '')
      setContactEmail(u.email || '')
      setContactPhone(u.mobile || '')
    }

    // Fetch Seat Layout
    fetch('/api/bus_layout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: "0", bus_id: busId, trip_date: date })
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
      .finally(() => {
        setLoading(false)
        // Fetch boarding points if id_pickup_drop exists
        if (b?.id_pickup_drop) {
          fetch('/api/boarding_dropping_point.php', {
            method: 'POST',
            body: JSON.stringify({ uid: "0", id_pickup_drop: b.id_pickup_drop })
          })
            .then(r => r.json())
            .then(d => {
              if (d.Result === "true") {
                setPickupStops(d.PickUpStops || [])
                setDropStops(d.DropStops || [])
                if (d.PickUpStops?.length > 0) setSelectedPickup(d.PickUpStops[0])
                if (d.DropStops?.length > 0) setSelectedDrop(d.DropStops[0])
              }
            })
            .catch(() => {})
        }
      })
  }, [busId, date])

  useEffect(() => {
    setPassengers(prev => selectedSeats.map(seat => {
      const existing = prev.find(p => p.seat_no === seat.seat_number)
      return existing || { seat_no: seat.seat_number, name: '', age: '', gender: 'Male' }
    }))
  }, [selectedSeats])

  function handleSeatClick(seat: any) {
    if (seat.is_booked) return
    if (selectedSeats.find(s => s.seat_number === seat.seat_number)) {
      setSelectedSeats(prev => prev.filter(s => s.seat_number !== seat.seat_number))
    } else {
      if (selectedSeats.length >= 6) return alert("Max 6 seats at once")
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

  function handleGoToContact() {
    if (selectedSeats.length === 0) return alert("Please select at least one seat")
    setStep(2)
  }

  function handleGoToPayment() {
    if (!contactName || !contactPhone || !contactEmail || !selectedPickup || !selectedDrop) {
      return alert("Please fill all contact details and select boarding/dropping points.")
    }
    setError('')
    setStep(3)
    // Fetch gateways and coupons
    const userStr = localStorage.getItem('madbus_user')
    const uid = userStr ? JSON.parse(userStr).id : "0"
    
    fetch('/api/paymentgateway.php', { method: 'POST', body: JSON.stringify({ uid }) })
      .then(r => r.json())
      .then(d => {
        if (d.Result === "true") {
          setGateways(d.paymentdata)
          if (d.paymentdata.length > 0) setSelectedGateway(d.paymentdata[0])
        }
      })
    
    fetch('/api/u_couponlist.php', { method: 'POST', body: JSON.stringify({ uid }) })
      .then(r => r.json())
      .then(d => {
        if (d.Result === "true") setCoupons(d.couponlist || [])
      })
  }

  async function handleFinalBook() {
    if (!selectedGateway) return alert("Select a payment method")
    
    const userStr = localStorage.getItem('madbus_user')
    if (!userStr) { setAuthOpen(true); return }
    const u = JSON.parse(userStr)

    setLoading(true)
    const subtotal = bus.bus_price * selectedSeats.length
    const couponDiscount = selectedCoupon ? (Number(selectedCoupon.coupon_val) || 0) : 0
    const taxPercent = typeof window !== 'undefined' ? Number(sessionStorage.getItem('madbus_tax') || '5') : 5
    const taxableAmount = subtotal - couponDiscount
    const taxAmt = Math.round(taxableAmount * (taxPercent / 100))
    const total = taxableAmount + taxAmt

    const payload = {
      uid: String(u.id),
      name: contactName,
      bus_id: String(busId),
      operator_id: String(bus.operator_id),
      email: contactEmail,
      ccode: "+91",
      mobile: contactPhone,
      tax_amt: String(taxAmt),
      pickup_id: String(selectedPickup.pick_id),
      drop_id: String(selectedDrop.drop_id),
      ticket_price: String(bus.bus_price),
      total: String(total),
      cou_amt: String(couponDiscount),
      boarding_city: bus.boarding_city,
      drop_city: bus.drop_city,
      wall_amt: "0",
      bus_picktime: bus.bus_picktime,
      bus_droptime: bus.bus_droptime,
      Difference_pick_drop: bus.Difference_pick_drop,
      book_date: date,
      total_seat: String(selectedSeats.length),
      payment_method_id: String(selectedGateway.id),
      transaction_id: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      seat_list: selectedSeats.map(s => s.seat_number).join(','),
      sub_pick_time: selectedPickup.pick_time,
      sub_pick_place: selectedPickup.pick_place,
      sub_pick_address: selectedPickup.pick_address,
      sub_pick_mobile: selectedPickup.pick_mobile,
      sub_drop_time: selectedDrop.drop_time,
      sub_drop_place: selectedDrop.drop_place,
      sub_drop_address: selectedDrop.drop_address,
      subtotal: String(subtotal),
      user_type: "User",
      commission: "0",
      comm_per: "1",
      PessengerData: passengers.map(p => ({
        name: p.name,
        age: String(p.age),
        seat_no: p.seat_no,
        gender: p.gender
      }))
    }

    try {
      const res = await fetch('/api/ticket_book.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.Result === "true") {
        setBookingId(payload.transaction_id)
        setStep(4)
      } else {
        setError(data.ResponseMsg || "Booking failed.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === 1) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error && step === 1) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-sm">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => router.back()} className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto py-2">
          {[
            { n: 1, label: 'Seats' },
            { n: 2, label: 'Details' },
            { n: 3, label: 'Payment' },
            { n: 4, label: 'Confirm' }
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm transition-all ${
                step >= s.n ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>{s.n}</div>
              <span className={`ml-2 text-sm font-bold whitespace-nowrap ${step >= s.n ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
              {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-3 sm:mx-4 ${step > s.n ? 'bg-brand-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[500px]">
            
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Select your seats</h2>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" /> Available</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-500" /> Selected</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-200" /> Booked</div>
                  </div>
                </div>

                {/* Seat Layout (Simplified visualization) */}
                <div className="max-w-sm mx-auto bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">
                  <div className="flex justify-end mb-10"><div className="w-10 h-10 rounded-lg border-2 border-slate-300 flex items-center justify-center text-slate-400">🧭</div></div>
                  <div className="grid grid-cols-4 gap-4">
                    {(layout?.seatdata || []).map((seat: any, i: number) => {
                      const isSelected = selectedSeats.find(s => s.seat_number === seat.seat_number)
                      return (
                        <button
                          key={i}
                          disabled={seat.is_booked}
                          onClick={() => handleSeatClick(seat)}
                          className={`h-12 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center ${
                            seat.is_booked ? 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed' :
                            isSelected ? 'bg-brand-500 border-brand-500 text-white shadow-brand scale-105' :
                            'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                          }`}
                        >
                          {seat.seat_number}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-50 flex justify-end">
                  <button onClick={handleGoToContact}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-brand flex items-center gap-2 group">
                    Next: Passenger Details <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 pt-2">
                    <MapPin size={22} className="text-brand-500" /> Select Points
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Boarding Point</label>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {pickupStops.map((stop: any, idx: number) => (
                          <button key={idx} onClick={() => setSelectedPickup(stop)}
                            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${selectedPickup?.pick_id === stop.pick_id ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 text-sm">{stop.pick_place}</span>
                              <span className="text-brand-600 font-bold text-xs">{stop.pick_time.slice(0, 5)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{stop.pick_address}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Drop Point</label>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {dropStops.map((stop: any, idx: number) => (
                          <button key={idx} onClick={() => setSelectedDrop(stop)}
                            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${selectedDrop?.drop_id === stop.drop_id ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 text-sm">{stop.drop_place}</span>
                              <span className="text-brand-600 font-bold text-xs">{stop.drop_time.slice(0, 5)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{stop.drop_address}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 pt-6">
                    <User size={22} className="text-brand-500" /> Passenger Details
                  </h3>
                  <div className="space-y-4">
                    {passengers.map((p, i) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passenger {i+1} Name (Seat {p.seat_no})</label>
                          <input type="text" value={p.name} onChange={e => handlePassengerUpdate(i, 'name', e.target.value)}
                            className="w-full h-12 bg-white px-4 rounded-xl border border-slate-200 focus:border-brand-400 outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                          <input type="number" value={p.age} onChange={e => handlePassengerUpdate(i, 'age', e.target.value)}
                            className="w-full h-12 bg-white px-4 rounded-xl border border-slate-200 focus:border-brand-400 outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                          <select value={p.gender} onChange={e => handlePassengerUpdate(i, 'gender', e.target.value)}
                            className="w-full h-12 bg-white px-4 rounded-xl border border-slate-200 focus:border-brand-400 outline-none transition-all text-sm">
                            <option>Male</option><option>Female</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 pt-6">
                    <Phone size={22} className="text-brand-500" /> Contact Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field icon={<Phone size={16} />} label="Mobile Number" value={contactPhone} onChange={setContactPhone} />
                    <Field icon={<Mail size={16} />} label="Email Address" value={contactEmail} onChange={setContactEmail} />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-50">
                  <button onClick={() => setStep(1)} className="font-bold text-slate-400 hover:text-slate-600 px-6">Back</button>
                  <button onClick={handleGoToPayment} className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-2xl shadow-brand">Proceed to Payment</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-800">Select Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gateways.map((g, i) => (
                    <button key={i} onClick={() => setSelectedGateway(g)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selectedGateway?.id === g.id ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <span className="text-3xl grayscale-[0.5]">{['💳','📱','🏦','💵'][i%4]}</span>
                      <div className="text-left"><p className="font-bold text-slate-800">{g.title}</p><p className="text-xs text-slate-400">Secure Payment</p></div>
                    </button>
                  ))}
                </div>

                {coupons.length > 0 && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3">Available Coupons</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {coupons.map((c, i) => (
                        <button key={i} onClick={() => setSelectedCoupon(c)}
                          className={`flex-shrink-0 p-4 rounded-2xl border-2 border-dashed transition-all text-left min-w-[180px] ${selectedCoupon?.id === c.id ? 'bg-orange-50 border-orange-400' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                          <p className="font-bold text-orange-600">{c.coupon_code}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Save ₹{c.coupon_val}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-50">
                  <button onClick={() => setStep(2)} className="font-bold text-slate-400">Back</button>
                  <button onClick={handleFinalBook} disabled={loading}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-12 py-4 rounded-2xl shadow-brand flex items-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Pay & Confirm'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-10 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-green-600" /></div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Booking Success!</h2>
                <p className="text-slate-500 mb-8">Ticket confirmed for {bus?.bus_title}</p>
                <div className="max-w-xs mx-auto bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                  <div className="w-40 h-40 bg-white rounded-xl border border-slate-200 mx-auto flex items-center justify-center mb-4"><QrCode size={48} className="text-slate-300" /></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="font-mono text-sm font-bold text-slate-800">{bookingId}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => router.push('/my-trips')} className="bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-600 transition-all">Go to My Trips</button>
                  <button onClick={() => router.push('/')} className="bg-slate-100 text-slate-700 font-bold px-8 py-3.5 rounded-xl hover:bg-slate-200 transition-all">Back to Home</button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Fare Summary */}
          <div className="space-y-6 lg:self-start">
            {bus && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-5">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600"><Clock size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{bus.bus_title}</h4>
                    <p className="text-xs text-slate-500">{date}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Base Fare ({selectedSeats.length} Seats)</span>
                    <span className="font-bold text-slate-800">₹{bus.bus_price * selectedSeats.length}</span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount ({selectedCoupon.coupon_code})</span>
                      <span className="font-bold">-₹{selectedCoupon.coupon_val}</span>
                    </div>
                  )}
                  {typeof window !== 'undefined' && (bus.bus_price * selectedSeats.length > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes & Fees ({sessionStorage.getItem('madbus_tax') || '5'}%)</span>
                      <span className="font-bold text-slate-800">
                        ₹{Math.round((bus.bus_price * selectedSeats.length - (selectedCoupon ? Number(selectedCoupon.coupon_val) : 0)) * (Number(sessionStorage.getItem('madbus_tax') || '5') / 100))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-600">
                    ₹{Math.round((bus.bus_price * selectedSeats.length - (selectedCoupon ? Number(selectedCoupon.coupon_val) : 0)) * (1 + (Number(typeof window !== 'undefined' ? sessionStorage.getItem('madbus_tax') : '0') || 5) / 100))}
                  </span>
                </div>
                
                {selectedSeats.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-2">
                    {selectedSeats.map((s, i) => <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">{s.seat_number}</span>)}
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-indigo-600 rounded-3xl p-6 text-white text-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <p className="font-bold mb-2 flex items-center gap-2 italic">MadBus Assurance 🛡️</p>
              <p className="text-white/80 leading-relaxed text-xs">Verified operators, no-questions-asked refunds, and 24/7 dedicated travel support for your journey.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

function Field({ icon, label, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="w-full h-12 pl-9 pr-4 bg-white border border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-all placeholder:text-slate-300" />
      </div>
    </div>
  )
}
