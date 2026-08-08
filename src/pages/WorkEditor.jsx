import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, emptyWork, createWork, saveWork, getWork, uploadWorkFile, WORK_STATUS, WORK_VISIBILITY } from '../lib/workModel'

const FILE_TYPES = '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.mp3,.wav,.m4a,.ogg'
const icons=['✦','❧','☾','∞','❋','⌁','◌','♡','✧','§']

export default function WorkEditor(){
  const {user,isAdmin,loading}=useAuth(); const {id}=useParams(); const nav=useNavigate()
  const [data,setData]=useState(emptyWork(user?.uid)); const [loaded,setLoaded]=useState(!id)
  const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false); const [saveError,setSaveError]=useState('')
  const [cover,setCover]=useState(null); const [file,setFile]=useState(null)
  const timer=useRef(null)

  useEffect(()=>{ if(!id||!user)return; getWork(id).then(x=>{
    if(!x||x.ownerUid!==user.uid){toast.error('You cannot edit this work');nav('/me');return}
    setData(x);setLoaded(true)
  })},[id,user])
  useEffect(()=>{ if(!loaded||!user)return; clearTimeout(timer.current); timer.current=setTimeout(async()=>{
    if(!(data.title?.trim() || data.content?.trim())) return
    try{
      setSaveError('')
      const draftPayload={title:data.title,category:data.category,content:data.content,coverUrl:data.coverUrl||'',attachmentUrl:data.attachmentUrl||'',attachmentName:data.attachmentName||'',attachmentType:data.attachmentType||'',icon:data.icon||'',visibility:data.visibility||WORK_VISIBILITY.PRIVATE,status:data.status===WORK_STATUS.PUBLISHED?WORK_STATUS.PUBLISHED:(data.status===WORK_STATUS.PENDING?WORK_STATUS.PENDING:WORK_STATUS.DRAFT)}
      if(id) await saveWork(id,user.uid,draftPayload)
      else { const newId=await createWork(user.uid,{...data,...draftPayload,status:WORK_STATUS.DRAFT}); nav(`/write/${newId}`,{replace:true}) }
      setSaved(true)
    }catch(e){ setSaved(false); setSaveError(e?.code==='permission-denied'?'Firebase permission denied. Deploy the included Firestore rules.':(e?.message||'Autosave failed')) }
  },1000); return()=>clearTimeout(timer.current)
  },[data.title,data.content,data.category,data.visibility,data.coverUrl,data.attachmentUrl,data.icon,loaded,user,id])

  if(loading||!loaded)return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>
  if(!user)return <Navigate to="/login" replace/>

  const update=(k,v)=>setData(x=>({...x,[k]:v}))
  const upload=async(kind)=>{
    const chosen=kind==='cover'?cover:file
    if(!chosen)return
    try{
      const result=await uploadWorkFile(user.uid,chosen,kind)
      if(kind==='cover') update('coverUrl',result.url)
      else update('attachmentUrl',result.url),update('attachmentName',result.name),update('attachmentType',result.type)
      toast.success('File added')
    }catch(e){toast.error(e.message||'Upload failed')}
  }
  const submit=async()=>{
    if(!data.title.trim())return toast.error('Give the work a title')
    if(data.category!=='photos'&&!data.content.trim()&&!data.attachmentUrl)return toast.error('Add some content or a file')
    setSaving(true)
    try{
      const isSubmit=data.visibility===WORK_VISIBILITY.SUBMITTED
      const adminPublish=isAdmin
      const payload={...data,status:adminPublish?WORK_STATUS.PUBLISHED:(isSubmit?WORK_STATUS.PENDING:(data.status===WORK_STATUS.PUBLISHED?WORK_STATUS.PUBLISHED:WORK_STATUS.DRAFT)),visibility:adminPublish?WORK_VISIBILITY.PUBLIC:(isSubmit?WORK_VISIBILITY.SUBMITTED:WORK_VISIBILITY.PRIVATE)}
      if(id) await saveWork(id,user.uid,payload); else await createWork(user.uid,payload)
      toast.success(adminPublish?'Published to the anthology':(isSubmit?'Submitted for approval':'Saved as private draft'))
      nav('/me')
    }catch(e){toast.error(e?.code==='permission-denied'?'Firebase permission denied. Deploy the included Firestore rules.':(e.message||'Could not save'))}
    finally{setSaving(false)}
  }
  return <div className="min-h-screen pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between mb-8"><div><span className="eyebrow">Create</span><h1 className="font-serif text-5xl text-heading mt-2">{id?'Edit work':'New work'}</h1></div><span className="text-xs text-muted">{saveError?saveError:(saved?'Auto-saved':'Draft')}</span></div>
    <div className="glass-card p-6 sm:p-8 space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="field"><span>Title</span><input value={data.title} onChange={e=>update('title',e.target.value)} maxLength={200} placeholder="Untitled"/></label>
        <label className="field"><span>Type</span><select value={data.category} onChange={e=>update('category',e.target.value)}>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <label className="field"><span>Your work</span><textarea value={data.content} onChange={e=>update('content',e.target.value)} maxLength={50000} rows={14} placeholder="Write here, or attach a file below…"/></label>
      <div className="grid sm:grid-cols-2 gap-5">
        <div><p className="field-label">Optional cover</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)} className="file-input"/><button onClick={()=>upload('cover')} disabled={!cover} className="small-action">Add cover</button>{data.coverUrl&&<img src={data.coverUrl} className="mt-3 h-28 w-full object-cover rounded-sm" />}</div>
        <div><p className="field-label">Optional file</p><input type="file" accept={FILE_TYPES} onChange={e=>setFile(e.target.files?.[0]||null)} className="file-input"/><button onClick={()=>upload('attachment')} disabled={!file} className="small-action">Add file</button>{data.attachmentName&&<p className="text-xs text-muted mt-3">{data.attachmentName}</p>}<p className="text-xs text-muted mt-2">Images: 3MB max. Other files: 10MB max.</p></div>
      </div>
      <div><p className="field-label">Icon</p><div className="flex flex-wrap gap-2">{icons.map(i=><button type="button" key={i} onClick={()=>update('icon',i)} className={`icon-choice ${data.icon===i?'icon-choice-active':''}`}>{i}</button>)}</div></div>
      <div><p className="field-label">Visibility</p><div className="grid sm:grid-cols-3 gap-3">
        {(isAdmin?[['private','Private','Only you can see it.'],['submitted','Publish publicly','As curator, your work can be published immediately.']]:[['private','Private','Only you can see it.'],['submitted','Submit for approval','Send it to Serena. It will stay private until approved.']]).map(([v,t,d])=><button key={v} type="button" onClick={()=>update('visibility',v)} className={`choice ${data.visibility===v?'choice-active':''}`}><b>{t}</b><span>{d}</span></button>)}
      </div></div>
      <div className="border-t border-line pt-5 flex flex-wrap justify-between gap-3"><p className="text-xs text-muted max-w-xl">{isAdmin?'You are the curator. Your work can be published directly. Other users must receive your approval before their work becomes public.':'Nothing becomes public automatically. Private works stay private. Submitting sends the work for approval. Changes are auto-saved as a draft while you work.'}</p><button onClick={submit} disabled={saving} className="px-6 py-3 bg-gold text-obsidian text-xs tracking-widest uppercase disabled:opacity-50">{saving?'Saving…':isAdmin&&data.visibility==='submitted'?'Publish':data.visibility==='submitted'?'Submit for approval':'Save draft'}</button></div>
    </div>
  </div>
}
