import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import CategoryPage from './pages/CategoryPage'
import ContentView from './pages/ContentView'
import Search from './pages/Search'
import Login from './pages/Login'
import Admin from './pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-obsidian dark:bg-obsidian light:bg-cream transition-colors duration-300">
          <Navbar />
          <main className="page-enter">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/:category" element={<CategoryPage />} />
              <Route path="/:category/:id" element={<ContentView />} />
            </Routes>
          </main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#111111',
                color: '#D4AF37',
                border: '1px solid rgba(212,175,55,0.3)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
