'use client';

import type { EnergyState } from '@/lib/types';

interface Props {
  energy: EnergyState;
  compact?: boolean;
}

export default function EnergyGauge({ energy, compact = false }: Props) {
  const { level, percentage, label } = energy;

  const color =
    level === 'peak'   ? '#22d3a4' :
    level === 'dip'    ? '#f43f5e' :
                         '#6366f1';

  const glowColor =
    level === 'peak'   ? 'rgba(34,211,164,0.4)'  :
    level === 'dip'    ? 'rgba(244,63,94,0.4)'   :
                         'rgba(99,102,241,0.4)';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Mini arc */}
        <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="15" fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 94.2} 94.2`}
              strokeDashoffset="23.55"
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 4px ${glowColor})` }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color,
          }}>
            {percentage}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Energy</div>
        </div>
      </div>
    );
  }

  // Full gauge
  const r = 54;
  const circ = 2 * Math.PI * r;
  // Show 270° arc (from 135° to 405°)
  const arcLength = circ * 0.75;
  const filled = arcLength * (percentage / 100);
  const gap = arcLength - filled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg viewBox="0 0 140 140" width="160" height="160" style={{ overflow: 'visible' }}>
          {/* Track */}
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circ - arcLength}`}
            strokeDashoffset={circ * 0.125}
          />
          {/* Fill */}
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap + circ * 0.25}`}
            strokeDashoffset={circ * 0.125}
            style={{
              transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>
            {percentage}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>%</div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color,
          textShadow: `0 0 12px ${glowColor}`,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          ระดับพลังงาน
        </div>
      </div>

      {/* Level bar */}
      <div style={{ width: '100%', maxWidth: 200 }}>
        <div style={{
          height: 6, borderRadius: 99,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            borderRadius: 99,
            transition: 'width 0.8s ease',
            boxShadow: `0 0 8px ${glowColor}`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
          <span>ต่ำ</span>
          <span>ปกติ</span>
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
}
