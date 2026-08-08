import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiSearch, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { label: 'Quotes', path: '/quotes' },
  { label: 'Poems', path: '/poems' },
  { label: 'Articles', path: '/articles' },
  { label: 'Songs', path: '/songs' },
  { label: 'Photos', path: '/photos' },
  { label: 'Stories', path: '/stories' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out')
      navigate('/')
    } catch {
      toast.error('Sign out failed')
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-obsidian/95 backdrop-blur-md border-b border-gold/10'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/icon.svg" alt="Dil-e-Kehkash" className="w-8 h-8" />
            <span className="font-serif text-xl text-gold group-hover:gold-shimmer transition-all duration-300 hidden sm:block">
              Dil-e-Kehkash
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-sm tracking-widest uppercase transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-gold'
                    : 'text-white/50 hover:text-gold dark:text-white/50 dark:hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              aria-label="Search"
              className="p-2 text-white/60 hover:text-gold transition-colors duration-200"
            >
              <FiSearch size={18} />
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-white/60 hover:text-gold transition-colors duration-200"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(prev => !prev)}
                aria-label="Profile"
                className="p-1 rounded-full border border-gold/30 hover:border-gold transition-colors duration-200"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <FiUser size={16} className="text-gold m-1" />
                )}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-52 glass-card rounded-sm py-2 shadow-xl"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gold/10">
                          <p className="text-xs text-white/40 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="text-xs text-gold font-sans tracking-widest uppercase">Admin</span>
                          )}
                        </div>
                        <Link to="/about" className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-gold transition-colors">
                          <FiUser size={14} /> Profile
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-gold transition-colors">
                            <FiSettings size={14} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:text-gold transition-colors"
                        >
                          <FiLogOut size={14} /> Sign Out
                        </button>
                      </>
                    ) : (
                      <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-gold transition-colors">
                        <FiUser size={14} /> Sign In
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Menu"
              className="lg:hidden p-2 text-white/60 hover:text-gold transition-colors duration-200"
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-obsidian/98 border-t border-gold/10 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-sans text-sm tracking-widest uppercase transition-colors duration-200 ${
                    location.pathname === link.path ? 'text-gold' : 'text-white/60 hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
