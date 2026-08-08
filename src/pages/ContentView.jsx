import { useEffect, useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Comments from '../components/Comments'
import toast from 'react-hot-toast'
import { FiHeart, FiShare2, FiArrowLeft } from 'react-icons/fi'

const VALID_CATEGORIES = ['quotes', 'poems', 'articles', 'songs', 'photos', 'stories']

export default function ContentView() {
  const { category, id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  // Security: reject invalid categories
  if (!VALID_CATEGORIES.includes(category)) return <Navigate to="/" replace />

  // Security: basic id validation
  if (!id || id.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(id)) return <Navigate to="/" replace />

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, category, id))
        if (!snap.exists()) { setItem(null); return }
        const data = { id: snap.id, ...snap.data() }
        setItem(data)
        setLikeCount(data.likes || 0)
        setLiked(data.likedBy?.includes(user?.uid) || false)
      } catch {
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [category, id, user])

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return }
    if (liking) return
    setLiking(true)
    const ref = doc(db, category, id)
    try {
      if (liked) {
        await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(user.uid) })
        setLikeCount(c => c - 1); setLiked(false)
      } else {
        await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(user.uid) })
        setLikeCount(c => c + 1); setLiked(true)
      }
    } catch { toast.error('Could not update like') }
    finally { setLiking(false) }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (!item) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-3xl text-white/20">This piece does not exist.</p>
      <button onClick={() => navigate(-1)} className="text-gold text-sm font-sans hover:underline">Go back</button>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6"
    >
      {/* Back */}
      <button
        onClick={() => navigate(`/${category}`)}
        className="flex items-center gap-2 text-white/30 hover:text-gold transition-colors mb-10 font-sans text-sm"
      >
        <FiArrowLeft size={14} />
        Back to {category}
      </button>

      {/* Category */}
      <span className="font-sans text-xs tracking-widest uppercase text-gold/60 block mb-4">{category}</span>

      {/* Title */}
      <h1 className="font-serif text-4xl sm:text-5xl text-white leading-tight mb-4">{item.title}</h1>

      {/* Date */}
      <p className="font-sans text-sm text-white/30 mb-8">
        {item.createdAt?.toDate
          ? new Date(item.createdAt.toDate()).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          : ''}
      </p>

      <div className="gold-divider mb-10" />

      {/* Photo */}
      {category === 'photos' && item.imageUrl && (
        <img src={item.imageUrl} alt={item.title} className="w-full rounded-sm mb-10 object-cover max-h-[60vh]" />
      )}

      {/* Content */}
      <div
        className="font-serif text-lg text-white/80 leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitize(item.content || '') }}
      />

      {/* Actions */}
      <div className="flex items-center gap-6 mt-12 pt-8 border-t border-gold/10">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 font-sans text-sm transition-colors duration-200 ${liked ? 'text-gold' : 'text-white/40 hover:text-gold'}`}
        >
          <FiHeart size={16} className={liked ? 'fill-gold' : ''} />
          {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 font-sans text-sm text-white/40 hover:text-gold transition-colors duration-200"
        >
          <FiShare2 size={16} />
          Share
        </button>
      </div>

      {/* Comments */}
      <Comments category={category} contentId={id} />
    </motion.div>
  )
}

// Basic HTML sanitizer — strips script tags and event handlers
function sanitize(html) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}
