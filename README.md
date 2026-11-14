# Formulario-PriBorges — Questionário dos Noivos

Formulário digital da celebrante **Priscila Borges**. Cada noivo(a) responde **individualmente** ao questionário. Ao enviar:

1. as respostas são salvas no **Supabase** (tabela `questionarios`);
2. o questionário completo é enviado por e-mail, pelo **Resend**, para **celebrante.priborges@gmail.com**.

Não há login, cadastro nem painel administrativo. O formulário é público.

## Estrutura

```
├── index.html            # Todo o frontend: HTML, CSS, JS, perguntas, validações e mensagens
├── api/submit.js         # Função serverless (Vercel): valida, salva no Supabase e envia o e-mail
├── lib/supabase.js       # Cliente do Supabase (somente backend, chave secreta)
├── lib/questionario.js   # Lista oficial de seções/perguntas usada pelo backend no e-mail e no banco
├── supabase/database.sql # Criação da tabela + RLS
├── package.json
└── vercel.json
```

> **Importante:** as perguntas existem em dois lugares: `index.html` (o que o visitante vê) e `lib/questionario.js` (o que vai para o e-mail e para o banco). Se alterar uma pergunta, altere **as duas** listas da mesma forma.

## Como funciona

- **Campos obrigatórios:** nome completo, nome do(a) parceiro(a) e data do casamento. As demais respostas são opcionais e podem ser longas (até 20.000 caracteres cada, cerca de 3.000 palavras).
- **Rascunho automático:** o que a pessoa digita fica salvo no próprio navegador. Se a página for fechada sem querer, as respostas voltam ao reabrir. O rascunho só é apagado depois que o envio é confirmado.
- **Envio:** o botão é desativado e mostra um indicador enquanto processa. Em caso de erro, as respostas continuam na página.
- **Sem duplicidade:** cada questionário tem um identificador único gerado no navegador. Cliques repetidos ou um reenvio após falha de rede não criam um segundo registro nem um segundo e-mail.
- **Falha só no e-mail:** se o Supabase salvou mas o Resend recusou, a pessoa vê a confirmação com um aviso de que *o registro foi salvo, mas a notificação por e-mail precisa ser verificada*. Nesse caso, a resposta pode ser consultada no Supabase (Table Editor → `questionarios`).
- **Anti-spam:** campo-armadilha invisível (honeypot) e tempo mínimo de preenchimento.
- **E-mail:** HTML legível com identificação (quem respondeu, parceiro(a), data do casamento), todas as seções e perguntas na ordem original com o enunciado completo, e "Não respondido" nas perguntas em branco. A resposta sobre **informações confidenciais** aparece em destaque no topo, marcada como exclusiva da celebrante. Todo texto digitado é escapado antes de entrar no HTML.

### Formato salvo no Supabase

| coluna | tipo | |
|---|---|---|
| `id` | uuid (PK) | gerado no navegador, ou automaticamente |
| `nome` | text | quem respondeu |
| `parceiro` | text | nome do(a) parceiro(a) |
| `data_casamento` | date | |
| `respostas` | jsonb | `[{ "secao": "1. Quem é você?", "perguntas": [{ "id": "descricao_pessoal", "pergunta": "Como você se descreveria…", "resposta": "…" }] }, …]` |
| `criado_em` | timestamptz | automático |

## Configuração

### 1. Supabase

1. Abra o projeto em <https://supabase.com/dashboard>.
2. Vá em **SQL Editor → New query**, cole o conteúdo de [`supabase/database.sql`](supabase/database.sql) e clique em **Run**.
   - O script cria a tabela e liga o **RLS sem nenhuma política**, ou seja, ninguém consegue ler nem gravar pela API pública. Só o backend, com a chave secreta, grava.
3. Em **Project Settings → API Keys**, copie:
   - **Project URL** → `SUPABASE_URL` (ex.: `https://xxxxxxxx.supabase.co`)
   - uma **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY`. Em projetos antigos, a chave equivalente é a `service_role`.

> Nunca use a chave secreta no navegador nem a coloque no código. O `index.html` não usa o Supabase diretamente.

### 2. Resend

1. Crie a conta em <https://resend.com>.
2. **Remetente:** o Resend **não** permite enviar como `@gmail.com`. Escolha uma opção:
   - **Recomendado:** em **Domains**, adicione um domínio próprio (ex.: `priborges.com.br`), configure os registros DNS indicados e aguarde a verificação. Depois use, por exemplo, `RESEND_FROM="Questionário dos Noivos <questionario@priborges.com.br>"`.
   - **Apenas para testes:** `RESEND_FROM="Questionário <onboarding@resend.dev>"`. Esse remetente de teste só entrega para o **e-mail dono da conta do Resend**. Então só funciona se a conta for criada com `celebrante.priborges@gmail.com`.
3. Em **API Keys**, crie uma chave com permissão *Sending access* → `RESEND_API_KEY`.

O destinatário (`celebrante.priborges@gmail.com`) está fixo em `api/submit.js` e não pode ser alterado pelo navegador.

### 3. Variáveis de ambiente na Vercel

Em **Vercel → Project → Settings → Environment Variables**, cadastre (Production e Preview):

| Variável | Onde obter |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API Keys → Project URL |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret key |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM` | Endereço de um domínio verificado no Resend, ex.: `Questionário dos Noivos <questionario@seudominio.com.br>` |

Depois de alterar variáveis, faça um **Redeploy** para que passem a valer.

Para rodar localmente, crie um arquivo `.env.local` (já está no `.gitignore`, nunca faça commit dele) com as mesmas quatro variáveis.

## Deploy

1. Importe o repositório `Formulario-Celebrante` na Vercel (**Add New → Project**). Não é preciso configurar build: *Framework Preset: Other*, sem comando de build.
2. Cadastre as variáveis de ambiente.
3. Cada push na branch `main` gera um novo deploy automaticamente.

O formulário fica na raiz do domínio (`/`) e a API em `/api/submit`.

## Desenvolvimento local

```bash
npm install
npx vercel dev
```

Abra <http://localhost:3000>. O `vercel dev` exige login na Vercel e lê as variáveis do `.env.local`.

## Checklist após o primeiro deploy

1. Envie um questionário de teste pelo site publicado.
2. Confira a linha nova em Supabase → Table Editor → `questionarios`.
3. Confira o e-mail em `celebrante.priborges@gmail.com` (olhe também o spam) e o status em Resend → **Emails**.
4. Se o site mostrar o aviso "notificação por e-mail precisa ser verificada", veja os logs em Vercel → Project → **Logs**. Quase sempre o motivo é `RESEND_FROM` com domínio não verificado.
5. Apague as linhas de teste no Supabase.
