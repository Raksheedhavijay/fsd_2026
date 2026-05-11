import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        username: form.username, email: form.email, password: form.password
      });
      login(data.token, data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bg1}/><div style={S.bg2}/>
      <div className="glass fade-in" style={S.card}>
        <div style={S.logo}>🛡️</div>
        <h1 style={S.title}>Create Account</h1>
        <p style={S.sub}>Join the secure file sharing platform</p>
        <form onSubmit={handleSubmit} style={S.form}>
          <div>
            <label className="label">Username</label>
            <input className="input-field" placeholder="johndoe"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} required/>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input-field" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required/>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner"/>Creating...</> : 'Create Account'}
          </button>
        </form>
        <p style={S.link}>Already have an account? <Link to="/login" style={S.a}>Sign in</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' },
  bg1:   { position:'fixed', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%)', top:'-120px', right:'-120px', pointerEvents:'none' },
  bg2:   { position:'fixed', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 70%)', bottom:'-120px', left:'-120px', pointerEvents:'none' },
  card:  { width:'100%', maxWidth:420, padding:'40px 36px', position:'relative', zIndex:1 },
  logo:  { fontSize:50, textAlign:'center', marginBottom:14 },
  title: { fontSize:28, fontWeight:700, textAlign:'center', color:'#f1f5f9' },
  sub:   { fontSize:14, color:'#64748b', textAlign:'center', marginTop:6, marginBottom:28 },
  form:  { display:'flex', flexDirection:'column', gap:18 },
  link:  { textAlign:'center', marginTop:24, fontSize:14, color:'#64748b' },
  a:     { color:'#818cf8', textDecoration:'none', fontWeight:600 },
};
