import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };
  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>People Pluse Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <button type="submit" style={{ width: '100%', padding: 8, background: '#1877f2', color: 'white', border: 'none', borderRadius: 4 }}>Login</button>
      </form>
    </div>
  );
}
