import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShare2, FiMessageCircle } from 'react-icons/fi'
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  quotes: 'text-gold',
  poems: 'text-purple-400',
  articles: 'text-blue-400',
  songs: 'text-pink-400',
  photos: 'text-green-400',
  stories: 'text-orange-400',
}

export default function ContentCard({ item, category }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liked, setLiked] = useState(item.likedBy?.includes(user?.uid))
  const [likeCount, setLikeCount] = useState(item.likes || 0)
  const [liking, setLiking] = useState(false)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Sign in to like')
      return
    }
    if (liking) return
    setLiking(true)
    const ref = doc(db, category, item.id)
    try {
      if (liked) {
        await updateDoc(ref, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        })
        setLikeCount(c => c - 1)
        setLiked(false)
      } else {
        await updateDoc(ref, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        })
        setLikeCount(c => c + 1)
        setLiked(true)
      }
    } catch {
      toast.error('Could not update like')
    } finally {
      setLiking(false)
    }
  }

  const handleShare = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/${category}/${item.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied')
  }

  const handleCardClick = () => {
    navigate(`/${category}/${item.id}`)
  }

  const preview = item.content?.replace(/<[^>]*>/g, '').slice(0, 120) || ''

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-sm p-6 flex flex-col gap-3 group"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={item.title}
    >
      {/* Category Tag */}
      <span className={`font-sans text-xs tracking-widest uppercase ${CATEGORY_COLORS[category] || 'text-gold'}`}>
        {category}
      </span>

      {/* Title */}
      <h3 className="font-serif text-xl text-white group-hover:text-gold transition-colors duration-200 leading-snug">
        {item.title}
      </h3>

      {/* Photo preview */}
      {category === 'photos' && item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-40 object-cover rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
        />
      )}

      {/* Text preview */}
      {category !== 'photos' && preview && (
        <p className="font-sans text-sm text-white/50 leading-relaxed line-clamp-3">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gold/10">
        <span className="font-sans text-xs text-white/30">
          {item.createdAt?.toDate
            ? new Date(item.createdAt.toDate()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
            : ''}
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors duration-200 ${liked ? 'text-gold' : 'text-white/40 hover:text-gold'}`}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <FiHeart size={13} className={liked ? 'fill-gold' : ''} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/${category}/${item.id}#comments`) }}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-gold transition-colors duration-200"
            aria-label="Comments"
          >
            <FiMessageCircle size={13} />
            <span>{item.commentCount || 0}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-gold transition-colors duration-200"
            aria-label="Share"
          >
            <FiShare2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
