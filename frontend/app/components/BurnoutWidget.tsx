'use client';

import { useBurnout } from '../hooks/useBurnout';

export default function BurnoutWidget() {
  const { data, loading } = useBurnout();

  if (loading || !data) {
    return (
      <div className="glass" style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const { score, level, factors } = data;

  let color = 'var(--success)';
  let message = 'พลังงานดีเยี่ยม ตารางงานสมดุล';
  let icon = '🟢';
  if (level === 'Warning') {
    color = 'var(--warning)';
    message = 'เริ่มมีความตึงเครียด แนะนำให้กระจายงาน';
    icon = '🟡';
  } else if (level === 'Critical') {
    color = 'var(--danger)';
    message = 'เสี่ยงภาวะหมดไฟ! แนะนำให้พักเต็มวัน';
    icon = '🔴';
  }

  // Semi-circle gauge math
  // R = 120, cx = 140, cy = 140
  const r = 120;
  const circumference = Math.PI * r; 
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass anim-fade-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌡️</span> Burnout Risk
        </h3>
      </div>

      {/* Gauge */}
      <div style={{ position: 'relative', width: 280, height: 150, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <svg width="280" height="150" viewBox="0 0 280 150">
          {/* Background Arc */}
          <path
            d="M 20 140 A 120 120 0 0 1 260 140"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d="M 20 140 A 120 120 0 0 1 260 140"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
          />
        </svg>

        {/* Text inside gauge */}
        <div style={{ position: 'absolute', bottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: -1, color: 'var(--text-primary)' }}>
            {score}<span style={{ fontSize: 24, color: 'var(--text-muted)' }}>%</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color, marginTop: 4 }}>
            {level.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        {icon} {message}
      </div>

      {/* Factors Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
        <FactorRow 
          label={factors.overdue.label} 
          val={`${factors.overdue.score}/${factors.overdue.max}`} 
          pct={(factors.overdue.score / factors.overdue.max) * 100} 
          desc={`${factors.overdue.count} งาน`}
        />
        <FactorRow 
          label={factors.intensity.label} 
          val={`${factors.intensity.score}/${factors.intensity.max}`} 
          pct={(factors.intensity.score / factors.intensity.max) * 100} 
          desc={`${factors.intensity.count} งาน`}
        />
        <FactorRow 
          label={factors.overwork.label} 
          val={`${factors.overwork.score}/${factors.overwork.max}`} 
          pct={(factors.overwork.score / factors.overwork.max) * 100} 
          desc={`${factors.overwork.hours} ชม.`}
        />
        <FactorRow 
          label={factors.noRest.label} 
          val={`${factors.noRest.score}/${factors.noRest.max}`} 
          pct={(factors.noRest.score / factors.noRest.max) * 100} 
          desc={`${factors.noRest.days} วัน`}
        />
      </div>
    </div>
  );
}

function FactorRow({ label, val, pct, desc }: { label: string; val: string; pct: number; desc: string }) {
  const barColor = pct > 75 ? 'var(--danger)' : pct > 40 ? 'var(--warning)' : 'var(--success)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({desc})</span></span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
      </div>
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
}
