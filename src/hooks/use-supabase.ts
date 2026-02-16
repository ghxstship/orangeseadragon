"use client";

import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useState, useSyncExternalStore } from "react";

type AuthSnapshot = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

let authSnapshot: AuthSnapshot = {
  user: null,
  session: null,
  loading: true,
};

let authInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setAuthSnapshot(next: Partial<AuthSnapshot>) {
  authSnapshot = { ...authSnapshot, ...next };
  notifyListeners();
}

function initializeAuthStore() {
  if (authInitialized || typeof window === "undefined") {
    return;
  }

  authInitialized = true;
  const supabase = createClient();

  void supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      setAuthSnapshot({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    })
    .catch(() => {
      setAuthSnapshot({ loading: false });
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    setAuthSnapshot({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initializeAuthStore();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return authSnapshot;
}

export function useSupabase() {
  const [supabase] = useState(() => createClient());
  return supabase;
}

export function useUser() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    user: snapshot.user,
    loading: snapshot.loading,
  };
}

export function useSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    session: snapshot.session,
    loading: snapshot.loading,
  };
}
