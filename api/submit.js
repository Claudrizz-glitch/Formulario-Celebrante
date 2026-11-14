import { supabase } from "../lib/supabase.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Método não permitido."
        });

    }


    try {

        const { nome_casal, respostas } = req.body || {};


        // VALIDAR DADOS

        if (
            typeof nome_casal !== "string" ||
            !nome_casal.trim() ||
            nome_casal.length > 150 ||
            !respostas ||
            typeof respostas !== "object" ||
            Array.isArray(respostas)
        ) {

            return res.status(400).json({
                error: "Dados inválidos."
            });

        }


        // VALIDAR TAMANHO DAS RESPOSTAS

        const totalCaracteres = JSON.stringify(respostas).length;

        if (totalCaracteres > 100000) {

            return res.status(400).json({
                error: "O formulário excedeu o tamanho permitido."
            });

        }


        // SALVAR NO SUPABASE

        const { data, error } = await supabase
            .from("questionarios")
            .insert({

                nome_casal: nome_casal.trim(),

                respostas

            })
            .select("id")
            .single();


        if (error) {

            console.error("Erro Supabase:", error);

            return res.status(500).json({
                error: "Não foi possível salvar as respostas."
            });

        }


        // PREPARAR E-MAIL

        const emailAdmin = process.env.ADMIN_EMAIL;

        if (!emailAdmin) {

            console.error("ADMIN_EMAIL não configurado.");

            return res.status(500).json({
                error: "Configuração de e-mail incompleta."
            });

        }


        // ENVIAR NOTIFICAÇÃO

        const { error: emailError } = await resend.emails.send({

            from: process.env.RESEND_FROM,

            to: [emailAdmin],

            subject: `Novo questionário recebido — ${nome_casal.trim()}`,

            text: `
Um novo questionário foi enviado.

Casal: ${nome_casal}

Identificador: ${data.id}

Acesse o painel administrativo para visualizar as respostas.

${process.env.SITE_URL || ""}
            `

        });


        if (emailError) {

            // O formulário já foi salvo.
            // Não informar ao usuário que o envio inteiro falhou.

            console.error("Erro no envio de e-mail:", emailError);

            return res.status(200).json({

                success: true,

                emailSent: false,

                message: "Respostas salvas, mas a notificação por e-mail falhou."

            });

        }


        return res.status(200).json({

            success: true,

            emailSent: true,

            message: "Questionário enviado com sucesso."

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({

            error: "Erro interno do servidor."

        });

    }

}