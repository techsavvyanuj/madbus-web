'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Phone, User, Mail, Lock, KeyRound } from 'lucide-react'
import { Bus } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  bookingFor?: string
}

export default function AuthModal({ open, onClose, bookingFor }: Props) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [newPass, setNewPass] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!open) return null

  async function handleSubmit() {
    setErrorMsg('')
    setSuccessMsg('')

    if (mode === 'forgot') {
      if (!mobile || !newPass) { setErrorMsg('Enter mobile and new password.'); return }
      setLoading(true)
      try {
        const res = await fetch('/api/forget_password.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, password: newPass, ccode: '+91' })
        })
        const data = await res.json()
        if (data.Result === 'true') {
          setSuccessMsg('Password changed! You can now login.')
          setMode('login')
          setMobile('')
          setNewPass('')
        } else {
          setErrorMsg(data.ResponseMsg || 'Mobile not found.')
        }
      } catch { setErrorMsg('Network error.') }
      finally { setLoading(false) }
      return
    }

    if (!mobile || !password) { setErrorMsg('Please fill in mobile and password.'); return }
    if (mode === 'signup' && (!name || !email)) { setErrorMsg('Please fill in all details for sign up.'); return }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/user_login.php' : '/api/reg_user.php'
      const payload = mode === 'login'
        ? { mobile, password, ccode: '+91' }
        : { name, email, mobile, password, ccode: '+91', user_type: 'User', rcode: '' }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (data.Result === "true") {
        if (mode === 'signup' && data.UserLogin === null) {
          setErrorMsg('Account created! Please login.')
          setMode('login')
          return
        }
        setDone(true)
        if (typeof window !== 'undefined' && data.UserLogin && mode === 'login') {
          localStorage.setItem('madbus_user', JSON.stringify(data.UserLogin))
        }
      } else {
        setErrorMsg(data.ResponseMsg || 'Authentication failed.')
      }
    } catch { setErrorMsg('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <span className="text-5xl block mb-4">🎉</span>
          <h2 className="font-display font-bold text-xl text-slate-800 mb-2">
            {mode === 'login' ? 'Welcome back!' : 'Account Created!'}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {mode === 'login' ? 'You are logged in. Enjoy seamless bus booking!' : 'Now please login with your credentials.'}
          </p>
          <button onClick={() => { if (mode === 'signup') { setDone(false); setMode('login') } else { onClose(); setDone(false); window.location.reload() } }}
            className="mt-6 w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors">
            {mode === 'signup' ? 'Go to Login' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal header */}
        <div className="relative px-6 pt-6 pb-8 overflow-hidden shrink-0" style={{ minHeight: '140px' }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/2489.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-purple-600/70" />
          <div className="relative z-10">
            <button onClick={onClose} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"><X size={15} /></button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md"><Bus size={16} className="text-white" /></div>
              <span className="text-white/90 font-semibold text-sm tracking-wide">MadBus</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-white">
              {mode === 'login' ? 'Welcome back 👋' : mode === 'signup' ? 'Create account' : 'Reset Password 🔑'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {mode === 'login' ? 'Login to access your tickets & offers' : mode === 'signup' ? 'Join millions of happy travellers' : 'Enter your mobile to reset password'}
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        {mode !== 'forgot' && (
          <div className="flex gap-1 p-3 bg-slate-50 border-b border-slate-100 shrink-0">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErrorMsg('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg text-center">{successMsg}</div>}

          {mode === 'signup' && (
            <>
              <Field icon={<User size={15} />} placeholder="Full name" type="text" value={name} onChange={e => setName(e.target.value)} />
              <Field icon={<Mail size={15} />} placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </>
          )}

          <Field icon={<Phone size={15} />} placeholder="Mobile number (10 digits)" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} />

          {mode === 'forgot' ? (
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><KeyRound size={15} /></div>
              <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={15} /></div>
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right -mt-2">
              <button onClick={() => { setMode('forgot'); setErrorMsg('') }} className="text-xs text-brand-500 font-semibold hover:underline">
                Forgot password?
              </button>
            </div>
          )}
          {mode === 'forgot' && (
            <div className="text-right -mt-2">
              <button onClick={() => { setMode('login'); setErrorMsg('') }} className="text-xs text-brand-500 font-semibold hover:underline">
                Back to Login
              </button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Please wait…</>
            ) : (
              mode === 'login' ? 'Login to MadBus' : mode === 'signup' ? 'Create Account' : 'Reset Password'
            )}
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed mt-4">
            By continuing, you agree to MadBus's{' '}
            <a href="/help?tab=privacy" className="text-brand-500 hover:underline">Terms of Service</a> and{' '}
            <a href="/help?tab=privacy" className="text-brand-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, placeholder, type, value, onChange }: {
  icon: React.ReactNode; placeholder: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full pl-9 pr-4 py-3.5 border-2 border-slate-200 focus:border-brand-400 rounded-xl text-sm outline-none transition-colors" />
    </div>
  )
}
