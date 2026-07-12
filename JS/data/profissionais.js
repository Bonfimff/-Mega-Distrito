'use strict';

/* =========================================================
   MAGÉ EXPRESS — DADOS: PROFISSIONAIS DE SERVIÇOS
   ========================================================= */

// Cores da faixa superior por especialidade
const SERVICO_CORES = {
    construcao : '#795548',
    eletrica   : '#f9a825',
    hidraulica : '#0288d1',
    limpeza    : '#00897b',
    tecnologia : '#5c35a8',
    beleza     : '#e91e63',
    outros     : '#607d8b',
};

/* Fotos de exemplo por especialidade (3 por área) */
const FOTOS_ESPECIALIDADE = {
    construcao: [
        { src: 'https://picsum.photos/seed/const-obra/400/220',   alt: 'Obra de alvenaria' },
        { src: 'https://picsum.photos/seed/const-piso/400/220',   alt: 'Assentamento de pisos e revestimentos' },
        { src: 'https://picsum.photos/seed/const-reform/400/220', alt: 'Reforma residencial concluída' },
    ],
    eletrica: [
        { src: 'https://picsum.photos/seed/elec-painel/400/220',  alt: 'Quadro de distribuição elétrica' },
        { src: 'https://picsum.photos/seed/elec-fio/400/220',     alt: 'Instalação de cabeamentos' },
        { src: 'https://picsum.photos/seed/elec-tomada/400/220',  alt: 'Instalação de tomadas e interruptores' },
    ],
    hidraulica: [
        { src: 'https://picsum.photos/seed/hid-cano/400/220',     alt: 'Encanamento de canos' },
        { src: 'https://picsum.photos/seed/hid-banheiro/400/220', alt: 'Instalação de banheiro' },
        { src: 'https://picsum.photos/seed/hid-caixa/400/220',    alt: 'Caixa d\'água instalada' },
    ],
    limpeza: [
        { src: 'https://picsum.photos/seed/clean-sala/400/220',   alt: 'Limpeza de sala' },
        { src: 'https://picsum.photos/seed/clean-kit/400/220',    alt: 'Cozinha higienizada' },
        { src: 'https://picsum.photos/seed/clean-obra/400/220',   alt: 'Limpeza pós-obra' },
    ],
    tecnologia: [
        { src: 'https://picsum.photos/seed/tech-pc/400/220',      alt: 'Manutenção de computador' },
        { src: 'https://picsum.photos/seed/tech-rede/400/220',    alt: 'Instalação de rede Wi-Fi' },
        { src: 'https://picsum.photos/seed/tech-cftv/400/220',    alt: 'Câmeras CFTV instaladas' },
    ],
    beleza: [
        { src: 'https://picsum.photos/seed/beauty-mani/400/220',  alt: 'Manicure e pedicure' },
        { src: 'https://picsum.photos/seed/beauty-cab/400/220',   alt: 'Corte e coloração' },
        { src: 'https://picsum.photos/seed/beauty-unh/400/220',   alt: 'Alongamento de unhas' },
    ],
    outros: [
        { src: 'https://picsum.photos/seed/outros-jard/400/220',  alt: 'Jardim cuidado' },
        { src: 'https://picsum.photos/seed/outros-serv/400/220',  alt: 'Serviço em andamento' },
        { src: 'https://picsum.photos/seed/outros-res/400/220',   alt: 'Resultado final' },
    ],
};

const PROFISSIONAIS = [
    {
        id: 201, nome: 'João Carlos Silva',      especialidade: 'construcao',
        ocupacao: 'Pedreiro & Azulejista',
        avaliacao: 4.8, avaliacoes: 74, verificado: true, disponivel: true,
        desc: 'Especialista em alvenaria, assentamento de pisos, revestimentos e pequenas reformas residenciais.',
        tags: ['Pedreiro', 'Azulejista', 'Reforma', 'Pinturas'],
        horario: 'Seg—Sáb: 07h—17h',
        preco: 200, unidade: 'diária',
        telefone: '21999990001',
    },
    {
        id: 202, nome: 'Marcos Andrade',          especialidade: 'eletrica',
        ocupacao: 'Eletricista Residencial',
        avaliacao: 5.0, avaliacoes: 112, verificado: true, disponivel: true,
        desc: 'Instalações elétricas residenciais e comerciais, quadros de distribuição, SPDA e tomadas.',
        tags: ['Elétrica', 'Instalações', 'SPDA', 'Iluminação'],
        horario: 'Seg—Sex: 08h—18h | Sáb: 08h—12h',
        preco: 120, unidade: 'hora',
        telefone: '21999990002',
    },
    {
        id: 203, nome: 'Roberto Fonseca',          especialidade: 'hidraulica',
        ocupacao: 'Encanador & Hidráulico',
        avaliacao: 4.7, avaliacoes: 89, verificado: true, disponivel: false,
        desc: 'Conserto de vazamentos, instalação de boxes, torneiras, chuveiros e caixas d\'água.',
        tags: ['Encanamento', 'Infiltração', 'Caixa D\'água', 'Box'],
        horario: 'Seg—Sex: 07h—17h',
        preco: 150, unidade: 'hora',
        telefone: '21999990003',
    },
    {
        id: 204, nome: 'Sandra Oliveira',          especialidade: 'limpeza',
        ocupacao: 'Diarista & Faxineira',
        avaliacao: 4.9, avaliacoes: 203, verificado: true, disponivel: true,
        desc: 'Limpeza residencial completa, pós-obra, escritórios e eventos. Produto de qualidade incluso.',
        tags: ['Limpeza', 'Faxina', 'Pós-obra', 'Escritório'],
        horario: 'Seg—Sáb: 08h—17h',
        preco: 180, unidade: 'diária',
        telefone: '21999990004',
    },
    {
        id: 205, nome: 'Felipe Rocha',             especialidade: 'tecnologia',
        ocupacao: 'Técnico de Informática',
        avaliacao: 4.6, avaliacoes: 58, verificado: false, disponivel: true,
        desc: 'Formatação, montagem de PCs, redes Wi-Fi, CFTV, instalação de programas e suporte remoto.',
        tags: ['Informática', 'Redes', 'CFTV', 'Formatação'],
        horario: 'Seg—Sex: 09h—19h | Sáb: 09h—14h',
        preco: 80, unidade: 'hora',
        telefone: '21999990005',
    },
    {
        id: 206, nome: 'Camila Ferreira',          especialidade: 'beleza',
        ocupacao: 'Manicure & Cabeleireira',
        avaliacao: 4.9, avaliacoes: 347, verificado: true, disponivel: true,
        desc: 'Atendimento em domicílio. Manicure, pedicure, escova, coloração e alongamento de unhas.',
        tags: ['Manicure', 'Pedicure', 'Cabelo', 'Alongamento'],
        horario: 'Seg—Sáb: 09h—20h',
        preco: 60, unidade: 'serviço',
        telefone: '21999990006',
    },
    {
        id: 207, nome: 'Antônio Pereira',          especialidade: 'construcao',
        ocupacao: 'Pintor Predial & Residencial',
        avaliacao: 4.5, avaliacoes: 61, verificado: false, disponivel: true,
        desc: 'Pintura interna, externa, textura, grafiato e epóxi para pisos. Acabamento impecável.',
        tags: ['Pintura', 'Textura', 'Grafiato', 'Epóxi'],
        horario: 'Seg—Sáb: 07h—17h',
        preco: 180, unidade: 'diária',
        telefone: '21999990007',
    },
    {
        id: 208, nome: 'Tiago Souza',              especialidade: 'construcao',
        ocupacao: 'Marceneiro & Instalador',
        avaliacao: 4.7, avaliacoes: 44, verificado: true, disponivel: false,
        desc: 'Montagem de móveis planejados, portas, janelas, decks e pequenos consertos em madeira.',
        tags: ['Marcenaria', 'Móveis', 'Deck', 'Portas'],
        horario: 'Seg—Sex: 08h—17h',
        preco: 120, unidade: 'hora',
        telefone: '21999990008',
    },
    {
        id: 209, nome: 'Patrícia Gomes',           especialidade: 'outros',
        ocupacao: 'Cuidadora de Idosos',
        avaliacao: 5.0, avaliacoes: 29, verificado: true, disponivel: true,
        desc: 'Cuidados diurnos e noturnos, acompanhamento médico, higiene pessoal e companhia.',
        tags: ['Cuidadora', 'Idosos', 'Enfermagem', 'Diário/Noturno'],
        bairro: 'Raiz da Serra, Magé', atende: 'Magé e Guapimirim',
        horario: 'Disponível 24h (combinar)',
        preco: 220, unidade: 'diária',
        telefone: '21999990009',
    },
    {
        id: 210, nome: 'Wesley Nascimento',        especialidade: 'outros',
        ocupacao: 'Jardineiro & Paisagista',
        avaliacao: 4.4, avaliacoes: 37, verificado: false, disponivel: true,
        desc: 'Corte de grama, poda de árvores, plantio, paisagismo e manutenção de jardins.',
        tags: ['Jardinagem', 'Paisagismo', 'Poda', 'Manutenção'],
        horario: 'Seg—Sáb: 07h—16h',
        preco: 150, unidade: 'diária',
        telefone: '21999990010',
    },
];
