import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export interface StoredUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLoginAt: number;
}

/**
 * Saves every user logging into Firestore under the 'users' collection,
 * and maintains a local cache for offline work on building sites.
 */
export async function recordUserLogin(user: User): Promise<void> {
  const profile: StoredUserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("aiconstruct_user_profile", JSON.stringify(profile));
    } catch {
      // LocalStorage might be full or restricted
    }
  }

  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          lastLoginAt: serverTimestamp(),
          role: "apprentice",
          platform: "aiconstruct.uk",
        },
        { merge: true },
      );
    } catch (err) {
      console.warn("Could not record login in Firestore:", err);
    }
  }
}

export async function loginWithGoogle(): Promise<User> {
  if (!auth) throw new Error("Firebase Auth is not configured. Add NEXT_PUBLIC_FIREBASE credentials to .env.local.");
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await recordUserLogin(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth is not configured. Add NEXT_PUBLIC_FIREBASE credentials to .env.local.");
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  await recordUserLogin(cred.user);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth is not configured. Add NEXT_PUBLIC_FIREBASE credentials to .env.local.");
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  await recordUserLogin(cred.user);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("aiconstruct_user_profile");
    } catch {}
  }
  if (auth) {
    await signOut(auth);
  }
}
