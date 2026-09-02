import { mockMachines, mockHoops, mockFabrics, mockPresets } from "./embroidery-data";
import type { Machine, Hoop, Fabric, DigitizingPreset } from "./embroidery-data";

const KEY = "mj_admin_store_v1";

type Store = {
  machines: Machine[]
  hoops: Hoop[]
  fabrics: Fabric[]
  presets: DigitizingPreset[]
}

function load(): Store {
  if (typeof window === "undefined") return { machines: mockMachines, hoops: mockHoops, fabrics: mockFabrics, presets: mockPresets };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { machines: mockMachines, hoops: mockHoops, fabrics: mockFabrics, presets: mockPresets };
    const parsed = JSON.parse(raw);
    return {
      machines: parsed.machines ?? mockMachines,
      hoops: parsed.hoops ?? mockHoops,
      fabrics: parsed.fabrics ?? mockFabrics,
      presets: parsed.presets ?? mockPresets,
    }
  } catch { return { machines: mockMachines, hoops: mockHoops, fabrics: mockFabrics, presets: mockPresets } }
}

function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("mj_admin_update", { detail: s }));
}

export function getAdminStore(): Store { return load(); }

export function setAdminStore(patch: Partial<Store>) {
  const next = { ...load(), ...patch };
  save(next);
}

export function subscribeAdmin(cb: (s: Store) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener("mj_admin_update", handler as EventListener);
  window.addEventListener("storage", () => cb(load()));
  return () => {
    window.removeEventListener("mj_admin_update", handler as EventListener);
    window.removeEventListener("storage", () => cb(load()));
  }
}

// convenience helpers
export const adminHelpers = {
  toggleMachine(id: string) {
    const s = load();
    s.machines = s.machines.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m);
    save(s);
  },
  deleteMachine(id: string) { const s = load(); s.machines = s.machines.filter(m => m.id !== id); save(s); },
  addMachine(m: Machine) { const s = load(); s.machines = [...s.machines, m]; save(s); },
  toggleHoop(id: string) { const s = load(); s.hoops = s.hoops.map(h => h.id === id ? { ...h, ativo: !h.ativo } : h); save(s); },
  deleteHoop(id: string) { const s = load(); s.hoops = s.hoops.filter(h => h.id !== id); save(s); },
  addHoop(h: Hoop) { const s = load(); s.hoops = [...s.hoops, h]; save(s); },
  toggleFabric(id: string) { const s = load(); s.fabrics = s.fabrics.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f); save(s); },
  deleteFabric(id: string) { const s = load(); s.fabrics = s.fabrics.filter(f => f.id !== id); save(s); },
  addFabric(f: Fabric) { const s = load(); s.fabrics = [...s.fabrics, f]; save(s); },
  deletePreset(id: string) { const s = load(); s.presets = s.presets.filter(p => p.id !== id); save(s); },
  addPreset(p: DigitizingPreset) { const s = load(); s.presets = [...s.presets, p]; save(s); },
}
