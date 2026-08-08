import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../firebase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiGithub } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Welcome back')
      navigate('/')
    } catch (e) {
      toast.error(getFriendlyError(e.code))
    }
  }

  const handleGithub = async () => {
    try {
      await signInWithPopup(auth, githubProvider)
      toast.success('Welcome back')
      navigate('/')
    } catch (e) {
      toast.error(getFriendlyError(e.code))
    }
  }

  const handleEmail = async () => {
    if (!email || !password) { toast.error('Fill in all fields'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      toast.success(mode === 'signin' ? 'Welcome back' : 'Account created')
      navigate('/')
    } catch (e) {
      toast.error(getFriendlyError(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <img src="/icon.svg" alt="" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="font-serif text-4xl text-white mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Join'}
          </h1>
          <p className="font-sans text-sm text-white/30">Dil-e-Kehkash</p>
        </div>

        <div className="glass-card rounded-sm p-8 flex flex-col gap-4">
          {/* Social Buttons */}
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center gap-3 w-full py-3 border border-white/10 text-white/70 font-sans text-sm hover:border-gold/40 hover:text-gold transition-all duration-200"
          >
            <FcGoogle size={18} />
            Continue with Google
          </button>

          <button
            onClick={handleGithub}
            className="flex items-center justify-center gap-3 w-full py-3 border border-white/10 text-white/70 font-sans text-sm hover:border-gold/40 hover:text-gold transition-all duration-200"
          >
            <FiGithub size={18} />
            Continue with GitHub
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 gold-divider" />
            <span className="font-sans text-xs text-white/20">or</span>
            <div className="flex-1 gold-divider" />
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 glass-card rounded-sm px-4 py-3">
            <FiMail size={14} className="text-gold/50 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              maxLength={254}
              autoComplete="email"
              className="flex-1 bg-transparent font-sans text-sm text-white placeholder-white/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 glass-card rounded-sm px-4 py-3">
            <FiLock size={14} className="text-gold/50 flex-shrink-0" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min. 8 characters)"
              maxLength={128}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="flex-1 bg-transparent font-sans text-sm text-white placeholder-white/20 outline-none"
            />
          </div>

          <button
            onClick={handleEmail}
            disabled={loading}
            className="w-full py-3 bg-gold text-obsidian font-sans text-xs tracking-widest uppercase hover:bg-gold-light transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-sans text-xs text-white/30 hover:text-gold transition-colors text-center"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function getFriendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
    'auth/popup-closed-by-user': 'Sign in was cancelled',
    'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',
    'auth/too-many-requests': 'Too many attempts. Try again later',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
