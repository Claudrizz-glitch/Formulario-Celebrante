import { supabase } from "../lib/supabase.js";


export default async function handler(req, res) {

    if (req.method !== "GET") {

        return res.status(405).json({
            error: "Método não permitido."
        });

    }


    try {

        const authorization = req.headers.authorization || "";

        const token = authorization.startsWith("Bearer ")
            ? authorization.slice(7)
            : null;


        if (!token) {

            return res.status(401).json({
                error: "Autenticação necessária."
            });

        }


        // VALIDAR TOKEN NO SUPABASE

        const { data: userData, error: authError } =
            await supabase.auth.getUser(token);


        if (authError || !userData.user) {

            return res.status(401).json({
                error: "Sessão inválida."
            });

        }


        // VERIFICAR SE É O ADMINISTRADOR

        const email = userData.user.email?.toLowerCase();

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();


        if (!email || email !== adminEmail) {

            return res.status(403).json({
                error: "Acesso não autorizado."
            });

        }


        // BUSCAR QUESTIONÁRIOS

        const { data, error } = await supabase

            .from("questionarios")

            .select("*")

            .order("criado_em", {
                ascending: false
            });


        if (error) {

            console.error(error);

            return res.status(500).json({
                error: "Não foi possível consultar os questionários."
            });

        }


        return res.status(200).json({

            success: true,

            questionarios: data

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Erro interno."
        });

    }

}