import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import ContentCard from '../components/ContentCard'
import { Link } from 'react-router-dom'

const CATEGORIES = ['quotes', 'poems', 'articles', 'songs', 'photos', 'stories']

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export default function Home() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const results = []
      await Promise.all(
        CATEGORIES.map(async (cat) => {
          try {
            const q = query(collection(db, cat), orderBy('createdAt', 'desc'), limit(3))
            const snap = await getDocs(q)
            snap.docs.forEach(d => results.push({ id: d.id, ...d.data(), _category: cat }))
          } catch {
            // Collection may be empty
          }
        })
      )
      results.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return bTime - aTime
      })
      setWorks(results)
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center gap-6 max-w-3xl"
        >
          <motion.span variants={fadeUp} className="font-sans text-xs tracking-[0.4em] uppercase text-gold/60">
            A Personal Anthology
          </motion.span>

          <motion.h1 variants={fadeUp} className="font-serif text-6xl sm:text-8xl font-semibold leading-none">
            <span className="gold-shimmer">Dil-e-Kehkash</span>
          </motion.h1>

          <motion.div variants={fadeUp} className="gold-divider w-24" />

          <motion.p variants={fadeUp} className="font-sans text-base text-white/40 leading-relaxed max-w-lg">
            A sanctuary of words, melodies, and visions — where every piece of the soul finds its form.
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-4 mt-4">
            <Link
              to="/poems"
              className="px-6 py-3 border border-gold/40 text-gold font-sans text-xs tracking-widest uppercase hover:bg-gold hover:text-obsidian transition-all duration-300"
            >
              Explore Works
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 text-white/40 font-sans text-xs tracking-widest uppercase hover:text-gold transition-colors duration-300"
            >
              About
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-xs tracking-widest uppercase text-white/20">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent" />
        </motion.div>
      </section>

      {/* Recent Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="font-sans text-xs tracking-widest uppercase text-gold/60 block mb-2">Latest</span>
            <h2 className="font-serif text-4xl text-white">Recent Works</h2>
          </div>
          <div className="gold-divider flex-1 mx-8 hidden sm:block" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-sm h-48 animate-pulse" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-white/20">The anthology awaits its first piece.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {works.map(item => (
              <motion.div key={`${item._category}-${item.id}`} variants={fadeUp}>
                <ContentCard item={item} category={item._category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="gold-divider mb-12" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map(cat => (
            <motion.div key={cat} variants={fadeUp}>
              <Link
                to={`/${cat}`}
                className="glass-card rounded-sm p-6 flex flex-col items-center gap-2 group text-center"
              >
                <span className="font-serif text-3xl text-gold/30 group-hover:text-gold transition-colors duration-300">
                  {cat === 'quotes' ? '"' : cat === 'poems' ? '✦' : cat === 'articles' ? '≡' : cat === 'songs' ? '♪' : cat === 'photos' ? '◎' : '§'}
                </span>
                <span className="font-sans text-xs tracking-widest uppercase text-white/40 group-hover:text-gold transition-colors duration-300">
                  {cat}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
