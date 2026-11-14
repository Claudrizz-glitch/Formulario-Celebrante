import { createClient } from "@supabase/supabase-js";

// Cliente do Supabase usado SOMENTE no backend (funções da Vercel).
// A chave secreta nunca deve chegar ao navegador.

let cliente = null;

export function getSupabase() {
    if (cliente) return cliente;

    const url = process.env.SUPABASE_URL;
    const chave = process.env.SUPABASE_SECRET_KEY;

    if (!url || !chave) {
        throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY precisam estar configuradas.");
    }

    cliente = createClient(url, chave, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    return cliente;
}
