'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthToast } from '@/hooks/use-auth-toast';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  generateKey,
  setSessionKey,
  clearSessionKey,
  getSessionKey,
} from '@/lib/crypto';

export type UserRole =
  | 'user'
  | 'admin'
  | 'supervisor'
  | 'content_manager'
  | 'data_analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joined?: any;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => void;
  encryptionKey: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register', '/'];
const roleBasedRedirects: Record<UserRole, string> = {
  admin: '/admin',
  supervisor: '/supervisor',
  data_analyst: '/data-analyst',
  content_manager: '/content-manager',
  user: '/dashboard',
};

const getRedirectPath = (role: UserRole | null) => {
  return role ? roleBasedRedirects[role] : '/login';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { showSuccessToast, showErrorToast } = useAuthToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          const userRole = userData.role;
          const fullUser = { ...userData, id: fbUser.uid };

          setUser(fullUser);
          setRole(userRole);

          const sessionKey = getSessionKey();
          if (sessionKey) {
            setEncryptionKey(sessionKey);
          }
        } else {
          await signOut(auth);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        setRole(null);
        setEncryptionKey(null);
        clearSessionKey();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
      return;
    }

    if (user && role) {
      if (isPublicRoute) {
        router.push(getRedirectPath(role));
        return;
      }
    }
  }, [user, role, loading, pathname, router]);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      const key = await generateKey(email, pass);
      setEncryptionKey(key);
      setSessionKey(key);
      showSuccessToast('Inicio de Sesión Exitoso', '¡Bienvenido de nuevo!');
    } catch (error: any) {
      showErrorToast('Error al Iniciar Sesión', 'Correo electrónico o contraseña no válidos.');
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const fbUser = userCredential.user;

      const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
        joined: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), newUser);

      const key = await generateKey(email, pass);
      setEncryptionKey(key);
      setSessionKey(key);

      showSuccessToast('Registro Exitoso', 'Tu cuenta ha sido creada.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showErrorToast('Registro Fallido', 'Ya existe un usuario con este correo electrónico.');
      } else {
        showErrorToast('Registro Fallido', error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    role,
    loading,
    login,
    register,
    logout,
    encryptionKey,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
