import {useEffect,useState} from 'react'
import {useNavigate,useParams,Navigate,useLocation} from 'react-router-dom'
import {doc,getDoc,updateDoc,increment,arrayUnion,arrayRemove} from 'firebase/firestore'
import {db} from '../firebase'
import {getWork,toggleLike} from '../lib/workModel'
import {useAuth} from '../context/AuthContext'
import Comments from '../components/Comments'
import toast from 'react-hot-toast'
import {FiHeart,FiShare2,FiArrowLeft,FiDownload} from 'react-icons/fi'

export default function ContentView(){
 const {category,id}=useParams();const location=useLocation();const modern=location.pathname.startsWith('/works/');const {user,isAdmin}=useAuth();const nav=useNavigate();const [item,setItem]=useState(null);const [loading,setLoading]=useState(true);const [liked,setLiked]=useState(false);const [likes,setLikes]=useState(0)
 useEffect(()=>{(async()=>{try{const snap=modern?null:await getDoc(doc(db,category,id)); const x=modern?await getWork(id):(snap?.exists()?{id,...snap.data()}:null);setItem(x);setLikes(x?.likes||0);setLiked(x?.likedBy?.includes(user?.uid)||false)}catch{}finally{setLoading(false)}})()},[id,category,user])
 if(loading)return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>
 if(!item)return <div className="min-h-screen pt-32 text-center text-muted">This piece does not exist.</div>
 if(modern&&(item.status!=='published'||item.visibility!=='public')&&item.ownerUid!==user?.uid&&!isAdmin)return <Navigate to="/explore" replace/>
 const like=async()=>{if(!user)return toast.error('Sign in to like');try{if(modern){const x=await toggleLike(item,user.uid);setLiked(x);setLikes(n=>n+(x?1:-1))}else{const r=doc(db,category,id);if(liked){await updateDoc(r,{likes:increment(-1),likedBy:arrayRemove(user.uid)});setLiked(false);setLikes(n=>n-1)}else{await updateDoc(r,{likes:increment(1),likedBy:arrayUnion(user.uid)});setLiked(true);setLikes(n=>n+1)}}}catch{toast.error('Could not update like')}}
 return <motionWrap>
  <div className="min-h-screen pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6"><button onClick={()=>nav(-1)} className="icon-action mb-8"><FiArrowLeft/>Back</button>
   {item.coverUrl&&<img src={item.coverUrl} alt="" className="w-full max-h-[60vh] object-cover rounded-sm mb-8"/>}
   <span className="eyebrow">{item.category||category}</span><h1 className="font-serif text-5xl text-heading leading-tight mt-2">{item.title}</h1>
   <p className="text-xs text-muted mt-3">{item.createdAt?.toDate?new Date(item.createdAt.toDate()).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}):''}</p><div className="gold-divider my-8"/>
   {item.attachmentUrl&&<div className="mb-8 p-4 glass-card flex items-center justify-between"><span className="text-body text-sm">{item.attachmentName||'Attached file'}</span><a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="icon-action-active"><FiDownload/></a></div>}
   {item.content&&<div className="font-serif text-lg text-body leading-relaxed whitespace-pre-wrap">{item.content.replace(/<[^>]*>/g,'')}</div>}
   <div className="flex gap-5 mt-12 pt-6 border-t border-line"><button onClick={like} className={liked?'icon-action-active':'icon-action'}><FiHeart className={liked?'fill-current':''}/>{likes}</button><button onClick={()=>{navigator.clipboard?.writeText(location.href);toast.success('Link copied')}} className="icon-action"><FiShare2/>Share</button></div>
   <Comments category={modern?'works':category} contentId={id}/>
  </div></motionWrap>
}
function motionWrap({children}){return <div>{children}</div>}
