import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { getUserProfile } from "./auth";
import type { ProductSpec } from "../types";

export interface StoredAssemblyDoc {
  slug: string;
  name: string;
  authorUid: string;
  authorEmail: string | null;
  authorName: string | null;
  spec: ProductSpec;
  createdAt: unknown;
  updatedAt: unknown;
}

/**
 * Store a custom assembly in Firestore.
 * Verifies that the user has author access before saving.
 */
export async function storeAuthorAssembly(
  authorUid: string,
  spec: ProductSpec,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  if (!db) return { ok: false, error: "Database not configured" };

  const profile = await getUserProfile(authorUid);
  if (!profile || !profile.canAuthor) {
    return { ok: false, error: "User does not have author access to store assemblies" };
  }

  const cleanName = (spec.name || "assembly").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = spec.slug || `${cleanName}-${Date.now().toString(36)}`;
  const assemblyRef = doc(db, "author_assemblies", slug);

  await setDoc(
    assemblyRef,
    {
      slug,
      name: spec.name,
      authorUid,
      authorEmail: profile.email,
      authorName: profile.displayName,
      spec: { ...spec, slug },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { ok: true, slug };
}

/** Retrieve all assemblies created by authorized authors, or for a specific author. */
export async function getAuthorAssemblies(authorUid?: string): Promise<ProductSpec[]> {
  if (!db) return [];
  try {
    const col = collection(db, "author_assemblies");
    const q = authorUid ? query(col, where("authorUid", "==", authorUid)) : query(col);
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().spec as ProductSpec);
  } catch (err) {
    console.warn("Could not query author assemblies:", err);
    return [];
  }
}
