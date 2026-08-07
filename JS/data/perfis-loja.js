'use strict';

/* =========================================================
   MEGA DISTRITO — DADOS: PERFIS DE LOJA

   O perfil não cria um formulário separado por ramo de negócio.
   Ele liga/desliga grupos de campos no formulário único de item
   (JS/gerenciamento.js), troca os rótulos/títulos da aba Catálogo
   pela linguagem do ramo do lojista e sugere categorias relevantes
   — evitando pedir informação (ou usar termos) que não fazem
   sentido para aquele tipo de negócio. O lojista sempre pode
   revelar campos escondidos manualmente — nada fica bloqueado.

   Para adicionar um perfil novo no futuro: só acrescentar um
   objeto aqui, sem mexer no HTML/JS do formulário.
   ========================================================= */

const PERFIS_LOJA = [
    {
        id: 'produtos',
        nome: 'Produtos físicos',
        descricao: 'Mercado, loja de roupas, eletrônicos, casa e decoração...',
        icone: 'fas fa-box',
        tipoItemPadrao: 'produto',
        campos: {
            variacoes: true,
            detalhesTecnicos: true,
            duracao: false,
            quantidade: true,
            quantidadeLabel: 'Estoque total (sem variações)',
        },
        textos: {
            tabCatalogo: 'Catálogo',
            catalogoTitulo: 'Novo item',
            catalogoSubtitulo: 'Preencha as etapas abaixo — todas as informações do produto exibidas na sua página podem ser editadas aqui.',
            listaTitulo: 'Itens cadastrados',
            botaoAdicionar: 'Adicionar item',
            botaoSalvar: 'Salvar item',
        },
        categoriasSugeridas: ['Mercado / Mercearia', 'Alimentação', 'Eletrônicos', 'Moda e Vestuário', 'Casa e Decoração'],
    },
    {
        id: 'servicos_agenda',
        nome: 'Serviços com horário marcado',
        descricao: 'Barbearia, salão de beleza, oficina, prestadores em geral...',
        icone: 'fas fa-calendar-check',
        tipoItemPadrao: 'servico',
        campos: {
            variacoes: false,
            detalhesTecnicos: false,
            duracao: true,
            quantidade: false,
            quantidadeLabel: '',
        },
        textos: {
            tabCatalogo: 'Serviços',
            catalogoTitulo: 'Novo serviço',
            catalogoSubtitulo: 'Descreva o atendimento que você oferece — o cliente vê exatamente isso na sua página.',
            listaTitulo: 'Serviços cadastrados',
            botaoAdicionar: 'Adicionar serviço',
            botaoSalvar: 'Salvar serviço',
        },
        categoriasSugeridas: ['Serviços Gerais', 'Beleza e Saúde', 'Construção e Reforma'],
    },
    {
        id: 'educacao',
        nome: 'Educação e cursos',
        descricao: 'Escolas, professores particulares, cursos livres...',
        icone: 'fas fa-graduation-cap',
        tipoItemPadrao: 'servico',
        campos: {
            variacoes: false,
            detalhesTecnicos: false,
            duracao: false,
            quantidade: true,
            quantidadeLabel: 'Vagas disponíveis',
        },
        textos: {
            tabCatalogo: 'Cursos e vagas',
            catalogoTitulo: 'Novo curso ou turma',
            catalogoSubtitulo: 'Cadastre o curso, turma ou aula — o cliente vê as vagas disponíveis na sua página.',
            listaTitulo: 'Cursos e turmas cadastrados',
            botaoAdicionar: 'Adicionar curso/turma',
            botaoSalvar: 'Salvar curso/turma',
        },
        categoriasSugeridas: ['Serviços Gerais', 'Outro'],
    },
    {
        id: 'generico',
        nome: 'Outro / genérico',
        descricao: 'Qualquer outro tipo de negócio — mostra só o essencial.',
        icone: 'fas fa-shapes',
        tipoItemPadrao: 'produto',
        campos: {
            variacoes: false,
            detalhesTecnicos: false,
            duracao: false,
            quantidade: true,
            quantidadeLabel: 'Quantidade em estoque (opcional)',
        },
        textos: {
            tabCatalogo: 'Catálogo',
            catalogoTitulo: 'Novo item',
            catalogoSubtitulo: 'Preencha as etapas abaixo — todas as informações exibidas na sua página podem ser editadas aqui.',
            listaTitulo: 'Itens cadastrados',
            botaoAdicionar: 'Adicionar item',
            botaoSalvar: 'Salvar item',
        },
        categoriasSugeridas: [],
    },
];

const PERFIL_LOJA_PADRAO = 'produtos';

function obterPerfilLoja(id) {
    return PERFIS_LOJA.find(p => p.id === id) || PERFIS_LOJA.find(p => p.id === PERFIL_LOJA_PADRAO);
}
