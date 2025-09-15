import { useState, useEffect } from 'react';

export interface LocalUser {
  id: string;
  email: string;
  created_at: string;
}

export interface LocalUserProfile {
  user_id: string;
  username: string;
  full_name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  dosha_type: string;
  dominant_dosha?: string;
  secondary_dosha?: string;
  yoga_profile?: any;
  sadhana_points: number;
  rank: string;
  created_at: string;
  updated_at: string;
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('localUser');
    const storedProfile = localStorage.getItem('localProfile');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // Create a new user locally
      const newUser: LocalUser = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        created_at: new Date().toISOString()
      };

      // Create default profile
      const newProfile: LocalUserProfile = {
        user_id: newUser.id,
        username: username || email.split('@')[0],
        full_name: '',
        birth_date: '',
        birth_time: '',
        birth_place: '',
        dosha_type: '',
        sadhana_points: 0,
        rank: 'Seeker',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('localUser', JSON.stringify(newUser));
      localStorage.setItem('localProfile', JSON.stringify(newProfile));
      localStorage.setItem('localPassword', password); // In real app, this should be hashed
      
      setUser(newUser);
      setProfile(newProfile);
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Failed to create account' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const storedUser = localStorage.getItem('localUser');
      const storedPassword = localStorage.getItem('localPassword');
      const storedProfile = localStorage.getItem('localProfile');
      
      if (storedUser && storedPassword === password) {
        const user = JSON.parse(storedUser);
        if (user.email === email) {
          setUser(user);
          if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
          }
          return { error: null };
        }
      }
      
      return { error: { message: 'Invalid email or password' } };
    } catch (error) {
      return { error: { message: 'Failed to sign in' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    // Don't clear localStorage to preserve the account
    return { error: null };
  };

  const updateProfile = async (updates: Partial<LocalUserProfile>) => {
    if (!profile) return { error: { message: 'No profile found' } };
    
    const updatedProfile = { 
      ...profile, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    localStorage.setItem('localProfile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    
    return { error: null };
  };

  const fetchUserProfile = async (userId: string) => {
    const storedProfile = localStorage.getItem('localProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  };

  return {
    user,
    session: user ? { user } : null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile
  };
}