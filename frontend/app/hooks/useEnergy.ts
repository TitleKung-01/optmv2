'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, EnergyState, EnergyLevel } from '../lib/types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function useEnergy(profile: UserProfile | null): EnergyState {
  const [energy, setEnergy] = useState<EnergyState>({
    level: 'normal',
    percentage: 60,
    label: 'ปกติ',
  });

  useEffect(() => {
    function compute() {
      if (!profile?.peak_time_start || !profile?.peak_time_end) {
        setEnergy({ level: 'normal', percentage: 60, label: 'ปกติ' });
        return;
      }

      const nowMin = getCurrentMinutes();
      const peakS = timeToMinutes(profile.peak_time_start);
      const peakE = timeToMinutes(profile.peak_time_end);
      const dipS = profile.dip_time_start ? timeToMinutes(profile.dip_time_start) : -1;
      const dipE = profile.dip_time_end ? timeToMinutes(profile.dip_time_end) : -1;

      let level: EnergyLevel = 'normal';
      let percentage = 60;
      let label = 'ปกติ';

      if (nowMin >= peakS && nowMin <= peakE) {
        level = 'peak';
        // linear interpolation within peak window
        const mid = (peakS + peakE) / 2;
        const dist = Math.abs(nowMin - mid) / ((peakE - peakS) / 2);
        percentage = Math.round(85 + (1 - dist) * 15); // 85–100%
        label = 'Peak 🔥';
      } else if (dipS > 0 && nowMin >= dipS && nowMin <= dipE) {
        level = 'dip';
        const mid = (dipS + dipE) / 2;
        const dist = Math.abs(nowMin - mid) / ((dipE - dipS) / 2);
        percentage = Math.round(20 + dist * 20); // 20–40%
        label = 'พลังงานต่ำ 😴';
      } else {
        // normal — closer to peak = higher
        const distFromPeak = Math.min(
          Math.abs(nowMin - peakS),
          Math.abs(nowMin - peakE)
        );
        percentage = Math.max(45, Math.min(75, 75 - distFromPeak / 5));
        percentage = Math.round(percentage);
        label = 'ปกติ ⚡';
      }

      setEnergy({ level, percentage, label });
    }

    compute();
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [profile]);

  return energy;
}
