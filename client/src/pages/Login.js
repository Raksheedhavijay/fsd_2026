import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bg1}/><div style={S.bg2}/>
      <div className="glass fade-in" style={S.card}>
        <div style={S.logo}>🔐</div>
        <h1 style={S.title}>Welcome Back</h1>
        <p style={S.sub}>Sign in to your secure vault</p>
        <form onSubmit={handleSubmit} style={S.form}>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner"/>Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p style={S.link}>Don't have an account? <Link to="/signup" style={S.a}>Sign up</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' },
  bg1:   { position:'fixed', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%)', top:'-120px', left:'-120px', pointerEvents:'none' },
  bg2:   { position:'fixed', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 70%)', bottom:'-120px', right:'-120px', pointerEvents:'none' },
  card:  { width:'100%', maxWidth:420, padding:'40px 36px', position:'relative', zIndex:1 },
  logo:  { fontSize:50, textAlign:'center', marginBottom:14 },
  title: { fontSize:28, fontWeight:700, textAlign:'center', color:'#f1f5f9' },
  sub:   { fontSize:14, color:'#64748b', textAlign:'center', marginTop:6, marginBottom:32 },
  form:  { display:'flex', flexDirection:'column', gap:20 },
  link:  { textAlign:'center', marginTop:24, fontSize:14, color:'#64748b' },
  a:     { color:'#818cf8', textDecoration:'none', fontWeight:600 },
};
