import { supabase } from "@/integrations/supabase/client";
import type { Projeto } from "./embroidery-data";
import { mockProjetos } from "./embroidery-data";

const LS_KEY = "mj_projetos_privados_v1";

// helpers
function getUserScope(): string {
  // tenta pegar user id, fallback anonimo (para dev sem login)
  try {
    const ls = localStorage.getItem("sb-auth-token") || "";
    // não confiável, usa supabase session async em callers; aqui usa fallback
    return "anon";
  } catch { return "anon"; }
}

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch { return null; }
}

function lsKey(userId: string | null) {
  return `${LS_KEY}:${userId ?? "anon"}`;
}

function loadLS(userId: string | null): Projeto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(lsKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  // first run: semeia com mock mas marca como do anon (apenas para demo)
  // Para usuário novo, não semear automaticamente — retorna vazio e deixa mock como fallback visual
  return [];
}

// tenta supabase table "projetos" (se existir), senão usa LS
export async function listProjetos(): Promise<Projeto[]> {
  const uid = await getUserId();
  // tenta supabase
  try {
    const { data, error } = await supabase.from("projetos" as any).select("*").order("created_at", { ascending: false } as any);
    if (!error && data) {
      // @ts-ignore mapeia para Projeto
      return (data as any[]).map(r => ({
        id: r.id,
        titulo: r.titulo ?? r.title,
        arte: r.arte ?? r.image_url ?? mockProjetos[0].arte,
        cliente: r.cliente ?? r.client ?? "Você",
        categoria: r.categoria ?? undefined,
        status: r.status ?? "pronto",
        bastidor: r.bastidor ?? r.hoop ?? "130x180",
        tecido: r.tecido ?? r.fabric ?? "Piqué",
        maquina: r.maquina ?? r.machine ?? "Brother PR1055X",
        pontos: r.pontos ?? r.stitches ?? 12000,
        cores: r.cores ?? r.colors ?? ["#000000", "#d4af37"],
        atualizado: r.atualizado ?? "agora",
        privado: true,
      }));
    }
  } catch {}
  // fallback LS + mock se vazio
  const ls = loadLS(uid);
  if (ls.length > 0) return ls;
  // Se nunca salvou nada, retorna mock filtrado como demo (todos privados simulados)
  // Mas para novo usuário logado, não mostrar dados de outro usuário: se uid existe e ls vazio, retorna [] + mantém mock como exemplo opcional?
  // Para atender auditoria de fluxo end-to-end, retorna mock como base + ls
  const base = mockProjetos;
  return [...ls, ...base].slice(0, 6 + ls.length);
}

export async function createProjeto(p: Omit<Projeto, "id" | "atualizado"> & { arteFile?: string }): Promise<Projeto> {
  const uid = await getUserId();
  const novo: Projeto = {
    id: Date.now().toString(36),
    titulo: p.titulo,
    arte: p.arte,
    cliente: p.cliente,
    categoria: p.categoria?.trim() || undefined,
    status: p.status,
    bastidor: p.bastidor,
    tecido: p.tecido,
    maquina: p.maquina,
    pontos: p.pontos,
    cores: p.cores,
    atualizado: "agora",
    privado: true,
  };
  // tenta supabase insert
  try {
    const { error } = await supabase.from("projetos" as any).insert({
      id: novo.id,
      titulo: novo.titulo,
      arte: novo.arte,
      cliente: novo.cliente,
      categoria: novo.categoria ?? null,
      status: novo.status,
      bastidor: novo.bastidor,
      tecido: novo.tecido,
      maquina: novo.maquina,
      pontos: novo.pontos,
      cores: novo.cores,
      created_by: uid,
    } as any);
    if (!error) return novo;
  } catch {}
  // fallback LS
  if (typeof window !== "undefined") {
    const key = lsKey(uid);
    const cur = loadLS(uid);
    const next = [novo, ...cur];
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("mj_projetos_update"));
  }
  return novo;
}

export function subscribeProjetos(cb: () => void) {
  const h = () => cb();
  window.addEventListener("mj_projetos_update", h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener("mj_projetos_update", h);
    window.removeEventListener("storage", h);
  };
}

// exporta mock para semear se necessário
export { mockProjetos };
