export default function AppBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-purple-500 rounded-3xl overflow-hidden px-8 md:px-14 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Background */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />

        <div className="relative text-center md:text-left max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            📱 Get the app
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
            Your tickets,<br />in your pocket.
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-7">
            Book in seconds, track live, manage cancellations — all from the MadBus app. Exclusive app-only offers every week.
          </p>
          <div className="flex gap-3 flex-wrap justify-center md:justify-start">
            <StoreBtn
              icon="🍎"
              top="Download on the"
              bottom="App Store"
            />
            <StoreBtn
              icon="▶️"
              top="Get it on"
              bottom="Google Play"
            />
          </div>
        </div>

        <div className="relative text-8xl select-none hidden md:block">
          🚌
        </div>
      </div>
    </section>
  )
}

function StoreBtn({ icon, top, bottom }: { icon: string; top: string; bottom: string }) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm rounded-xl px-5 py-3 transition-all cursor-pointer"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-white/60 text-[10px] font-medium leading-none mb-0.5">{top}</p>
        <p className="text-white font-bold text-sm leading-none">{bottom}</p>
      </div>
    </a>
  )
}
