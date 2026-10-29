import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./config";
import type { Plan } from "../types";

export interface CompletedBuildRecord {
  slug: string;
  name: string;
  variant: string;
  category: string;
  archetype?: string;
  stepsCount: number;
  timeSpentMs?: number | null;
  timeSpentMinutes?: number | null;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  completedAt: unknown;
}

/**
 * Persist build completion details to Firestore.
 * Saves to global 'completed_builds' and optionally updates user's profile history.
 */
export async function recordCompletedBuild(
  plan: Plan,
  slug: string,
  spentMinutes: number | null,
  finishMs?: number | null,
): Promise<void> {
  if (!db) return;
  try {
    const user = auth?.currentUser;
    const s = plan.spec;

    await addDoc(collection(db, "completed_builds"), {
      slug,
      name: s.name,
      variant: s.variant || "",
      category: s.category || "",
      archetype: s.archetype || "",
      stepsCount: plan.steps.length,
      timeSpentMinutes: spentMinutes,
      timeSpentMs: finishMs ?? null,
      userId: user?.uid ?? null,
      userEmail: user?.email ?? null,
      userName: user?.displayName ?? null,
      completedAt: serverTimestamp(),
    });

    if (user?.uid) {
      const userCompletionRef = doc(db, "users", user.uid, "completed_builds", slug);
      await setDoc(
        userCompletionRef,
        {
          slug,
          name: s.name,
          variant: s.variant || "",
          category: s.category || "",
          stepsCount: plan.steps.length,
          timeSpentMinutes: spentMinutes,
          timeSpentMs: finishMs ?? null,
          completedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  } catch (err) {
    console.warn("Could not record completed build in Firestore:", err);
  }
}
