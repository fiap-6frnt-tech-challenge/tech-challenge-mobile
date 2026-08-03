import {
  createUserWithEmailAndPassword,
  type User,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

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

export const authService = {
  signUp,
};
