import { Bus, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Investor Relations'],
  Services: ['Bus Booking', 'Corporate Travel', 'Bus Rental', 'Partner With Us', 'API for Operators'],
  Support: ['Help Center', 'Track My Ticket', 'Refund Policy', 'Contact Us', 'Report an Issue'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility', 'Sitemap'],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                <Bus size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">MadBus</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 mb-5">
              India's most loved bus ticketing platform. Fast, safe, and reliable since 2020.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
                  <Icon size={14} className="text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2025 MadBus Technologies Pvt. Ltd. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex items-center gap-4">
            <span>🇮🇳 India</span>
            <span>·</span>
            <span>CIN: U74999MH2020PTC123456</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
