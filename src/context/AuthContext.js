import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthController } from '../controllers/AuthController';
import { UserModel } from '../models/UserModel';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    AuthController.getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
    });

    const unsub = AuthController.onAuthChange((s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    UserModel.getProfile(session.user.id)
      .then((p) => setProfile(p))
      .catch(() => setProfile(null));
  }, [session?.user?.id]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn: AuthController.signInWithEmail,
    signUp: AuthController.signUpWithEmail,
    signInGoogle: AuthController.signInWithGoogle,
    signOut: AuthController.signOut,
    refreshProfile: async () => {
      if (session?.user) {
        const p = await UserModel.getProfile(session.user.id);
        setProfile(p);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
