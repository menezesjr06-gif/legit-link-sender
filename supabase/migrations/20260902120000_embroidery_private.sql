-- Embroidery private tables: projetos isolados por usuário + catálogos admin editáveis

-- Projetos / Matrizes (privados por created_by = auth.uid())
CREATE TABLE IF NOT EXISTS public.projetos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  arte TEXT NOT NULL,
  cliente TEXT NOT NULL DEFAULT 'Você',
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','pronto','em_bordado','entregue')),
  bastidor TEXT NOT NULL,
  tecido TEXT NOT NULL,
  maquina TEXT NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 0,
  cores JSONB NOT NULL DEFAULT '[]'::jsonb,
  categoria TEXT,
  largura_mm INTEGER,
  altura_mm INTEGER,
  observacao TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own projetos" ON public.projetos;
CREATE POLICY "Users can manage own projetos" ON public.projetos FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projetos TO authenticated;
GRANT ALL ON public.projetos TO service_role;

-- Catálogos admin (máquinas, bastidores, tecidos, presets) — leitura livre, escrita só admin
CREATE TABLE IF NOT EXISTS public.maquinas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT NOT NULL,
  agulhas INTEGER NOT NULL,
  velocidade TEXT NOT NULL,
  formato TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read maquinas" ON public.maquinas;
CREATE POLICY "Anyone can read maquinas" ON public.maquinas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage maquinas" ON public.maquinas;
CREATE POLICY "Admins can manage maquinas" ON public.maquinas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.maquinas TO authenticated;
GRANT ALL ON public.maquinas TO service_role;

CREATE TABLE IF NOT EXISTS public.bastidores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tamanho TEXT NOT NULL,
  mm TEXT NOT NULL,
  uso TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bastidores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read bastidores" ON public.bastidores;
CREATE POLICY "Anyone can read bastidores" ON public.bastidores FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage bastidores" ON public.bastidores;
CREATE POLICY "Admins can manage bastidores" ON public.bastidores FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.bastidores TO authenticated;
GRANT ALL ON public.bastidores TO service_role;

CREATE TABLE IF NOT EXISTS public.tecidos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  peso TEXT NOT NULL,
  estabilizacao TEXT NOT NULL,
  agulha TEXT NOT NULL,
  cor TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tecidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tecidos" ON public.tecidos;
CREATE POLICY "Anyone can read tecidos" ON public.tecidos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage tecidos" ON public.tecidos;
CREATE POLICY "Admins can manage tecidos" ON public.tecidos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.tecidos TO authenticated;
GRANT ALL ON public.tecidos TO service_role;

CREATE TABLE IF NOT EXISTS public.digitizing_presets (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  densidade TEXT NOT NULL,
  underlay TEXT NOT NULL,
  pull TEXT NOT NULL,
  velocidade TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.digitizing_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read presets" ON public.digitizing_presets;
CREATE POLICY "Anyone can read presets" ON public.digitizing_presets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage presets" ON public.digitizing_presets;
CREATE POLICY "Admins can manage presets" ON public.digitizing_presets FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT SELECT ON public.digitizing_presets TO authenticated;
GRANT ALL ON public.digitizing_presets TO service_role;

-- trigger updated_at for projetos
DROP TRIGGER IF EXISTS update_projetos_updated_at ON public.projetos;
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- seed catálogos (idempotente)
INSERT INTO public.maquinas (id,nome,marca,agulhas,velocidade,formato,ativo) VALUES
('m1','Brother PR1055X','Brother',10,'1000 ppm','PES / DST',true),
('m2','Tajima TFMX-IIC','Tajima',6,'1200 ppm','DST / TBF',true),
('m3','Janome MB-7','Janome',7,'800 ppm','JEF',true),
('m4','Melco EMT16X','Melco',16,'1500 ppm','EXP / DST',false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bastidores (id,nome,tamanho,mm,uso,ativo) VALUES
('h1','Pequeno 10x10','100 × 100 mm','100x100','Logos peito, bonés',true),
('h2','Médio 130x180','130 × 180 mm','130x180','Uniformes, bolsas',true),
('h3','Grande 200x300','200 × 300 mm','200x300','Costas, jaquetas',true),
('h4','Mega 360x200','360 × 200 mm','360x200','Toalhas, tapetes',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tecidos (id,nome,peso,estabilizacao,agulha,cor,ativo) VALUES
('f1','Algodão fio 30','Médio','Cut-away 80g','80/12','#fef3c7',true),
('f2','Piqué / Polo','Médio-pesado','Tear-away 60g','75/11','#dbeafe',true),
('f3','Moletom','Pesado','Cut-away 2x','90/14','#e0e7ff',true),
('f4','Cetim','Leve','Hidrossolúvel','70/10','#fce7f3',true),
('f5','Jeans','Pesado','Cut-away 90g','100/16','#d1d5db',true),
('f6','Toalha felpuda','Esponjoso','Topper solúvel','90/14','#fef9c3',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.digitizing_presets (id,nome,densidade,underlay,pull,velocidade,descricao) VALUES
('p1','Padrão Bordado Plano','4.5 linhas/mm','Zig-zag + Edge walk','0.3 mm','700 ppm','Equilíbrio ideal para logos em algodão.'),
('p2','Alta definição / letras pequenas','5.0 linhas/mm','Edge walk duplo','0.15 mm','600 ppm','Texto 6-8mm, máxima legibilidade.'),
('p3','3D Puff / Alto relevo','3.8 linhas/mm','Sem base','0.6 mm','550 ppm','Espuma 3mm, satin fechado.')
ON CONFLICT (id) DO NOTHING;
