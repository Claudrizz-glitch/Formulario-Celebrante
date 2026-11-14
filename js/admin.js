const supabaseClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);


const loginArea = document.getElementById("login-area");

const painelArea = document.getElementById("painel-area");

const loginForm = document.getElementById("login-form");

const loginStatus = document.getElementById("login-status");

const adminStatus = document.getElementById("admin-status");

const lista = document.getElementById("lista-questionarios");

const detalhes = document.getElementById("detalhes-questionario");

const conteudoDetalhes = document.getElementById("conteudo-detalhes");


// ==========================================
// AUTENTICAÇÃO
// ==========================================

async function verificarSessao() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {

        await carregarPainel();

    } else {

        mostrarLogin();

    }

}


function mostrarLogin() {

    loginArea.hidden = false;

    painelArea.hidden = true;

}


async function carregarPainel() {

    loginArea.hidden = true;

    painelArea.hidden = false;

    await carregarQuestionarios();

}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;

    const botao = document.getElementById("botao-login");

    botao.disabled = true;

    loginStatus.textContent = "Verificando acesso...";


    const { error } = await supabaseClient.auth.signInWithPassword({

        email,

        password: senha

    });


    if (error) {

        loginStatus.textContent = "E-mail ou senha incorretos.";

        botao.disabled = false;

        return;

    }


    await carregarPainel();

    botao.disabled = false;

});


// ==========================================
// BUSCAR QUESTIONÁRIOS
// ==========================================

async function carregarQuestionarios() {

    lista.innerHTML = "";

    adminStatus.textContent = "Carregando questionários...";


    const { data: sessionData } =
        await supabaseClient.auth.getSession();


    const token = sessionData.session?.access_token;


    if (!token) {

        await supabaseClient.auth.signOut();

        mostrarLogin();

        return;

    }


    try {

        const resposta = await fetch("/api/submissions", {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });


        const resultado = await resposta.json();


        if (!resposta.ok) {

            if (resposta.status === 401 || resposta.status === 403) {

                await supabaseClient.auth.signOut();

                mostrarLogin();

                loginStatus.textContent = "Acesso não autorizado.";

                return;

            }

            throw new Error(resultado.error);

        }


        const questionarios = resultado.questionarios || [];


        adminStatus.textContent =
            `${questionarios.length} questionário(s) recebido(s).`;


        if (questionarios.length === 0) {

            lista.textContent = "Nenhum questionário recebido ainda.";

            return;

        }


        questionarios.forEach((questionario) => {

            const card = document.createElement("article");

            card.className = "card-questionario";


            const nome = document.createElement("h3");

            nome.textContent = questionario.nome_casal;


            const data = document.createElement("p");

            data.textContent = new Date(
                questionario.criado_em
            ).toLocaleString("pt-BR");


            const botao = document.createElement("button");

            botao.textContent = "Visualizar respostas";

            botao.addEventListener("click", () => {

                visualizarQuestionario(questionario);

            });


            card.append(nome, data, botao);

            lista.appendChild(card);

        });


    } catch (erro) {

        console.error(erro);

        adminStatus.textContent =
            "Erro ao carregar os questionários.";

    }

}


// ==========================================
// VISUALIZAR RESPOSTAS
// ==========================================

function visualizarQuestionario(questionario) {

    lista.hidden = true;

    detalhes.hidden = false;

    conteudoDetalhes.innerHTML = "";


    const titulo = document.createElement("h2");

    titulo.textContent = questionario.nome_casal;

    conteudoDetalhes.appendChild(titulo);


    const data = document.createElement("p");

    data.textContent =
        "Recebido em: " +
        new Date(questionario.criado_em).toLocaleString("pt-BR");

    conteudoDetalhes.appendChild(data);


    const respostas = questionario.respostas || {};


    Object.entries(respostas).forEach(([pergunta, resposta]) => {

        const bloco = document.createElement("div");

        bloco.className = "resposta-admin";


        const tituloPergunta = document.createElement("h4");

        tituloPergunta.textContent =
            pergunta.replaceAll("_", " ");


        const textoResposta = document.createElement("p");

        textoResposta.textContent = resposta || "Não respondido.";


        bloco.append(tituloPergunta, textoResposta);

        conteudoDetalhes.appendChild(bloco);

    });

}


// ==========================================
// VOLTAR
// ==========================================

document.getElementById("voltar-lista").addEventListener("click", () => {

    detalhes.hidden = true;

    lista.hidden = false;

});


// ==========================================
// SAIR
// ==========================================

document.getElementById("botao-sair").addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    mostrarLogin();

});


// ==========================================
// INICIAR
// ==========================================

verificarSessao();