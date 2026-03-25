import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', text: 'Booked Mumbai to Pune in literally 2 minutes. The seat tracker is super helpful — I could see my bus was running on time.', rating: 5, initials: 'PS', color: 'bg-purple-100 text-purple-600' },
  { name: 'Rahul Mehta', city: 'Delhi', text: 'Had to cancel last minute and the refund was in my account the next morning. Never had such a smooth experience with any other app.', rating: 5, initials: 'RM', color: 'bg-blue-100 text-blue-600' },
  { name: 'Divya Nair', city: 'Bangalore', text: 'The variety of buses on the Bangalore-Chennai route is amazing. Found an affordable AC sleeper and the journey was so comfortable.', rating: 4, initials: 'DN', color: 'bg-emerald-100 text-emerald-600' },
]

const operators = ['APSRTC', 'MSRTC', 'SRS Travels', 'Orange Travels', 'KPN Travels', 'VRL Travels', 'Sharma Transport', 'Neeta Travels']

export default function SocialProof() {
  return (
    <section className="bg-slate-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Testimonials */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-brand-500 text-sm font-semibold uppercase tracking-widest">What people say</span>
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mb-8">Trusted by millions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <Quote size={18} className="text-slate-200" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Operators */}
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Official partners &amp; operators</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {operators.map((op, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors cursor-default">
              {op}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
