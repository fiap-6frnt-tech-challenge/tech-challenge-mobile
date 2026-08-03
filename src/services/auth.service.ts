import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Unsubscribe,
  type User,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

export type AuthStateSubscriber = (user: User | null) => void;

async function signUp(email: string, password: string, name: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

function subscribe(callback: AuthStateSubscriber): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export const authService = {
  signUp,
  signIn,
  signOut,
  subscribe,
};
