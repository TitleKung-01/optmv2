'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEnergy } from '@/hooks/useEnergy';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';
import EnergyGauge from './EnergyGauge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/tasks', label: 'Tasks', icon: '✦' },
  { href: '/schedule', label: 'Schedule', icon: '◷' },
  { href: '/profile', label: 'Profile', icon: '◉' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, fetchProfile } = useProfile();
  const energy = useEnergy(profile);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)',
        gap: 12,
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }} className="grad-text">
              ⚡ SmartSched
            </div>
          </div>
        )}
        <button
          className="btn-icon"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'ขยาย sidebar' : 'ย่อ sidebar'}
          style={{ cursor: 'pointer', fontSize: 16 }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Energy Gauge (mini) */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <EnergyGauge energy={energy} compact />
        </div>
      )}

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '11px 14px',
                borderRadius: 'var(--radius-md)',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                color: active ? 'var(--indigo-light)' : 'var(--text-secondary)',
                background: active
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))'
                  : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                transition: 'all 180ms ease',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Sign Out */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 12,
      }}>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        )}
        <button
          className="btn-icon"
          onClick={signOut}
          title="ออกจากระบบ"
          style={{ fontSize: 16, flexShrink: 0 }}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
