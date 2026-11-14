-- ============================================================
-- Formulario-PriBorges — estrutura do banco (Supabase / Postgres)
-- Execute no Supabase: SQL Editor → New query → cole e rode.
-- Pode ser executado mais de uma vez sem erro.
-- ============================================================

create table if not exists public.questionarios (
    id              uuid        primary key default gen_random_uuid(),
    nome            text        not null check (char_length(nome) between 1 and 150),
    parceiro        text        not null check (char_length(parceiro) between 1 and 150),
    data_casamento  date        not null,
    respostas       jsonb       not null check (jsonb_typeof(respostas) = 'array'),
    criado_em       timestamptz not null default now()
);

comment on table  public.questionarios is 'Questionários individuais dos noivos (um registro por pessoa).';
comment on column public.questionarios.respostas is
    'Lista de seções na ordem original: [{secao, perguntas: [{id, pergunta, resposta}]}].';

create index if not exists questionarios_criado_em_idx on public.questionarios (criado_em desc);

-- ------------------------------------------------------------
-- Segurança: RLS ligado e NENHUMA política criada.
-- Assim, visitantes (anon) e usuários autenticados não conseguem
-- ler, inserir, alterar nem apagar nada pela API pública.
-- Apenas o backend, usando a chave secreta (que ignora o RLS), grava.
-- ------------------------------------------------------------
alter table public.questionarios enable row level security;
alter table public.questionarios force row level security;

revoke all on table public.questionarios from anon, authenticated;
