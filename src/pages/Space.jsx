import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getMyWorks, getUserProfile, getPublicSpace, getPublicWorksByOwner, saveUserProfile, uploadSpaceImage, WORK_STATUS } from '../lib/workModel'
import ContentCard from '../components/ContentCard'

const SPACE_THEMES = ['gold','violet','blue','rose','emerald','ruby','indigo','amber']

export default function Space(){
  const {uid}=useParams(); const {user,isAdmin}=useAuth(); const navigate=useNavigate()
  const dashboard=!uid
  const target=uid||user?.uid
  const own=!!user&&user.uid===target
  const [profile,setProfile]=useState(null)
  const [works,setWorks]=useState([])
  const [editing,setEditing]=useState(false)
  const [creating,setCreating]=useState(false)
  const [saving,setSaving]=useState(false)
  const [tab,setTab]=useState('works')
  const [photoFile,setPhotoFile]=useState(null)
  const [iconFile,setIconFile]=useState(null)

  useEffect(()=>{
    if(!target)return
    let active=true
    ;(async()=>{
      try{
        if(dashboard){
          const p=await getUserProfile(target)
          if(!active)return
          setProfile(p)
          const w=await getMyWorks(target)
          if(active)setWorks(w)
        } else if(own){
          const [p,w]=await Promise.all([getUserProfile(target),getMyWorks(target)])
          if(active){setProfile(p);setWorks(w)}
        } else {
          const [p,w]=await Promise.all([getPublicSpace(target),getPublicWorksByOwner(target)])
          if(active){setProfile(p);setWorks(w)}
        }
      }catch(e){ if(active) toast.error('Could not load this Space') }
    })()
    return()=>{active=false}
  },[target,dashboard,own])

  if(!target)return <div className="min-h-screen pt-32 text-center text-muted">Sign in to create your Space.</div>
  if(!profile)return <div className="min-h-screen pt-32 text-center text-muted">Loading Space…</div>

  const hasSpace=Boolean(profile.spaceName?.trim())
  const save=async()=>{
    if(!profile.spaceName?.trim()) return toast.error('Give your Space a name')
    setSaving(true)
    try{
      let next={...profile}
      if(photoFile){const r=await uploadSpaceImage(user.uid,photoFile,'profile');next.photoURL=r.url}
      if(iconFile){const r=await uploadSpaceImage(user.uid,iconFile,'icon');next.spaceIconURL=r.url}
      await saveUserProfile(target,next)
      setProfile(next);setPhotoFile(null);setIconFile(null);setEditing(false);setCreating(false)
      toast.success('Space saved')
    }catch(e){toast.error(e?.code==='permission-denied'?'Firebase permission denied.':'Could not save Space')}
    finally{setSaving(false)}
  }

  if(dashboard){
    const shown=tab==='works'?works.filter(x=>x.status===WORK_STATUS.PUBLISHED&&x.visibility==='public'):tab==='drafts'?works.filter(x=>x.status===WORK_STATUS.DRAFT):tab==='submissions'?works.filter(x=>x.status===WORK_STATUS.PENDING):works.filter(x=>x.visibility==='private')
    return <div className="min-h-screen pt-24 pb-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8"><span className="eyebrow">Your account</span><h1 className="font-serif text-5xl text-heading mt-2">My Space</h1><p className="text-muted mt-2">Your private control room for identity and works.</p></div>
      {hasSpace&&!editing&&!creating ? <>
        <div className={`space-card theme-${profile.spaceTheme||'gold'}`}>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="space-avatar-wrap"><img src={profile.spaceIconURL||profile.photoURL||'/icon.svg'} className="space-avatar"/></div>
            <div className="flex-1 text-center sm:text-left"><span className="eyebrow">Dil-e-Kehkash Space</span><h2 className="font-serif text-4xl text-heading mt-1">{profile.spaceName}</h2><p className="text-body mt-1">{profile.name}</p>{profile.bio&&<p className="text-muted mt-3 max-w-2xl">{profile.bio}</p>}</div>
            <div className="flex flex-wrap justify-center gap-2"><Link to={`/space/${user.uid}`} className="px-5 py-2 bg-gold text-obsidian text-xs uppercase tracking-widest">Open Space</Link><button onClick={()=>setEditing(true)} className="px-5 py-2 border border-gold/40 text-gold text-xs uppercase tracking-widest">Edit Space</button><Link to="/write" className="px-5 py-2 border border-line text-body text-xs uppercase tracking-widest">Create Work</Link></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-10 mb-6">{[['works','Works'],['drafts','Drafts'],['submissions','Submissions'],['private','Private']].map(([v,l])=><button key={v} onClick={()=>setTab(v)} className={`filter ${tab===v?'filter-active':''}`}>{l}</button>)}</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{shown.map(x=><ContentCard key={x.id} item={x} category={x.category} modern/> )}</div>
        {!shown.length&&<div className="py-16 text-center text-muted font-serif text-2xl">{tab==='drafts'?'No drafts yet.':tab==='submissions'?'Nothing is awaiting approval.':tab==='private'?'No private works yet.':'Your public Space is waiting for approved works.'}</div>}
      </> : <SpaceEditor profile={profile} setProfile={setProfile} creating={creating} setCreating={setCreating} editing={editing} setEditing={setEditing} photoFile={photoFile} setPhotoFile={setPhotoFile} iconFile={iconFile} setIconFile={setIconFile} save={save} saving={saving}/>} 
    </div>
  }

  return <div className="min-h-screen pt-24 pb-24 max-w-6xl mx-auto px-4 sm:px-6">
    <div className={`space-card theme-${profile.spaceTheme||'gold'}`}>
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <img src={profile.spaceIconURL||profile.photoURL||'/icon.svg'} className="space-avatar"/>
        <div className="flex-1 text-center sm:text-left"><span className="eyebrow">Dil-e-Kehkash Space</span><h1 className="font-serif text-5xl text-heading mt-1">{profile.spaceName||profile.name}</h1><p className="text-body mt-1">{profile.name}</p>{profile.bio&&<p className="text-muted mt-3 max-w-2xl">{profile.bio}</p>}</div>
        {own&&<div className="flex gap-2"><button onClick={()=>setEditing(true)} className="px-4 py-2 border border-gold/40 text-gold text-xs uppercase tracking-widest">Edit Space</button><Link to="/write" className="px-4 py-2 bg-gold text-obsidian text-xs uppercase tracking-widest">Create Work</Link></div>}
      </div>
      {own&&editing&&<div className="mt-8"><SpaceEditor profile={profile} setProfile={setProfile} creating={false} setCreating={()=>{}} editing={true} setEditing={setEditing} photoFile={photoFile} setPhotoFile={setPhotoFile} iconFile={iconFile} setIconFile={setIconFile} save={save} saving={saving}/></div>}
    </div>
    <div className="mt-12 mb-6"><span className="eyebrow">{profile.spaceName}</span><h2 className="font-serif text-3xl text-heading mt-1">Works</h2></div>
    {works.length?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{works.map(x=><ContentCard key={x.id} item={x} category={x.category} modern/>)}</div>:<div className="py-16 text-center text-muted font-serif text-2xl">No public works yet.</div>}
  </div>
}

function SpaceEditor({profile,setProfile,creating,setCreating,editing,setEditing,photoFile,setPhotoFile,iconFile,setIconFile,save,saving}){
 return <div className="space-editor glass-card p-6">
   <div className="grid sm:grid-cols-2 gap-4">
     <label className="field"><span>Space name</span><input value={profile.spaceName||''} onChange={e=>setProfile({...profile,spaceName:e.target.value})} placeholder="Your Space name" maxLength={80}/></label>
     <label className="field"><span>Your name</span><input value={profile.name||''} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="Your name" maxLength={80}/></label>
   </div>
   <label className="field mt-4"><span>Bio</span><textarea value={profile.bio||''} onChange={e=>setProfile({...profile,bio:e.target.value})} maxLength={500} rows={4} placeholder="A short introduction"/></label>
   <div className="grid sm:grid-cols-2 gap-5 mt-5">
     <div><p className="field-label">Profile image</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFile(e.target.files?.[0]||null)} className="file-input"/><p className="text-xs text-muted mt-2">JPG, PNG or WebP · 2MB max</p></div>
     <div><p className="field-label">Space icon</p><input type="file" accept="image/jpeg,image/png,image/webp,.svg" onChange={e=>setIconFile(e.target.files?.[0]||null)} className="file-input"/><p className="text-xs text-muted mt-2">A separate image for your Space · 2MB max</p></div>
   </div>
   <div className="mt-5"><p className="field-label">Space colors</p><div className="flex flex-wrap gap-3">{SPACE_THEMES.map(t=><button key={t} type="button" aria-label={t} onClick={()=>setProfile({...profile,spaceTheme:t})} className={`theme-dot theme-dot-${t} ${profile.spaceTheme===t?'theme-dot-active':''}`}/>)}</div></div>
   <div className="mt-6 flex gap-3"><button onClick={save} disabled={saving} className="px-5 py-2 bg-gold text-obsidian text-xs uppercase tracking-widest">{saving?'Saving…':'Save Space'}</button>{editing&&!creating&&<button onClick={()=>setEditing(false)} className="px-5 py-2 border border-line text-body text-xs uppercase tracking-widest">Cancel</button>}</div>
 </div>
}
