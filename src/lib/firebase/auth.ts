import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./config";

export type UserRole = "apprentice" | "author" | "admin";

export interface StoredUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  canAuthor: boolean;
  lastLoginAt: number;
}

/**
 * Saves every user logging into Firestore under the 'users' collection,
 * sets default access roles (apprentice vs author), and caches locally.
 */
export async function recordUserLogin(user: User): Promise<StoredUserProfile> {
  let profile: StoredUserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: "apprentice",
    canAuthor: false,
    lastLoginAt: Date.now(),
  };

  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        profile.role = (data.role as UserRole) ?? "apprentice";
        profile.canAuthor = Boolean(data.canAuthor ?? data.role === "author");
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      } else {
        // Users default to non-author (view-only apprentice) unless granted access
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email ?? null,
            displayName: user.displayName ?? null,
            photoURL: user.photoURL ?? null,
            lastLoginAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            role: "apprentice",
            canAuthor: false,
            platform: "aiconstruct.uk",
          },
          { merge: true },
        );
      }
    } catch (err) {
      console.warn("Could not record login in Firestore:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("aiconstruct_user_profile", JSON.stringify(profile));
    } catch {
      // LocalStorage might be full or restricted
    }
  }

  return profile;
}

/** Retrieve user profile and permissions by UID. */
export async function getUserProfile(uid: string): Promise<StoredUserProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: data.uid ?? uid,
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      role: (data.role as UserRole) ?? "apprentice",
      canAuthor: Boolean(data.canAuthor ?? data.role === "author"),
      lastLoginAt: data.lastLoginAt ? Number(data.lastLoginAt) : Date.now(),
    };
  } catch (err) {
    console.warn("Could not fetch user profile:", err);
    return null;
  }
}

/** Set author privileges for a specific user. */
export async function setUserAuthorAccess(uid: string, canAuthor: boolean): Promise<void> {
  if (!db) throw new Error("Firestore is not configured");
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      canAuthor,
      role: canAuthor ? "author" : "apprentice",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Query users segmented by whether they have author access. */
export async function getUsersByAuthorAccess(canAuthor: boolean): Promise<StoredUserProfile[]> {
  if (!db) return [];
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("canAuthor", "==", canAuthor));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        email: data.email ?? null,
        displayName: data.displayName ?? null,
        photoURL: data.photoURL ?? null,
        role: (data.role as UserRole) ?? (canAuthor ? "author" : "apprentice"),
        canAuthor: Boolean(data.canAuthor),
        lastLoginAt: data.lastLoginAt ? Number(data.lastLoginAt) : Date.now(),
      };
    });
  } catch (err) {
    console.warn("Could not query users by author access:", err);
    return [];
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
