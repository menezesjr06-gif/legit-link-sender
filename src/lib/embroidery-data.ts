// Mock data central para admin no-code — depois conecta no Supabase
export type Machine = { id: string; nome: string; marca: string; agulhas: number; velocidade: string; formato: string; ativo: boolean }
export type Hoop = { id: string; nome: string; tamanho: string; mm: string; uso: string; ativo: boolean }
export type Fabric = { id: string; nome: string; peso: string; estabilizacao: string; agulha: string; cor: string; ativo: boolean }
export type DigitizingPreset = { id: string; nome: string; densidade: string; underlay: string; pull: string; velocidade: string; descricao: string }

export const mockMachines: Machine[] = [
  { id: "m1", nome: "Brother PR1055X", marca: "Brother", agulhas: 10, velocidade: "1000 ppm", formato: "PES / DST", ativo: true },
  { id: "m2", nome: "Tajima TFMX-IIC", marca: "Tajima", agulhas: 6, velocidade: "1200 ppm", formato: "DST / TBF", ativo: true },
  { id: "m3", nome: "Janome MB-7", marca: "Janome", agulhas: 7, velocidade: "800 ppm", formato: "JEF", ativo: true },
  { id: "m4", nome: "Melco EMT16X", marca: "Melco", agulhas: 16, velocidade: "1500 ppm", formato: "EXP / DST", ativo: false },
]

export const mockHoops: Hoop[] = [
  { id: "h1", nome: "Pequeno 10x10", tamanho: "100 × 100 mm", mm: "100x100", uso: "Logos peito, bonés", ativo: true },
  { id: "h2", nome: "Médio 130x180", tamanho: "130 × 180 mm", mm: "130x180", uso: "Uniformes, bolsas", ativo: true },
  { id: "h3", nome: "Grande 200x300", tamanho: "200 × 300 mm", mm: "200x300", uso: "Costas, jaquetas", ativo: true },
  { id: "h4", nome: "Mega 360x200", tamanho: "360 × 200 mm", mm: "360x200", uso: "Toalhas, tapetes", ativo: true },
]

export const mockFabrics: Fabric[] = [
  { id: "f1", nome: "Algodão fio 30", peso: "Médio", estabilizacao: "Cut-away 80g", agulha: "80/12", cor: "#fef3c7", ativo: true },
  { id: "f2", nome: "Piqué / Polo", peso: "Médio-pesado", estabilizacao: "Tear-away 60g", agulha: "75/11", cor: "#dbeafe", ativo: true },
  { id: "f3", nome: "Moletom", peso: "Pesado", estabilizacao: "Cut-away 2x", agulha: "90/14", cor: "#e0e7ff", ativo: true },
  { id: "f4", nome: "Cetim", peso: "Leve", estabilizacao: "Hidrossolúvel", agulha: "70/10", cor: "#fce7f3", ativo: true },
  { id: "f5", nome: "Jeans", peso: "Pesado", estabilizacao: "Cut-away 90g", agulha: "100/16", cor: "#d1d5db", ativo: true },
  { id: "f6", nome: "Toalha felpuda", peso: "Esponjoso", estabilizacao: "Topper solúvel", agulha: "90/14", cor: "#fef9c3", ativo: true },
]

export const mockPresets: DigitizingPreset[] = [
  { id: "p1", nome: "Padrão Bordado Plano", densidade: "4.5 linhas/mm", underlay: "Zig-zag + Edge walk", pull: "0.3 mm", velocidade: "700 ppm", descricao: "Equilíbrio ideal para logos em algodão." },
  { id: "p2", nome: "Alta definição / letras pequenas", densidade: "5.0 linhas/mm", underlay: "Edge walk duplo", pull: "0.15 mm", velocidade: "600 ppm", descricao: "Texto 6-8mm, máxima legibilidade." },
  { id: "p3", nome: "3D Puff / Alto relevo", densidade: "3.8 linhas/mm", underlay: "Sem base", pull: "0.6 mm", velocidade: "550 ppm", descricao: "Espuma 3mm, satin fechado." },
]

export type Projeto = {
  id: string
  titulo: string
  arte: string
  cliente: string
  status: "rascunho" | "pronto" | "em_bordado" | "entregue"
  bastidor: string
  tecido: string
  maquina: string
  pontos: number
  cores: string[]
  atualizado: string
  privado: boolean
}

export const mockProjetos: Projeto[] = [
  { id: "1", titulo: "Leão MJ — dourado preto", arte: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=400&fit=crop", cliente: "MJ Atelier", status: "pronto", bastidor: "130x180", tecido: "Piqué", maquina: "Brother PR1055X", pontos: 18420, cores: ["#0a0a0a","#d4af37","#ffffff"], atualizado: "hoje 14:32", privado: true },
  { id: "2", titulo: "Monograma Aurora", arte: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop", cliente: "Aurora Noivas", status: "em_bordado", bastidor: "200x300", tecido: "Cetim", maquina: "Tajima", pontos: 24210, cores: ["#fce7f3","#be185d","#d4af37"], atualizado: "ontem", privado: true },
  { id: "3", titulo: "Escudo Wolves FC", arte: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop", cliente: "Wolves", status: "rascunho", bastidor: "100x100", tecido: "Moletom", maquina: "Janome MB-7", pontos: 9800, cores: ["#0a0a0a","#ef4444","#ffffff"], atualizado: "2 dias atrás", privado: true },
  { id: "4", titulo: "Floral Primavera", arte: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop", cliente: "Bella Boutique", status: "entregue", bastidor: "360x200", tecido: "Toalha", maquina: "Melco", pontos: 31200, cores: ["#ec4899","#22c55e","#fef08a"], atualizado: "1 semana atrás", privado: true },
  { id: "5", titulo: "Logo Tech Minimal", arte: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop", cliente: "TechFlow", status: "pronto", bastidor: "130x180", tecido: "Algodão", maquina: "Brother", pontos: 11200, cores: ["#0a0a0a","#06b6d4"], atualizado: "hoje 09:10", privado: true },
  { id: "6", titulo: "Brasão Família Silva", arte: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop", cliente: "Família Silva", status: "rascunho", bastidor: "200x300", tecido: "Jeans", maquina: "Tajima", pontos: 27500, cores: ["#1e3a8a","#d4af37","#991b1b"], atualizado: "3 dias atrás", privado: true },
]

export const statusMap = {
  rascunho: { label: "Rascunho", color: "bg-amber-500" },
  pronto: { label: "Pronto para bordar", color: "bg-emerald-500" },
  em_bordado: { label: "Em bordado", color: "bg-sky-500" },
  entregue: { label: "Entregue", color: "bg-zinc-500" },
} as const
