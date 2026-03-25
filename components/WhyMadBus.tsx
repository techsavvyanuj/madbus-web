import { ShieldCheck, Clock4, RefreshCcw, Headphones, MapPin, Star } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    desc: 'Bank-grade encryption on every transaction. Your money is always protected.',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
  },
  {
    icon: Clock4,
    title: 'Real-time tracking',
    desc: 'Know exactly where your bus is. Live location updates sent to your phone.',
    gradient: 'from-brand-500 to-purple-600',
    lightBg: 'bg-purple-50',
  },
  {
    icon: RefreshCcw,
    title: 'Instant refunds',
    desc: 'Cancel anytime. Refunds processed within 24 hours, no questions asked.',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-green-50',
  },
  {
    icon: Headphones,
    title: '24/7 support',
    desc: 'Our team is available around the clock via chat, call, or email.',
    gradient: 'from-orange-500 to-amber-600',
    lightBg: 'bg-orange-50',
  },
  {
    icon: MapPin,
    title: '2000+ routes',
    desc: 'From metro cities to remote towns — we\'ve got your journey covered.',
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
  },
  {
    icon: Star,
    title: 'Reward points',
    desc: 'Earn MadPoints on every trip and redeem them for discounts on future bookings.',
    gradient: 'from-amber-500 to-yellow-600',
    lightBg: 'bg-amber-50',
  },
]

const stats = [
  { value: '5M+', label: 'Happy travellers', icon: '😊' },
  { value: '2000+', label: 'Routes covered', icon: '🗺️' },
  { value: '98%', label: 'On-time rate', icon: '⏰' },
  { value: '4.7★', label: 'App store rating', icon: '⭐' },
]

export default function WhyMadBus() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((s, i) => (
          <div key={i} className="group text-center bg-white border border-slate-100 rounded-2xl py-7 px-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-2xl mb-2 block">{s.icon}</span>
            <p className="font-display font-bold text-3xl text-brand-600 mb-1">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Features header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Star size={16} className="text-brand-500" />
          </div>
          <span className="text-brand-500 text-sm font-semibold uppercase tracking-widest">Why MadBus</span>
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mb-2">
          Built for people who travel
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Every feature we build is designed to make your bus journey safer, smoother, and more enjoyable.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <div key={i} className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-card-hover hover:border-slate-200 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden">
              {/* Subtle gradient accent on hover */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className={`w-12 h-12 rounded-xl ${f.lightBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className={`bg-gradient-to-br ${f.gradient} bg-clip-text`} style={{ color: 'inherit' }} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
