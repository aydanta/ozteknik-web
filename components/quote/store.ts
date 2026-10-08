'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Teklif listesi — fiyat ve sepet yok; adetli kod listesi. Tarayıcıda saklanır, gönderimde sunucuya gider. */
export interface QuoteItem {
  slug: string | null; // katalogda yoksa null (çoklu aramada eşleşmeyen satır)
  code: string;
  qty: number;
  note?: string;
}
interface QuoteState {
  items: QuoteItem[];
  add: (item: QuoteItem) => void;
  addMany: (items: QuoteItem[]) => void;
  setQty: (code: string, qty: number) => void;
  remove: (code: string) => void;
  clear: () => void;
}
const key = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const useQuote = create<QuoteState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const i = s.items.findIndex((x) => key(x.code) === key(item.code));
          if (i >= 0) {
            const items = [...s.items];
            items[i] = { ...items[i], qty: items[i].qty + item.qty };
            return { items };
          }
          return { items: [...s.items, item].slice(0, 400) };
        }),
      addMany: (list) =>
        set((s) => {
          const items = [...s.items];
          for (const item of list) {
            const i = items.findIndex((x) => key(x.code) === key(item.code));
            if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + item.qty };
            else items.push(item);
          }
          return { items: items.slice(0, 400) };
        }),
      setQty: (code, qty) => set((s) => ({ items: s.items.map((x) => (key(x.code) === key(code) ? { ...x, qty: Math.max(1, Math.min(99999, qty || 1)) } : x)) })),
      remove: (code) => set((s) => ({ items: s.items.filter((x) => key(x.code) !== key(code)) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'oz-quote',
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
      }),
      skipHydration: true,
    },
  ),
);

/** İstemci tarafında bir kez kalıcı listeyi yükle (SSR uyumu) */
let hydrated = false;
export function hydrateQuote() {
  if (hydrated) return;
  hydrated = true;
  void useQuote.persist.rehydrate();
}
