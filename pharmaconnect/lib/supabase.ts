import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export interface RealtimeSignalPayload {
  id?: number;
  topic?: string;
  event?: string;
  pharmacyId?: number | null;
  createdAt?: string;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  browserClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return browserClient;
}

/**
 * Souscrit aux signaux temps réel anonymisés (table RealtimeSignal, sans PII)
 * afin de rafraîchir instantanément la messagerie, les notifications et le catalogue.
 */
export function subscribeRealtimeSignals(
  channelName: string,
  onSignal: (signal: RealtimeSignalPayload) => void,
): () => void {
  const client = getSupabaseBrowserClient();
  if (!client) return () => {};

  let timer: number | null = null;
  let lastSignal: RealtimeSignalPayload = {};

  const channel = client
    .channel(`pharmaconnect-${channelName}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'RealtimeSignal' },
      payload => {
        lastSignal = (payload.new as RealtimeSignalPayload) || {};
        if (timer !== null) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          timer = null;
          onSignal(lastSignal);
        }, 450);
      },
    )
    .subscribe();

  return () => {
    if (timer !== null) window.clearTimeout(timer);
    void client.removeChannel(channel);
  };
}
