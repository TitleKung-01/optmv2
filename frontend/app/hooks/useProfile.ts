'use client';

import { useState, useCallback } from 'react';
import type { UserProfile } from '../lib/types';
import * as api from '../lib/api';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserProfile();
      setProfile(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateUserProfile(updates);
      setProfile(updated);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, fetchProfile, saveProfile };
}
