import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { dataService } from '../services/data';
import type { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: fullName });
      
      const profile: Profile = {
        id: user.uid,
        full_name: fullName,
        email,
        role: 'member',
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        ...profile,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      set({ user: profile, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signInGuest: async () => {
    set({ loading: true });
    try {
      // Attempt anonymous sign in for frictionless demo
      await signInAnonymously(auth);
      // Seed data will be handled by the onAuthStateChanged listener
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        const message = 'Anonymous authentication is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable "Anonymous" to use guest mode.';
        console.error(message);
        throw new Error(message);
      }
      
      console.warn('Anonymous auth failed, trying demo account fallback', error);
      
      // Fallback to email if anonymous is disabled in console
      try {
        await signInWithEmailAndPassword(auth, 'demo@nexus-taskflow.ai', 'NexusDemo123!');
      } catch {
        set({ loading: false });
        // If both fail, throw the original error
        throw error; 
      }
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = firebaseUser.email === 'ramcodeverse@gmail.com';
        // Fetch profile from Firestore
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          const profile: Profile = {
            id: firebaseUser.uid,
            ...data,
            role: isAdminEmail ? 'admin' : (data.role || 'member'),
            created_at: data.created_at?.toDate().toISOString(),
            updated_at: data.updated_at?.toDate().toISOString(),
          } as Profile;
          set({ user: profile, loading: false, initialized: true });

          // Sync admin role back to firestore if it changed
          if (isAdminEmail && data.role !== 'admin') {
            await dataService.profiles.update(firebaseUser.uid, { role: 'admin' });
          }

          // Sync name if it's generic and we have a better one
          const betterName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : '');
          if (betterName && (data.full_name === 'Anonymous User' || data.full_name === 'New User' || !data.full_name)) {
            await dataService.profiles.update(firebaseUser.uid, { full_name: betterName });
            set({ user: { ...profile, full_name: betterName } });
          }
        } else {
          // If profile doesn't exist yet but user is auth
          const displayName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : '');
          const profile: Profile = {
            id: firebaseUser.uid,
            full_name: displayName || (firebaseUser.isAnonymous ? 'Nexus Guest' : 'Anonymous User'),
            email: firebaseUser.email || '',
            role: isAdminEmail ? 'admin' : 'member',
            avatar_url: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          set({ user: profile, loading: false, initialized: true });
          
          // Persist profile if it's a real user (not anonymous) to prevent "Anonymous" name on subsequent reads
          if (!firebaseUser.isAnonymous) {
            try {
              await setDoc(doc(db, 'profiles', firebaseUser.uid), {
                ...profile,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
              });
            } catch (err) {
              console.error('Failed to auto-create profile:', err);
            }
          }
          
          // Seed data for guest/new user if needed
          if (firebaseUser.isAnonymous || profile.full_name === 'Nexus Guest') {
            dataService.utils.seedDemoData();
          }
        }
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    return unsubscribe;
  },
}));
