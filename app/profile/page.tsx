'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Phone, Wallet, ArrowRight, Gift, Trash2, Edit3, CheckCircle, LogOut, Copy } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('madbus_user')
    if (saved) { try { setUser(JSON.parse(saved)) } catch {} }
    setLoading(false)
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">My Profile</h1>
          <p className="text-white/60 text-base">Manage your account, wallet & preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {!user ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <User size={40} className="text-brand-400 mx-auto mb-4" />
            <h2 className="font-bold text-xl text-slate-800 mb-2">Login to view your profile</h2>
            <button onClick={() => setAuthOpen(true)} className="mt-4 bg-brand-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-600 transition-colors">
              Login / Sign Up
            </button>
          </div>
        ) : (
          <ProfileDashboard user={user} setUser={setUser} />
        )}
      </div>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

function ProfileDashboard({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState(user.password || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Wallet
  const [walletBalance, setWalletBalance] = useState('0')
  const [walletHistory, setWalletHistory] = useState<any[]>([])
  const [walletLoading, setWalletLoading] = useState(true)

  // Referral
  const [referCode, setReferCode] = useState('')
  const [referCredit, setReferCredit] = useState('0')
  const [signupCredit, setSignupCredit] = useState('0')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fetch wallet
    fetch('/api/wallet_report.php', {
      method: 'POST',
      body: JSON.stringify({ uid: user.id })
    }).then(r => r.json()).then(d => {
      if (d.Result === 'true') {
        setWalletBalance(d.wallet || '0')
        setWalletHistory(d.Walletitem || [])
      }
    }).catch(() => {}).finally(() => setWalletLoading(false))

    // Fetch refer data
    fetch('/api/referdata.php', {
      method: 'POST',
      body: JSON.stringify({ uid: user.id })
    }).then(r => r.json()).then(d => {
      if (d.Result === 'true') {
        setReferCode(d.code || '')
        setReferCredit(d.refercredit || '0')
        setSignupCredit(d.signupcredit || '0')
      }
    }).catch(() => {})
  }, [user.id])

  async function handleSave() {
    if (!name || !password) return setMsg('Name and password are required.')
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/profile_edit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, name, email, password })
      })
      const d = await res.json()
      if (d.Result === 'true') {
        const updated = d.UserLogin
        localStorage.setItem('madbus_user', JSON.stringify(updated))
        setUser(updated)
        setEditing(false)
        setMsg('Profile updated!')
        setTimeout(() => setMsg(''), 3000)
      } else {
        setMsg(d.ResponseMsg || 'Update failed.')
      }
    } catch { setMsg('Network error.') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) return
    if (!confirm('This will permanently deactivate your account. Continue?')) return
    try {
      const res = await fetch('/api/acc_delete.php', {
        method: 'POST',
        body: JSON.stringify({ uid: user.id })
      })
      const d = await res.json()
      alert(d.ResponseMsg || 'Account deleted.')
      localStorage.removeItem('madbus_user')
      window.location.href = '/'
    } catch { alert('Error deleting account.') }
  }

  function handleLogout() {
    localStorage.removeItem('madbus_user')
    window.location.href = '/'
  }

  function copyReferCode() {
    navigator.clipboard.writeText(referCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium text-center ${msg.includes('updated') || msg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">{user.name || 'Traveller'}</h2>
              <p className="text-white/70 text-sm">+{user.ccode || '91'} {user.mobile}</p>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Password</label>
                <input type="text" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle size={16} />}
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '👤', label: 'Name', value: user.name },
                { icon: '📱', label: 'Mobile', value: `+${user.ccode || '91'} ${user.mobile}` },
                { icon: '📧', label: 'Email', value: user.email || '—' },
                { icon: '🔑', label: 'User Type', value: user.user_type || 'User' },
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{f.label}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm truncate">{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Wallet</h3>
              <p className="text-xs text-slate-400">Your current balance</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">₹{walletBalance}</p>
        </div>
        <div className="p-6">
          {walletLoading ? (
            <div className="text-center py-6"><div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : walletHistory.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No wallet transactions yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {walletHistory.map((w, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{w.message}</p>
                  </div>
                  <span className={`font-bold text-sm ${w.status === 'Credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {w.status === 'Credit' ? '+' : '-'}₹{w.amt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referral Card */}
      {referCode && (
        <div className="bg-gradient-to-r from-purple-500 to-brand-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Gift size={24} />
            <div>
              <h3 className="font-bold text-lg">Refer & Earn</h3>
              <p className="text-white/70 text-sm">Share your code and earn ₹{referCredit} per referral!</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide">Your Referral Code</p>
              <p className="font-mono font-bold text-xl tracking-widest">{referCode}</p>
            </div>
            <button onClick={copyReferCode}
              className="bg-white text-brand-600 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/90 transition-colors">
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-white/60 text-xs mt-3">New users get ₹{signupCredit} on signup. You get ₹{referCredit} when they book.</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={handleLogout}
          className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group">
          <LogOut size={20} className="text-slate-400 group-hover:text-brand-500" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">Logout</p>
            <p className="text-xs text-slate-400">Sign out of your account</p>
          </div>
        </button>
        <button onClick={handleDelete}
          className="bg-white border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3 hover:border-red-400 hover:bg-red-50 transition-all text-left group">
          <Trash2 size={20} className="text-red-400 group-hover:text-red-500" />
          <div>
            <p className="font-semibold text-red-600 text-sm">Delete Account</p>
            <p className="text-xs text-slate-400">Permanently remove account</p>
          </div>
        </button>
      </div>
    </div>
  )
}
