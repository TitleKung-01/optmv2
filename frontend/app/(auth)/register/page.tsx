'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace('/profile'), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        top: -100, right: -100, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        bottom: -80, left: -80, pointerEvents: 'none',
      }} />

      <div className="glass anim-fade-up" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }} className="grad-text">สมัครสมาชิก</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
            เริ่มต้นจัดตารางงานอัจฉริยะ
          </p>
        </div>

        {success ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            background: 'rgba(34,211,164,0.08)', border: '1px solid rgba(34,211,164,0.2)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>สมัครสำเร็จ!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              กำลังไปตั้งค่าโปรไฟล์...
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label">อีเมล</label>
              <input id="register-email" type="email" className="input" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
            </div>
            <div>
              <label className="input-label">รหัสผ่าน</label>
              <input id="register-password" type="password" className="input" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" required />
            </div>
            <div>
              <label className="input-label">ยืนยันรหัสผ่าน</label>
              <input id="register-confirm" type="password" className="input" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                fontSize: 13, color: 'var(--danger)',
              }}>⚠ {error}</div>
            )}

            <button id="register-submit" type="submit" className="btn btn-primary"
              disabled={loading} style={{ marginTop: 4, padding: '13px', fontSize: 15 }}>
              {loading ? <><span className="spinner" /> กำลังสมัคร...</> : '✦ สมัครสมาชิก'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          มีบัญชีแล้ว?{' '}
          <Link href="/login" style={{ color: 'var(--indigo-light)', fontWeight: 600, textDecoration: 'none' }}>
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
