'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Phone, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('madbus_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) { }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('madbus_user')
    setUser(null)
    window.location.reload()
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <Image
                src="/WhatsApp Image 2026-03-22 at 18.12.14.jpeg"
                alt="MadBus Logo"
                width={40}
                height={40}
                className="rounded-xl object-contain"
                priority
              />
              <div className="leading-none">
                <span className="font-display font-bold text-xl text-brand-600 tracking-tight">Mad</span>
                <span className="font-display font-bold text-xl text-slate-800 tracking-tight">Bus</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/bus-tickets" label="Bus Tickets" />
              <NavLink href="/my-trips" label="My Trips" />
              <NavLink href="/offers" label="Offers" badge="3" />
              <NavLink href="/help" label="Help" />
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <a href="tel:+918827150778" className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 transition-colors">
                <Phone size={14} />
                <span>Support</span>
              </a>

              {user ? (
                <div className="hidden md:flex items-center gap-3 ml-2 border-l border-slate-100 pl-4">
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-sm font-bold text-slate-800">{user.name || 'Traveller'}</span>
                    <button onClick={handleLogout} className="text-[11px] font-semibold text-brand-500 hover:underline">
                      Logout
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center border border-brand-100">
                    <UserIcon size={18} className="text-brand-600" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="hidden md:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-brand active:scale-[0.98]"
                >
                  Login / Sign Up
                </button>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 text-slate-600">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-1 animate-slide-down">
            <MobileLink href="/bus-tickets" label="Bus Tickets" />
            <MobileLink href="/my-trips" label="My Trips" />
            <MobileLink href="/offers" label="Offers" />
            <MobileLink href="/help" label="Help" />
            
            {user ? (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                    <UserIcon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{user.name || 'Traveller'}</div>
                    <div className="text-xs text-slate-500">{user.mobile}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-sm font-semibold text-brand-600 px-4 py-2 bg-brand-50 rounded-lg">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthOpen(true); setMenuOpen(false) }}
                className="mt-3 w-full bg-brand-500 text-white font-semibold py-3 rounded-xl"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

function NavLink({ href, label, badge }: { href: string; label: string; badge?: string }) {
  return (
    <a
      href={href}
      className="relative flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </a>
  )
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors">
      {label}
    </a>
  )
}
