// Lista oficial de seções e perguntas usada pelo backend.
// Define a ordem e os enunciados completos que vão para o e-mail e para o Supabase.
// Deve ficar idêntica à lista QUESTIONARIO do index.html (o teste em README confere).

export const QUESTIONARIO = [
    {
        id: "quem_e_voce",
        titulo: "1. Quem é você?",
        introducao: "Para conhecer a pessoa que existe além do papel de noivo ou noiva.",
        perguntas: [
            ["descricao_pessoal", "Como você se descreveria em poucas palavras?"],
            ["valores", "Quais valores são mais importantes na sua vida?"],
            ["admiracao", "O que sua família e seus amigos mais admiram em você?"],
            ["sonho_pessoal", "Qual é um sonho muito importante para você?"],
            ["curiosidade_pessoal", "O que poucas pessoas sabem sobre você e que gostaria de compartilhar?"]
        ]
    },
    {
        id: "como_tudo_comecou",
        titulo: "2. Como tudo começou?",
        introducao: "Volte ao início e conte a história com os detalhes que fazem você sorrir.",
        perguntas: [
            ["como_se_conheceram", "Como vocês se conheceram? Onde estavam e como aconteceu?"],
            ["primeira_impressao", "Qual foi sua primeira impressão sobre seu amor?"],
            ["iniciativa", "Quem tomou a iniciativa? Como foram os primeiros passos?"],
            ["paixao", "Quando percebeu que estava se apaixonando?"],
            ["certeza_casar", "Houve um momento em que pensou: “É com essa pessoa que quero construir minha vida”? Conte como foi."],
            ["obstaculos_inicio", "Existiu algum obstáculo ou dificuldade no começo da relação?"]
        ]
    },
    {
        id: "historia_construida",
        titulo: "3. A história que vocês construíram",
        introducao: "As memórias, os desafios e os pequenos detalhes também contam a história de um grande amor.",
        perguntas: [
            ["lembranca_especial", "Qual é a lembrança mais especial que vocês viveram juntos?"],
            ["momento_desafiador", "Qual foi um dos momentos mais desafiadores da relação e o que aprenderam com ele?"],
            ["atividades_juntos", "O que vocês mais gostam de fazer juntos?"],
            ["representacoes", "Existe uma viagem, música, lugar, comida ou tradição que represente vocês?"],
            ["mania_amor", "Qual mania do seu amor faz você rir — ou perder a paciência?"],
            ["surpresa_marcante", "Qual foi a surpresa mais marcante que recebeu dessa pessoa?"],
            ["historia_engracada", "Existe alguma história engraçada que os amigos ou a família sempre lembram?"]
        ]
    },
    {
        id: "pedido_decisao",
        titulo: "4. O pedido e a decisão de casar",
        introducao: "O que fez vocês escolherem dar esse passo?",
        perguntas: [
            ["pedido_casamento", "Como foi o pedido de casamento? Conte os detalhes."],
            ["significado_casar", "Casar sempre foi um sonho seu? O que essa decisão representa hoje?"],
            ["escolha_parceiro", "Por que você escolheu essa pessoa para compartilhar a vida?"],
            ["expectativa_cerimonia", "O que sente quando pensa que o dia da cerimônia está chegando?"]
        ]
    },
    {
        id: "o_que_ama",
        titulo: "5. O que você ama nessa pessoa",
        introducao: "Aqui, vale falar do que talvez você nem sempre consiga dizer no dia a dia.",
        perguntas: [
            ["admiracao_amor", "O que você mais admira no seu amor?"],
            ["despertou", "O que essa pessoa despertou em você que ninguém mais havia despertado?"],
            ["demonstracao_amor", "De que maneira ela demonstra amor por você?"],
            ["diferencas", "Em que vocês são diferentes e como essas diferenças se complementam?"],
            ["aprendizado_amor", "O que você aprendeu sobre o amor depois que conheceu essa pessoa?"],
            ["agradecimento", "Se pudesse agradecer por uma única coisa ao seu amor, o que seria?"]
        ]
    },
    {
        id: "promessas_futuro",
        titulo: "6. Promessas e futuro",
        introducao: "Pense na vida que desejam construir, inclusive nos dias comuns.",
        perguntas: [
            ["construir_juntos", "O que você deseja construir ao lado dessa pessoa?"],
            ["futuro_vinte_anos", "Como imagina a vida de vocês daqui a 10 ou 20 anos?"],
            ["sonhos_juntos", "Quais sonhos vocês desejam realizar juntos?"],
            ["companheiro_ideal", "Que tipo de companheiro(a) você deseja ser, inclusive nos momentos difíceis?"],
            ["prometo_caminhar", "Complete: “Prometo caminhar ao seu lado mesmo quando…”"],
            ["mensagem_casamento", "Complete: “Se eu pudesse te dizer uma coisa no dia do nosso casamento, seria…”"]
        ]
    },
    {
        id: "cerimonia_sonhos",
        titulo: "7. A cerimônia dos sonhos",
        introducao: "Sua história merece ser celebrada de um jeito que combine com vocês.",
        perguntas: [
            ["estilo_cerimonia", "Como você imagina a cerimônia: emocionante, descontraída, romântica, espiritual ou uma mistura de estilos?"],
            ["crencas_tradicoes", "Existe alguma crença, tradição ou valor que gostaria de incluir?"],
            ["homenagens", "Há pessoas especiais que precisam ser mencionadas ou homenageadas? Por quê?"],
            ["musica_simbolo", "Existe alguma música, frase, poema ou símbolo que represente a relação?"],
            ["assuntos_evitar", "Há algum assunto ou lembrança que você prefere que não seja mencionado durante a cerimônia?"],
            ["sentimento_convidados", "Que sentimento você gostaria que os convidados levassem para casa?"]
        ]
    },
    {
        id: "perguntas_especiais",
        titulo: "8. Perguntas especiais",
        introducao: "Não pense demais: responda com o coração.",
        perguntas: [
            ["filme_historia", "Se a história de vocês fosse um filme, qual seria o título?"],
            ["detalhe_amor", "Qual detalhe do seu amor faz você pensar: “Ainda bem que encontrei essa pessoa”?"],
            ["reviver_dia", "Se pudesse reviver um único dia da história de vocês, qual seria e por quê?"],
            ["algo_dizer_amor", "O que você gostaria que seu amor soubesse, mesmo que nem sempre consiga expressar?"],
            ["historia_nao_contada", "Existe alguma parte importante da história de vocês que eu ainda não perguntei e que você gostaria de contar?"]
        ]
    },
    {
        id: "para_finalizar",
        titulo: "Para finalizar…",
        introducao: "Este espaço é seu.",
        perguntas: [
            ["informacoes_confidenciais", "Há alguma informação confidencial, contexto ou cuidado que devo considerar ao preparar a cerimônia?"],
            ["perguntas_celebrante", "Tem algo que você gostaria de me perguntar ou compartilhar comigo?"]
        ]
    }
];

// Pergunta cuja resposta é exclusiva da celebrante e recebe destaque no e-mail.
export const PERGUNTA_CONFIDENCIAL = "informacoes_confidenciais";
