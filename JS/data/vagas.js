'use strict';

/* =========================================================
   MEGA DISTRITO — DADOS: VAGAS DE EMPREGO
   ========================================================= */

const VAGAS = [
    {
        id: 301, cargo: 'Atendente de Loja',         empresa: 'Mercado Central Magé',
        area: 'comercio', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Centro, Magé',
        desc: 'Atendimento ao cliente, organização de gôndolas e frente de caixa. Experiência desejável.',
        contato: '21999990101', publicada: 'Hoje',
    },
    {
        id: 302, cargo: 'Auxiliar de Pedreiro',      empresa: 'Construtora Bramax',
        area: 'construcao', regime: 'CLT',
        salario: 'R$ 1.700', local: 'Piabetá, Magé',
        desc: 'Suporte em obras residenciais. Necessário ter experiência mínima de 6 meses.',
        contato: '21999990102', publicada: 'Hoje',
    },
    {
        id: 303, cargo: 'Técnico de TI / Suporte',   empresa: 'Prefeitura de Magé',
        area: 'tecnologia', regime: 'Temporário',
        salario: 'R$ 2.200', local: 'Centro, Magé',
        desc: 'Suporte técnico em hardware e software para equipamentos da prefeitura. Necessário diploma técnico.',
        contato: '21999990103', publicada: 'Ontem',
    },
    {
        id: 304, cargo: 'Cozinheira / Cozinheiro',   empresa: 'Restaurante Sabor Real',
        area: 'servicos', regime: 'CLT',
        salario: 'A combinar', local: 'Suruí, Magé',
        desc: 'Preparo de pratos executivos e a la carte. Experiência em cozinha industrial é diferencial.',
        contato: '21999990104', publicada: 'Há 2 dias',
    },
    {
        id: 305, cargo: 'Auxiliar de Enfermagem',    empresa: 'Clínica Saúde Magé',
        area: 'saude', regime: 'CLT',
        salario: 'R$ 1.900', local: 'Centro, Magé',
        desc: 'Assistência a pacientes, coleta de amostras e apoio em procedimentos clínicos.',
        contato: '21999990105', publicada: 'Há 2 dias',
    },
    {
        id: 306, cargo: 'Motorista Entregador',      empresa: 'DistribuiMagé Logística',
        area: 'servicos', regime: 'CLT',
        salario: 'R$ 2.000 + comissão', local: 'Magé',
        desc: 'Entrega de mercadorias em Magé e municípios vizinhos. CNH B obrigatória.',
        contato: '21999990106', publicada: 'Há 3 dias',
    },
    {
        id: 307, cargo: 'Recepcionista',             empresa: 'Academia Fit Magé',
        area: 'servicos', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Barbuda, Magé',
        desc: 'Recepção de alunos, controle de acesso, agendamentos e suporte administrativo.',
        contato: '21999990107', publicada: 'Há 4 dias',
    },
    {
        id: 308, cargo: 'Eletricista Autônomo',      empresa: 'Obras Piabetá',
        area: 'construcao', regime: 'Autônomo',
        salario: 'A combinar', local: 'Piabetá, Magé',
        desc: 'Instalações elétricas em obra de médio porte. Disponibilidade imediata.',
        contato: '21999990108', publicada: 'Há 5 dias',
    },
    {
        id: 309, cargo: 'Designer Gráfico Freelancer', empresa: 'Agência Digital Local',
        area: 'tecnologia', regime: 'Freelancer',
        salario: 'R$ 80–120/peça', local: 'Remoto / Magé',
        desc: 'Criação de posts para redes sociais, flyers e identidade visual. Portfólio obrigatório.',
        contato: '21999990109', publicada: 'Há 6 dias',
    },
    {
        id: 310, cargo: 'Auxiliar de Limpeza',       empresa: 'Escola Estadual Magé',
        area: 'outros', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Centro, Magé',
        desc: 'Serviços de limpeza e conservação em ambiente escolar. Turnos manhã ou tarde.',
        contato: '21999990110', publicada: 'Há 7 dias',
    },
];
