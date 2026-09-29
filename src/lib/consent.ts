import { supabase } from "@/integrations/supabase/client";

export const TERMS_VERSION = "2026-09-29";
const KEY = "debtfree_pending_consent";

export function markPendingConsent() {
  try { localStorage.setItem(KEY, TERMS_VERSION); } catch { /* ignore */ }
}

export async function flushPendingConsent() {
  let v: string | null = null;
  try { v = localStorage.getItem(KEY); } catch { return; }
  if (!v) return;
  const { error } = await supabase.rpc("record_consent", { _terms_version: v });
  if (!error) localStorage.removeItem(KEY);
}
