import {useEffect,useRef,useState} from 'react'
import {Link,useLocation,useNavigate} from 'react-router-dom'
import {FiSun,FiMoon,FiSearch,FiUser,FiMenu,FiX,FiLogOut,FiSettings,FiPlus} from 'react-icons/fi'
import {signOut} from 'firebase/auth'
import {auth} from '../firebase'
import {useTheme} from '../context/ThemeContext'
import {useAuth} from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar(){
 const {theme,toggleTheme}=useTheme();const {user,isAdmin}=useAuth();const nav=useNavigate();const loc=useLocation();const [open,setOpen]=useState(false);const ref=useRef()
 useEffect(()=>setOpen(false),[loc.pathname])
 useEffect(()=>{const f=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',f);return()=>document.removeEventListener('mousedown',f)},[])
 const logout=async()=>{await signOut(auth);toast.success('Signed out');nav('/')}
 return <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-line">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
   <Link to="/" className="flex items-center gap-2"><img src="/icon.svg" className="w-8 h-8"/><span className="font-serif text-xl text-gold hidden sm:block">Dil-e-Kehkash</span></Link>
   <div className="hidden lg:flex items-center gap-6"><Link className="nav-link" to="/explore">Explore</Link><Link className="nav-link" to="/quotes">Quotes</Link><Link className="nav-link" to="/poems">Poems</Link><Link className="nav-link" to="/stories">Stories</Link><Link className="nav-link" to="/songs">Songs</Link><Link className="nav-link" to="/about">About</Link></div>
   <div className="flex items-center gap-2"><button onClick={()=>nav('/search')} className="icon-action p-2"><FiSearch/></button><button onClick={toggleTheme} className="icon-action p-2">{theme==='dark'?<FiSun/>:<FiMoon/>}</button>
    <div ref={ref} className="relative"><button onClick={()=>setOpen(!open)} className="p-1 border border-gold/30 rounded-full">{user?.photoURL?<img src={user.photoURL} className="w-7 h-7 rounded-full object-cover"/>:<FiUser className="m-1 text-gold"/>}</button>
    {open&&<div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-xl"><div className="px-3 py-2 border-b border-line"><p className="text-xs text-muted truncate">{user?.email||'Guest'}</p></div>{user?<><Link to="/me" className="menu-link"><FiUser/> My Space</Link><Link to="/write" className="menu-link"><FiPlus/> Create work</Link>{isAdmin&&<Link to="/admin" className="menu-link"><FiSettings/> Approval desk</Link>}<button onClick={logout} className="menu-link w-full"><FiLogOut/> Sign out</button></>:<Link to="/login" className="menu-link"><FiUser/> Sign in</Link>}</div>}</div>
    <button className="lg:hidden icon-action p-2" onClick={()=>setOpen(!open)}>{open?<FiX/>:<FiMenu/>}</button>
   </div>
  </div>
  <style>{`.nav-link{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.nav-link:hover,.menu-link:hover{color:var(--gold)}.menu-link{display:flex;gap:.6rem;align-items:center;padding:.65rem .75rem;color:var(--body);font-size:.8rem}`}</style>
 </nav>
}
