import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import ContentCard from '../components/ContentCard'
import { FiSearch } from 'react-icons/fi'

const CATEGORIES = ['quotes', 'poems', 'articles', 'songs', 'photos', 'stories']

export default function Search() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const handleSearch = async () => {
    const trimmed = term.trim()
    if (!trimmed || trimmed.length < 2) return
    // Limit search term length for safety
    if (trimmed.length > 100) return

    setLoading(true)
    setSearched(false)
    const found = []
    const cats = activeCategory === 'all' ? CATEGORIES : [activeCategory]

    await Promise.all(cats.map(async (cat) => {
      try {
        const q = query(collection(db, cat), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        snap.docs.forEach(d => {
          const data = { id: d.id, ...d.data(), _category: cat }
          const searchable = `${data.title || ''} ${data.content || ''}`.toLowerCase()
          if (searchable.includes(trimmed.toLowerCase())) {
            found.push(data)
          }
        })
      } catch { /* empty collection */ }
    }))

    setResults(found)
    setSearched(true)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="font-sans text-xs tracking-widest uppercase text-gold/60 block mb-2">Explore</span>
        <h1 className="font-serif text-5xl text-white mb-10">Search</h1>

        {/* Search Input */}
        <div className="glass-card rounded-sm flex items-center gap-4 px-4 py-3 mb-6">
          <FiSearch size={18} className="text-gold/60 flex-shrink-0" />
          <input
            type="text"
            value={term}
            onChange={e => setTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            placeholder="Search by title or content..."
            className="flex-1 bg-transparent font-sans text-sm text-white placeholder-white/20 outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 border border-gold/40 text-gold font-sans text-xs tracking-widest uppercase hover:bg-gold hover:text-obsidian transition-all duration-200"
          >
            Search
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-sans text-xs tracking-widest uppercase px-3 py-1.5 border transition-all duration-200 ${
                activeCategory === cat
                  ? 'border-gold text-gold'
                  : 'border-white/10 text-white/30 hover:border-gold/40 hover:text-gold/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        <AnimatePresence>
          {searched && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-sans text-xs text-white/30 mb-6 tracking-widest uppercase">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{term}"
              </p>
              {results.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-serif text-3xl text-white/20">Nothing found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(item => (
                    <ContentCard key={`${item._category}-${item.id}`} item={item} category={item._category} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
