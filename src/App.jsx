import {Routes,Route} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import {AuthProvider} from './context/AuthContext'
import {ThemeProvider} from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Search from './pages/Search'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Explore from './pages/Explore'
import WorkEditor from './pages/WorkEditor'
import Space from './pages/Space'
import ContentView from './pages/ContentView'
import CategoryPage from './pages/CategoryPage'

export default function App(){return <ThemeProvider><AuthProvider><div className="min-h-screen site-bg"><Navbar/><main className="page-enter"><Routes>
<Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/search" element={<Search/>}/><Route path="/login" element={<Login/>}/><Route path="/admin" element={<Admin/>}/><Route path="/explore" element={<Explore/>}/><Route path="/write" element={<WorkEditor/>}/><Route path="/write/:id" element={<WorkEditor/>}/><Route path="/me" element={<Space/>}/><Route path="/space/:uid" element={<Space/>}/><Route path="/works/:id" element={<ContentView/>}/><Route path="/:category" element={<CategoryPage/>}/><Route path="/:category/:id" element={<ContentView/>}/>
</Routes></main><Toaster position="bottom-center" toastOptions={{className:'dek-toast'}}/></div></AuthProvider></ThemeProvider>}
