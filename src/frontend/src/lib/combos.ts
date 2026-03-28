export interface Combo {
  id: string;
  name: string;
  tagline: string;
  productNames: string[];
  discountType: "percent" | "fixed";
  discountValue: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: number;
}

const STORAGE_KEY = "propfolio_combos";

export function loadCombos(): Combo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Combo[];
  } catch {
    return [];
  }
}

export function saveCombos(combos: Combo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
}

export function createCombo(data: Omit<Combo, "id" | "createdAt">): Combo {
  return {
    ...data,
    id: `combo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
}
