import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FiHeart,FiShare2,FiMessageCircle,FiBookmark} from 'react-icons/fi'
import {doc,updateDoc,increment,arrayUnion,arrayRemove} from 'firebase/firestore'
import {db} from '../firebase'
import {useAuth} from '../context/AuthContext'
import {toggleLike,toggleSave} from '../lib/workModel'
import toast from 'react-hot-toast'

export default function ContentCard({item,category,modern=false}){
 const nav=useNavigate();const {user}=useAuth();const [liked,setLiked]=useState(item.likedBy?.includes(user?.uid));const [saved,setSaved]=useState(item.savedBy?.includes(user?.uid));const [likes,setLikes]=useState(item.likes||0)
 const path=modern?`/works/${item.id}`:`/${category}/${item.id}`
 const like=async e=>{e.stopPropagation();if(!user)return toast.error('Sign in to like');try{if(modern){const x=await toggleLike(item,user.uid);setLiked(x);setLikes(n=>n+(x?1:-1))}else{const r=doc(db,category,item.id);if(liked){await updateDoc(r,{likes:increment(-1),likedBy:arrayRemove(user.uid)});setLiked(false);setLikes(n=>n-1)}else{await updateDoc(r,{likes:increment(1),likedBy:arrayUnion(user.uid)});setLiked(true);setLikes(n=>n+1)}}}catch{toast.error('Could not update like')}}
 const save=async e=>{e.stopPropagation();if(!user)return toast.error('Sign in to save');if(!modern)return toast.error('Saving new works requires sign in');try{const x=await toggleSave(item,user.uid);setSaved(x);toast.success(x?'Saved':'Removed from saved')}catch{toast.error('Could not save')}}
 const share=e=>{e.stopPropagation();navigator.clipboard?.writeText(location.origin+path);toast.success('Link copied')}
 const preview=(item.content||'').replace(/<[^>]*>/g,'').slice(0,140)
 return <article onClick={()=>nav(path)} className="glass-card rounded-sm p-6 flex flex-col gap-3 group cursor-pointer">
  {item.coverUrl&&<img src={item.coverUrl} alt="" className="w-full h-40 object-cover rounded-sm mb-1"/>}
  <span className="text-xs tracking-widest uppercase text-gold">{item.icon||'✦'} {category}</span>
  <h3 className="font-serif text-xl text-heading group-hover:text-gold leading-snug">{item.title||'Untitled'}</h3>
  {preview&&<p className="text-sm text-muted leading-relaxed line-clamp-3">{preview}</p>}
  <div className="mt-auto pt-3 border-t border-line flex justify-between items-center"><span className="text-xs text-muted">{item.createdAt?.toDate?new Date(item.createdAt.toDate()).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}):''}</span>
  <div className="flex gap-3"><button onClick={like} className={liked?'icon-action-active':'icon-action'}><FiHeart size={14}/>{likes}</button>{modern&&<button onClick={save} className={saved?'icon-action-active':'icon-action'}><FiBookmark size={14}/></button>}<button onClick={share} className="icon-action"><FiShare2 size={14}/></button><span className="icon-action"><FiMessageCircle size={14}/>{item.commentCount||0}</span></div></div>
 </article>
}
