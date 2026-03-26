'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertCircle, Phone, Mail, MapPin, QrCode } from 'lucide-react'
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

  // step 1 = seat select, 2 = contact details, 3 = payment, 4 = confirmed
  const [step, setStep] = useState(1)
  const [bus, setBus] = useState<any>(null)
  const [layout, setLayout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  const [passengers, setPassengers] = useState<any[]>([])
  const [authOpen, setAuthOpen] = useState(false)

  // Contact details
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [boardingPoint, setBoardingPoint] = useState('')

  // Boarding/dropping points
  const [pickupStops, setPickupStops] = useState<any[]>([])
  const [dropStops, setDropStops] = useState<any[]>([])

  // Payment / coupon
  const [coupons, setCoupons] = useState<any[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [gateways, setGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState<any>(null)

  // Booking result
  const [bookingId, setBookingId] = useState<string>('')

  useEffect(() => {
    const savedBus = sessionStorage.getItem('selected_bus')
    if (savedBus) setBus(JSON.parse(savedBus))

    // Pre-fill contact from user
    const userStr = localStorage.getItem('madbus_user')
    if (userStr) {
      const u = JSON.parse(userStr)
      setContactName(u.name || '')
      setContactEmail(u.email || '')
      setContactPhone(u.mobile || '')
    }

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
      .finally(() => setLoading(false))

    // Fetch boarding/dropping points
    const savedBusData = sessionStorage.getItem('selected_bus')
    if (savedBusData) {
      const bd = JSON.parse(savedBusData)
      if (bd.id_pickup_drop) {
        fetch('/api/boarding_dropping_point.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: '0', id_pickup_drop: String(bd.id_pickup_drop) })
        }).then(r => r.json()).then(d => {
          if (d.Result === 'true') {
            setPickupStops(d.PickUpStops || [])
            setDropStops(d.DropStops || [])
          }
        }).catch(() => {})
      }
    }
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
    const userStr = localStorage.getItem('madbus_user')
    if (!userStr) { setAuthOpen(true); return }
    for (const p of passengers) {
      if (!p.name || !p.age) return alert("Please fill all passenger details")
    }
    if (selectedSeats.length === 0) return alert("Please select at least one seat")
    setStep(2)
  }

  function handleGoToPayment() {
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      return alert("Please fill all contact details")
    }

    const userStr = localStorage.getItem('madbus_user')
    if (!userStr) return
    const user = JSON.parse(userStr)

    // Fetch gateways & coupons
    fetch('/api/paymentgateway.php', { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => {
        if (d.paymentdata?.length > 0) {
          setGateways(d.paymentdata)
          setSelectedGateway(d.paymentdata[0])
        }
      })

    fetch('/api/u_couponlist.php', {
      method: 'POST',
      body: JSON.stringify({ uid: user.id || "0", operator_id: bus?.operator_id || "0" })
    }).then(r => r.json()).then(d => {
      if (d.Result === "true" && d.couponlist) setCoupons(d.couponlist)
    })

    setStep(3)
  }

  async function handleBook() {
    const userStr = localStorage.getItem('madbus_user')
    if (!userStr || !selectedGateway) return
    const user = JSON.parse(userStr)

    let subtotal = parseFloat(bus?.ticket_price || bus?.point_price || layout?.ticket_price || 0) * selectedSeats.length
    let cou_amt = selectedCoupon ? parseFloat(selectedCoupon.coupon_val || "0") : 0
    let total = subtotal - cou_amt

    if (selectedCoupon) {
      const creq = await fetch('/api/u_check_coupon.php', {
        method: 'POST', body: JSON.stringify({ uid: user.id || "0", cid: selectedCoupon.id })
      })
      const cres = await creq.json()
      if (cres.Result !== "true") return alert("Coupon invalid!")
    }

    const txnId = "TXN" + Date.now()
    const payload = {
      uid: user.id || "0",
      name: contactName || user.name || "User",
      email: contactEmail || user.email || "",
      mobile: contactPhone || user.mobile || "",
      ccode: user.ccode || "+91",
      bus_id: busId,
      operator_id: bus?.operator_id || "0",
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
      transaction_id: txnId,
      seat_list: selectedSeats.map(s => s.seat_number).join(','),
      sub_pick_time: bus?.bus_picktime || "",
      sub_pick_place: boardingPoint || bus?.boarding_city || "",
      sub_pick_address: boardingPoint || bus?.boarding_city || "",
      sub_pick_mobile: contactPhone || user.mobile || "0000000000",
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
        setBookingId(txnId)
        setStep(4)
      } else {
        alert("Booking failed: " + (data.ResponseMsg || "Unknown error. Are you logged in?"))
      }
    } catch (e: any) {
      alert("Error: " + e.message)
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
          <div className="flex flex-col gap-3 p-4 border-2 border-slate-200 rounded-xl bg-slate-50 overflow-x-auto min-h-[120px]">
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
                          'bg-white text-slate-600 border-green-400 hover:border-brand-500 hover:shadow-md'}`}
                    >{seat.seat_number}</button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const basePrice = parseFloat(bus?.ticket_price || bus?.point_price || layout?.ticket_price || 0)
  const finalSubtotal = basePrice * selectedSeats.length
  const finalCoupon = parseFloat(selectedCoupon?.coupon_val || 0)
  const finalTotal = finalSubtotal - finalCoupon

  const gatewayIcons: Record<string, string> = {
    'Razorpay': '💳', 'Paypal': '🅿️', 'Stripe': '⚡', 'PayStack': '🔵',
    'FlutterWave': '🌊', 'Paytm': '💰', 'SenangPay': '🏦', 'MercadoPago': '🌎',
    'Payfast': '⚡', 'Midtrans': '🏧', '2checkout': '2️⃣', 'Khalti Payment': '🔴',
  }

  const stepLabel = ['Select Seats', 'Contact Details', 'Payment', 'Confirmed!'][step - 1]
  const backFn = step === 1 ? () => router.back() :
    step === 2 ? () => setStep(1) :
    step === 3 ? () => setStep(2) : () => router.push('/my-trips')

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-brand-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {step < 4 && (
              <button onClick={backFn} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm font-medium">
                <ArrowLeft size={16} /> {step === 1 ? 'Go Back' : step === 2 ? 'Back to Seats' : 'Back to Contact'}
              </button>
            )}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold font-display">{step === 4 ? 'Booking Confirmed! 🎉' : (bus?.bus_title || 'Select Seats')}</h1>
                <p className="text-white/80 text-sm mt-1">{bus?.boarding_city} → {bus?.drop_city} · {date}</p>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {['Seats', 'Contact', 'Pay', '✓'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${step > i + 1 ? 'bg-green-400 text-white' : step === i + 1 ? 'bg-white text-brand-600' : 'bg-white/20 text-white/50'}`}>{s}</div>
                    {i < 3 && <div className={`w-6 h-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-white/20'}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ===== STEP 1: SEAT SELECTION ===== */}
          {step === 1 && (
            loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading seat layout...
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                <p className="font-semibold text-slate-800">{error}</p>
              </div>
            ) : (
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
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Passenger Details</h3>
                    {selectedSeats.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Select a seat to continue
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {passengers.map((p, i) => (
                          <div key={p.seat_no} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                            <div className="font-bold text-sm text-brand-600">Seat {p.seat_no}</div>
                            <input type="text" placeholder="Full Name" value={p.name}
                              onChange={e => handlePassengerUpdate(i, 'name', e.target.value)}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none" />
                            <div className="flex gap-3">
                              <input type="number" placeholder="Age" value={p.age}
                                onChange={e => handlePassengerUpdate(i, 'age', e.target.value)}
                                className="w-20 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none" />
                              <select value={p.gender} onChange={e => handlePassengerUpdate(i, 'gender', e.target.value)}
                                className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-brand-500 outline-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 border-t border-slate-200">
                          <div className="flex justify-between mb-3 text-sm text-slate-600">
                            <span>Subtotal ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                            <span className="font-bold text-slate-900">₹{finalSubtotal}</span>
                          </div>
                          <button onClick={handleGoToContact}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-brand hover:-translate-y-0.5">
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* ===== STEP 2: CONTACT DETAILS ===== */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                <h2 className="font-bold text-xl text-slate-800">Contact & Boarding Details</h2>
                <p className="text-sm text-slate-500">This info will appear on your ticket and is used by the operator.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <div className="relative">
                      <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">👤</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        placeholder="Email for ticket confirmation"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Boarding Point</label>
                    {pickupStops.length > 0 ? (
                      <div className="space-y-2">
                        {pickupStops.map((ps, i) => (
                          <div key={i}
                            onClick={() => setBoardingPoint(ps.pick_place)}
                            className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex justify-between items-center
                              ${boardingPoint === ps.pick_place ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                            <div className="flex items-center gap-3">
                              <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-sm text-slate-800">{ps.pick_place}</p>
                                <p className="text-xs text-slate-400">{ps.pick_address} · {ps.pick_time}</p>
                              </div>
                            </div>
                            {ps.pick_mobile && <span className="text-xs text-slate-400">📞 {ps.pick_mobile}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={boardingPoint} onChange={e => setBoardingPoint(e.target.value)}
                          placeholder={`Default: ${bus?.boarding_city || 'Main stop'}`}
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Seat summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Selected Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {passengers.map(p => (
                      <div key={p.seat_no} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
                        <span className="font-bold text-brand-600">Seat {p.seat_no}</span>
                        {p.name && <span className="text-slate-500"> · {p.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleGoToPayment}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-brand hover:-translate-y-0.5">
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: PAYMENT ===== */}
          {step === 3 && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">
              <div className="space-y-6">
                {/* Coupons */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Available Coupons</h3>
                  {coupons.length === 0 ? (
                    <p className="text-sm text-slate-400">No coupons available for this route.</p>
                  ) : (
                    <div className="space-y-3">
                      {coupons.map((c, i) => (
                        <div key={i}
                          onClick={() => setSelectedCoupon(c.id === selectedCoupon?.id ? null : c)}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center
                            ${selectedCoupon?.id === c.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 bg-slate-50 hover:border-brand-200'}`}>
                          <div>
                            <div className="font-bold text-slate-800 uppercase tracking-widest text-sm">{c.coupon_code}</div>
                            <div className="text-xs text-slate-500">{c.coupon_title}</div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gateways.map((g, i) => (
                      <div key={i} onClick={() => setSelectedGateway(g)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2
                           ${selectedGateway?.id === g.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-brand-200'}`}>
                        <span className="text-3xl">{gatewayIcons[g.title] || '💳'}</span>
                        <div className="font-bold text-sm text-slate-800 text-center">{g.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Summary */}
              <div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm text-slate-600 pb-4 mb-4 border-b border-slate-100">
                    <div className="flex justify-between"><span>Base Fare × {selectedSeats.length}</span><span className="font-semibold">₹{finalSubtotal}</span></div>
                    {selectedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon ({selectedCoupon.coupon_code})</span>
                        <span className="font-semibold">-₹{finalCoupon}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                      <span>Total</span><span>₹{finalTotal}</span>
                    </div>
                  </div>

                  {/* Contact summary */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-500 space-y-1">
                    <p><strong className="text-slate-700">Name:</strong> {contactName}</p>
                    <p><strong className="text-slate-700">Phone:</strong> {contactPhone}</p>
                    <p><strong className="text-slate-700">Seats:</strong> {selectedSeats.map(s => s.seat_number).join(', ')}</p>
                  </div>

                  <button onClick={handleBook} disabled={loading || !selectedGateway}
                    className="w-full h-[54px] bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <CheckCircle2 size={20} />}
                    Pay & Confirm ₹{finalTotal}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 4: CONFIRMATION ===== */}
          {step === 4 && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Green header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
                  <p className="text-white/80 text-sm">Your ticket has been booked successfully</p>
                </div>

                {/* Ticket details */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Transaction ID</p>
                      <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{bookingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Total Paid</p>
                      <p className="font-bold text-2xl text-brand-600">₹{finalTotal}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase">Bus</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{bus?.bus_title || '—'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase">Date</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{date}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase">From</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{bus?.boarding_city}</p>
                      <p className="text-xs text-slate-500">{bus?.bus_picktime}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 uppercase">To</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{bus?.drop_city}</p>
                      <p className="text-xs text-slate-500">{bus?.bus_droptime}</p>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Passengers</p>
                    </div>
                    {passengers.map((p, i) => (
                      <div key={i} className={`px-4 py-3 flex justify-between items-center text-sm ${i < passengers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <div>
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.gender} · Age {p.age}</p>
                        </div>
                        <span className="bg-brand-50 text-brand-600 font-bold text-xs px-3 py-1 rounded-lg border border-brand-100">Seat {p.seat_no}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center gap-3">
                    <QrCode size={24} className="text-slate-400" />
                    <div className="text-center">
                      <p className="font-semibold text-slate-700 text-sm">Ticket QR Code</p>
                      <p className="text-xs text-slate-400 mt-0.5">QR will appear here once the admin processes your booking. Check My Trips for updates.</p>
                    </div>
                    <div className="bg-slate-100 rounded-lg px-4 py-2 font-mono text-sm text-slate-600 font-bold">{bookingId}</div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => router.push('/my-trips')}
                      className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand">
                      View My Trips
                    </button>
                    <button onClick={() => router.push('/')}
                      className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                      Book Another
                    </button>
                  </div>
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
