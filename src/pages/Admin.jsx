import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  collection, addDoc, serverTimestamp,
  getDocs, query, orderBy, deleteDoc, doc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiTrash2, FiPlus } from 'react-icons/fi'

const CATEGORIES = ['quotes', 'poems', 'articles', 'songs', 'photos', 'stories']
const MAX_TITLE = 200
const MAX_CONTENT = 50000

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [category, setCategory] = useState('quotes')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState([])
  const [fetching, setFetching] = useState(true)

  // Security: block non-admin access
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
  if (!user || !isAdmin) return <Navigate to="/" replace />

  useEffect(() => {
    fetchItems()
  }, [category])

  const fetchItems = async () => {
    setFetching(true)
    try {
      const q = query(collection(db, category), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      setItems([])
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (title.length > MAX_TITLE) { toast.error('Title too long'); return }
    if (content.length > MAX_CONTENT) { toast.error('Content too long'); return }
    if (category !== 'photos' && !content.trim()) { toast.error('Content is required'); return }

    setSubmitting(true)
    try {
      let imageUrl = null

      if (category === 'photos' && imageFile) {
        // Validate file type
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowed.includes(imageFile.type)) {
          toast.error('Only JPEG, PNG, WebP, or GIF allowed')
          setSubmitting(false)
          return
        }
        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error('Image must be under 5MB')
          setSubmitting(false)
          return
        }
        const storageRef = ref(storage, `photos/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      await addDoc(collection(db, category), {
        title: title.trim(),
        content: content.trim(),
        ...(imageUrl && { imageUrl }),
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        authorUid: user.uid,
      })

      toast.success('Published')
      setTitle('')
      setContent('')
      setImageFile(null)
      fetchItems()
    } catch {
      toast.error('Could not publish')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this piece permanently?')) return
    try {
      await deleteDoc(doc(db, category, itemId))
      toast.success('Deleted')
      fetchItems()
    } catch {
      toast.error('Could not delete')
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="font-sans text-xs tracking-widest uppercase text-gold/60 block mb-2">Admin</span>
        <h1 className="font-serif text-5xl text-white mb-10">Manage Content</h1>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
                category === cat ? 'border-gold text-gold' : 'border-white/10 text-white/30 hover:border-gold/40 hover:text-gold/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Form */}
        <div className="glass-card rounded-sm p-6 mb-10 flex flex-col gap-4">
          <h2 className="font-serif text-xl text-gold flex items-center gap-2"><FiPlus size={16} /> Add to {category}</h2>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            placeholder="Title"
            className="w-full bg-transparent border-b border-white/10 pb-2 font-sans text-sm text-white placeholder-white/20 outline-none focus:border-gold/40 transition-colors"
          />

          {category === 'photos' ? (
            <div>
              <label className="font-sans text-xs text-white/30 block mb-2">Upload Image (max 5MB, JPEG/PNG/WebP)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={e => setImageFile(e.target.files[0] || null)}
                className="font-sans text-sm text-white/50"
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={MAX_CONTENT}
              placeholder="Write your content here..."
              rows={8}
              className="w-full bg-transparent border border-white/10 p-3 font-sans text-sm text-white placeholder-white/20 outline-none focus:border-gold/40 transition-colors resize-y"
            />
          )}

          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-white/20">{content.length}/{MAX_CONTENT}</span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gold text-obsidian font-sans text-xs tracking-widest uppercase hover:bg-gold-light transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Existing Items */}
        <h2 className="font-serif text-2xl text-white mb-6">Published {category}</h2>
        {fetching ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="font-sans text-sm text-white/20">Nothing published yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="glass-card rounded-sm px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-base text-white truncate">{item.title}</p>
                  <p className="font-sans text-xs text-white/30">
                    {item.likes || 0} likes · {item.commentCount || 0} comments ·{' '}
                    {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
