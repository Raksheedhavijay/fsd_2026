import React,{useState,useEffect,useRef}from'react';
import toast from'react-hot-toast';
import{useNavigate}from'react-router-dom';
import api from'../utils/api';
import{useAuth}from'../context/AuthContext';
export default function Dashboard(){
const{user,logout}=useAuth();
const navigate=useNavigate();
const[tab,setTab]=useState('files');
const[files,setFiles]=useState([]);
const[history,setHistory]=useState([]);
const[loadingFiles,setLoadingFiles]=useState(true);
const[uploading,setUploading]=useState(false);
const[selectedQR,setSelectedQR]=useState(null);
const[form,setForm]=useState({password:'',expiresIn:'',oneTimeAccess:false});
const[selectedFile,setSelectedFile]=useState(null);
const fileRef=useRef();
useEffect(()=>{fetchFiles();},[]);
useEffect(()=>{if(tab==='history')fetchHistory();},[tab]);
const fetchFiles=async()=>{
try{
const{data}=await api.get('/upload/my-files');
setFiles(data);
}catch{toast.error('Failed to load files');}
finally{setLoadingFiles(false);}
};
const fetchHistory=async()=>{
try{
const{data}=await api.get('/history');
setHistory(data);
}catch{toast.error('Failed to load history');}
};
const handleUpload=async(e)=>{
e.preventDefault();
if(!selectedFile)return toast.error('Please select a file');
if(!form.password)return toast.error('Password is required');
setUploading(true);
const fd=new FormData();
fd.append('file',selectedFile);
fd.append('password',form.password);
if(form.expiresIn)fd.append('expiresIn',form.expiresIn);
fd.append('oneTimeAccess',form.oneTimeAccess);
try{
await api.post('/upload',fd,{headers:{'Content-Type':'multipart/form-data'}});
toast.success('File uploaded & QR generated!');
setSelectedFile(null);
setForm({password:'',expiresIn:'',oneTimeAccess:false});
if(fileRef.current)fileRef.current.value='';
fetchFiles();
setTab('files');
}catch(err){
toast.error(err.response?.data?.message||'Upload failed');
}finally{setUploading(false);}
};
const handleDelete=async(id)=>{
if(!window.confirm('Delete this file?'))return;
try{
await api.delete(`/upload/${id}`);
toast.success('File deleted');
setFiles(f=>f.filter(x=>x._id!==id));
}catch{toast.error('Delete failed');}
};
const downloadQR=(qrCode,name)=>{
const a=document.createElement('a');
a.href=qrCode;a.download=`qr-${name}.png`;a.click();
};
const copyLink=(token)=>{
const url=`http://${window.location.hostname}:5000/api/file-access/${token}`;
navigator.clipboard.writeText(url);
toast.success('Link copied!');
};
const fmt=(d)=>new Date(d).toLocaleString();
const fmtSize=(b)=>{
if(!b)return'-';
if(b<1024)return b+' B';
if(b<1048576)return(b/1024).toFixed(1)+' KB';
return(b/1048576).toFixed(1)+' MB';
};
const isExpired=(f)=>f.expiresAt&&new Date()>new Date(f.expiresAt);
const fileIcon=(mime)=>{
if(!mime)return'📄';
if(mime.startsWith('image/'))return'🖼️';
if(mime==='application/pdf')return'📕';
if(mime.includes('word'))return'📝';
if(mime.includes('sheet')||mime.includes('excel'))return'📊';
if(mime.includes('zip'))return'🗜️';
if(mime.startsWith('video/'))return'🎬';
return'📄';
};
return(
<div style={S.page}>
<nav style={S.nav}>
<span style={S.brand}>🔐 SecureQR</span>
<div style={{display:'flex',alignItems:'center',gap:16}}>
<span style={{color:'#94a3b8',fontSize:14}}>👤 {user?.username}</span>
<button className="btn-secondary"onClick={()=>{logout();navigate('/login');}}>Logout</button>
</div>
</nav>
<div style={S.container}>
<div style={S.statsRow}>
{[
{icon:'📁',label:'Total Files',val:files.length},
{icon:'📊',label:'Total Scans',val:files.reduce((a,f)=>a+(f.scanCount||0),0)},
{icon:'🔗',label:'Active Links',val:files.filter(f=>!isExpired(f)).length},
{icon:'👁️',label:'One-Time Links',val:files.filter(f=>f.oneTimeAccess).length},
].map(s=>(
<div key={s.label}className="glass"style={S.stat}>
<div style={{fontSize:28}}>{s.icon}</div>
<div style={{fontSize:30,fontWeight:700,color:'#818cf8'}}>{s.val}</div>
<div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
</div>
))}
</div>
<div style={S.tabs}>
{[['files','📁 My Files'],['upload','⬆️ Upload'],['history','📋 History']].map(([k,l])=>(
<button key={k}onClick={()=>setTab(k)}
style={{...S.tab,...(tab===k?S.tabActive:{})}}>{l}</button>
))}
</div>
{tab==='upload'&&(
<div className="glass fade-in"style={{padding:32}}>
<h2 style={S.sectionTitle}>Upload New File</h2>
<form onSubmit={handleUpload}style={{display:'flex',flexDirection:'column',gap:20}}>
<div style={S.dropZone}onClick={()=>fileRef.current?.click()}>
<input ref={fileRef}type="file"style={{display:'none'}}
onChange={e=>setSelectedFile(e.target.files[0])}/>
{selectedFile?(
<div style={{textAlign:'center'}}>
<div style={{fontSize:36}}>📄</div>
<p style={{color:'#818cf8',fontWeight:600,marginTop:8}}>{selectedFile.name}</p>
<p style={{color:'#64748b',fontSize:12}}>{fmtSize(selectedFile.size)}</p>
</div>
):(
<div style={{textAlign:'center'}}>
<div style={{fontSize:44}}>☁️</div>
<p style={{color:'#94a3b8',marginTop:8}}>Click to select a file</p>
<p style={{color:'#64748b',fontSize:12,marginTop:4}}>PDF, Images, Docs, ZIP — Max 50MB</p>
</div>
)}
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
<div>
<label className="label">File Password *</label>
<input className="input-field"type="password"placeholder="Set a password for this file"
value={form.password}onChange={e=>setForm({...form,password:e.target.value})}required/>
</div>
<div>
<label className="label">Expires In (hours, optional)</label>
<input className="input-field"type="number"placeholder="e.g. 24"
value={form.expiresIn}onChange={e=>setForm({...form,expiresIn:e.target.value})}min="1"/>
</div>
</div>
<label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
<input type="checkbox"checked={form.oneTimeAccess}
onChange={e=>setForm({...form,oneTimeAccess:e.target.checked})}
style={{accentColor:'#6366f1',width:16,height:16}}/>
<span style={{color:'#94a3b8',fontSize:14}}>👁️ One-time access only</span>
</label>
<button className="btn-primary"type="submit"disabled={uploading}>
{uploading?<><span className="spinner"/>Uploading...</>:'🚀 Upload & Generate QR'}
</button>
</form>
</div>
)}
{tab==='files'&&(
<div className="fade-in">
{loadingFiles?(
<div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}>
<div className="spinner"style={{width:36,height:36}}/>
</div>
):files.length===0?(
<div className="glass"style={{padding:'60px 20px',textAlign:'center'}}>
<div style={{fontSize:64}}>📭</div>
<h3 style={{color:'#94a3b8',marginTop:16}}>No files yet</h3>
<p style={{color:'#64748b',marginTop:8}}>Upload your first file to get started</p>
<button className="btn-primary"style={{marginTop:20,width:'auto',padding:'10px 28px'}}
onClick={()=>setTab('upload')}>Upload File</button>
</div>
):(
<div style={S.grid}>
{files.map(file=>(
<div key={file._id}className="glass"style={S.fileCard}>
<div style={{display:'flex',alignItems:'flex-start',gap:12}}>
<div style={{fontSize:34,flexShrink:0}}>{fileIcon(file.mimeType)}</div>
<div style={{flex:1,minWidth:0}}>
<p style={{fontSize:14,fontWeight:600,color:'#e2e8f0',wordBreak:'break-all'}}>{file.originalName}</p>
<p style={{fontSize:12,color:'#64748b',marginTop:2}}>{fmtSize(file.fileSize)} · {fmt(file.createdAt)}</p>
</div>
<div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end',flexShrink:0}}>
{isExpired(file)&&<span className="badge badge-danger">Expired</span>}
{file.oneTimeAccess&&<span className="badge badge-warning">One-time</span>}
{file.accessed&&<span className="badge badge-info">Used</span>}
</div>
</div>
<div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:4,marginTop:8}}>
<span style={{fontSize:12,color:'#64748b'}}>📊 {file.scanCount||0} scans</span>
{file.expiresAt&&<span style={{fontSize:12,color:'#64748b'}}>⏰ {fmt(file.expiresAt)}</span>}
</div>
<div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
<button className="btn-secondary"onClick={()=>setSelectedQR(file)}>🔍 View QR</button>
<button className="btn-secondary"onClick={()=>copyLink(file.token)}>🔗 Copy Link</button>
<button className="btn-danger"onClick={()=>handleDelete(file._id)}>🗑️ Delete</button>
</div>
</div>
))}
</div>
)}
</div>
)}
{tab==='history'&&(
<div className="fade-in">
{history.length===0?(
<div className="glass"style={{padding:'60px 20px',textAlign:'center'}}>
<div style={{fontSize:64}}>📋</div>
<h3 style={{color:'#94a3b8',marginTop:16}}>No access logs yet</h3>
</div>
):(
<div className="glass"style={{overflow:'hidden'}}>
<div style={{overflowX:'auto'}}>
<table style={{width:'100%',borderCollapse:'collapse'}}>
<thead>
<tr style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
{['File','Time','IP','Status'].map(h=>(
<th key={h}style={{padding:'14px 20px',textAlign:'left',fontSize:12,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</th>
))}
</tr>
</thead>
<tbody>
{history.map(log=>(
<tr key={log._id}style={{borderBottom:'1px solid rgba(255,255,255,.04)'}}>
<td style={{padding:'13px 20px',fontSize:13,color:'#94a3b8'}}>{log.fileId?.originalName||'Deleted'}</td>
<td style={{padding:'13px 20px',fontSize:13,color:'#94a3b8'}}>{fmt(log.createdAt)}</td>
<td style={{padding:'13px 20px',fontSize:13,color:'#94a3b8'}}>{log.ip||'-'}</td>
<td style={{padding:'13px 20px'}}>
<span className={`badge ${log.success?'badge-success':'badge-danger'}`}>
{log.success?'✅ Success':'❌ Failed'}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}
</div>
)}
</div>
{selectedQR&&(
<div style={S.overlay}onClick={()=>setSelectedQR(null)}>
<div className="glass"style={S.modal}onClick={e=>e.stopPropagation()}>
<h3 style={{color:'#f1f5f9',marginBottom:4,fontSize:18}}>QR Code</h3>
<p style={{color:'#64748b',fontSize:13,marginBottom:20}}>{selectedQR.originalName}</p>
<img src={selectedQR.qrCode}alt="QR"style={{width:220,height:220,borderRadius:12,background:'white',padding:8}}/>
<p style={{color:'#64748b',fontSize:11,marginTop:12,textAlign:'center'}}>
Scan to open password page
</p>
<div style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap',justifyContent:'center'}}>
<button className="btn-primary"style={{width:'auto',padding:'10px 20px'}}
onClick={()=>downloadQR(selectedQR.qrCode,selectedQR.originalName)}>⬇️ Download QR</button>
<button className="btn-secondary"onClick={()=>copyLink(selectedQR.token)}>🔗 Copy Link</button>
<button className="btn-secondary"onClick={()=>setSelectedQR(null)}>✕ Close</button>
</div>
</div>
</div>
)}
</div>
);
}
const S={
page:{minHeight:'100vh',background:'#0f0f1a'},
nav:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',borderBottom:'1px solid rgba(255,255,255,.08)',background:'rgba(15,15,26,.95)',backdropFilter:'blur(10px)',position:'sticky',top:0,zIndex:100},
brand:{fontSize:20,fontWeight:700,color:'#818cf8'},
container:{maxWidth:1100,margin:'0 auto',padding:'32px 20px'},
statsRow:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32},
stat:{padding:'20px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:4},
tabs:{display:'flex',gap:4,marginBottom:24,borderBottom:'1px solid rgba(255,255,255,.08)'},
tab:{background:'none',border:'none',color:'#64748b',padding:'10px 20px',cursor:'pointer',fontSize:14,fontWeight:500,borderBottom:'2px solid transparent',transition:'all .2s'},
tabActive:{color:'#818cf8',borderBottom:'2px solid #6366f1'},
sectionTitle:{fontSize:20,fontWeight:600,color:'#f1f5f9',marginBottom:24},
dropZone:{border:'2px dashed rgba(99,102,241,.4)',borderRadius:12,padding:'40px 20px',textAlign:'center',cursor:'pointer',background:'rgba(99,102,241,.04)',transition:'border-color .3s'},
grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16},
fileCard:{padding:20,display:'flex',flexDirection:'column',gap:8},
overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'},
modal:{padding:36,textAlign:'center',maxWidth:360,width:'90%'},
};
