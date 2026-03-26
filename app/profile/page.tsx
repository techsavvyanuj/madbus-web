'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Lock, Wallet, Clock, ArrowLeft, CheckCircle2, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile')

  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Wallet
  const [wallet, setWallet] = useState('0')
  const [walletItems, setWalletItems] = useState<any[]>([])
  const [agentEarning, setAgentEarning] = useState(0)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('madbus_user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      setName(u.name || '')
      setEmail(u.email || '')
    }
  }, [])

  useEffect(() => {
    if (user && activeTab === 'wallet') fetchWallet()
  }, [user, activeTab])

  function fetchWallet() {
    setWalletLoading(true)
    fetch('/api/wallet_report.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.id || "0" })
    })
      .then(r => r.json())
      .then(d => {
        setWallet(d.wallet || '0')
        setWalletItems(d.Walletitem || [])
        setAgentEarning(Number(d.Agent_Earning) || 0)
      })
      .catch(() => { })
      .finally(() => setWalletLoading(false))
  }

  async function handleSave() {
    if (!name.trim() || !password.trim()) {
      setSaveMsg('Name and password are required.')
      return
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/profile_edit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, name, email, password })
      })
      const data = await res.json()
      if (data.Result === 'true') {
        const updated = { ...user, name, email }
        localStorage.setItem('madbus_user', JSON.stringify(updated))
        setUser(updated)
        setSaveMsg('Profile updated successfully! ✓')
      } else {
        setSaveMsg(data.ResponseMsg || 'Update failed.')
      }
    } catch { setSaveMsg('Network error.') }
    finally { setSaving(false) }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center py-16 px-4">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="font-bold text-2xl text-slate-800 mb-2">Login Required</h2>
            <p className="text-slate-500 mb-6">Login to view and edit your profile.</p>
            <button onClick={() => setAuthOpen(true)}
              className="bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-600 transition-colors">
              Login
            </button>
          </div>
        </div>
        <Footer />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">{user.name}</h1>
              <p className="text-white/70 text-sm">{user.mobile} · {user.email || 'No email'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 shadow-sm border border-slate-200 max-w-xs">
          {(['profile', 'wallet'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab === 'profile' ? '👤 Profile' : '💰 Wallet'}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="font-bold text-xl text-slate-800">Edit Profile</h2>

              {saveMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${saveMsg.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {saveMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={user.mobile || ''} disabled
                    className="w-full pl-9 pr-4 py-3 border-2 border-slate-100 rounded-xl text-sm text-slate-400 bg-slate-50 cursor-not-allowed" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Mobile number cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Required to save changes.</p>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-brand disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={18} />}
                Save Changes
              </button>
            </div>

            {/* Logout */}
            <div className="mt-4">
              <button onClick={() => { localStorage.removeItem('madbus_user'); window.location.href = '/' }}
                className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-colors">
                Logout
              </button>
            </div>
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Wallet size={18} /> <span className="text-sm font-semibold">Wallet Balance</span>
                </div>
                <p className="text-4xl font-bold">₹{wallet}</p>
                <p className="text-white/60 text-xs mt-2">Available to use on next booking</p>
              </div>
              {agentEarning > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-4 opacity-80">
                    <TrendingUp size={18} /> <span className="text-sm font-semibold">Agent Earnings</span>
                  </div>
                  <p className="text-4xl font-bold">₹{agentEarning}</p>
                  <p className="text-white/60 text-xs mt-2">Total commission earned</p>
                </div>
              )}
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">Transaction History</h3>
              </div>
              {walletLoading ? (
                <div className="py-12 text-center"><div className="w-6 h-6 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : walletItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Wallet size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No wallet transactions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {walletItems.map((item: any, i: number) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.status === 'Credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                          {item.status === 'Credit' ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 text-sm">{item.message}</p>
                          <p className="text-xs text-slate-400">{item.tdate}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${item.status === 'Credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {item.status === 'Credit' ? '+' : '-'}₹{item.amt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
