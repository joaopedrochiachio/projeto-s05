import type {
  Aluno,
  Armario,
  Aula,
  CurriculoDados,
  CurriculoExperiencia,
  CurriculoPDF,
  CursoInatel,
  Evento,
  VagaEstagio,
} from "@/types";

export const CURSOS_INATEL: CursoInatel[] = [
  { sigla: "GES", nome: "Engenharia de Software" },
  { sigla: "GEP", nome: "Engenharia de Produção" },
  { sigla: "GEL", nome: "Engenharia Elétrica" },
  { sigla: "GEC", nome: "Engenharia de Computação" },
  { sigla: "GET", nome: "Engenharia de Telecomunicações" },
  { sigla: "GEA", nome: "Engenharia de Controle e Automação" },
  { sigla: "GEB", nome: "Engenharia Biomédica" },
];

function removerAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getPrimeiroNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes[0] ?? "Aluno";
}

export function getPrimeiroESegundoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return partes[0] ?? "Aluno";
  return `${partes[0]} ${partes[1]}`;
}

export function getIniciaisNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "AL";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function gerarEmailInstitucional(
  nome: string,
  matricula: string,
  siglaCurso: string
): string {
  const primeiro = removerAcentos(getPrimeiroNome(nome))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const matLimpa = matricula.trim() || "000";
  const siglaLimpa = siglaCurso.trim().toLowerCase() || "ges";
  return `${primeiro || "aluno"}.${matLimpa}@${siglaLimpa}.inatel.br`;
}

export function gerarNomeCurriculoPadrao(
  nome: string,
  matricula: string,
  siglaCurso: string
): string {
  const primeiro = removerAcentos(getPrimeiroNome(nome)).replace(
    /[^a-zA-Z0-9]/g,
    ""
  );
  const sigla = siglaCurso.trim().toUpperCase() || "GES";
  const mat = matricula.trim() || "853";
  return `Curriculo_${primeiro || "Aluno"}_${sigla}${mat}_Inatel.pdf`;
}

export function criarPerfilAluno(params: {
  id?: string;
  nome: string;
  siglaCurso: string;
  curso: string;
  matricula: string;
  periodo: number;
  cra?: number;
  acessibilidade?: boolean;
  email?: string;
  telefone?: string;
  cidade?: string;
}): Aluno {
  const matNum = Number.parseInt(params.matricula.replace(/\D/g, ""), 10);
  return {
    id:
      params.id ??
      `perfil-${params.siglaCurso.toLowerCase()}-${params.matricula}-${Date.now()}`,
    alunoId: Number.isNaN(matNum) ? Date.now() : matNum,
    nome: params.nome.trim(),
    matricula: params.matricula.trim(),
    curso: params.curso,
    siglaCurso: params.siglaCurso.toUpperCase(),
    periodo: params.periodo,
    acessibilidade: params.acessibilidade ?? true,
    email:
      params.email?.trim() ||
      gerarEmailInstitucional(
        params.nome,
        params.matricula,
        params.siglaCurso
      ),
    cra: params.cra ?? 8.4,
    avatarIniciais: getIniciaisNome(params.nome),
    telefone: params.telefone?.trim() || "(35) 99853-2026",
    cidade:
      params.cidade?.trim() || "Pouso Alegre / Santa Rita do Sapucaí - MG",
  };
}

export function normalizarAluno(raw: Partial<Aluno> & { nome: string }): Aluno {
  const sigla = (raw.siglaCurso || "GES").toUpperCase();
  const curso =
    raw.curso ||
    CURSOS_INATEL.find((c) => c.sigla === sigla)?.nome ||
    "Engenharia de Software";
  const matricula = raw.matricula || "853";
  return {
    id: raw.id || `perfil-${sigla.toLowerCase()}-${matricula}`,
    alunoId: raw.alunoId ?? (Number.parseInt(matricula, 10) || 853),
    nome: raw.nome,
    matricula,
    curso,
    siglaCurso: sigla,
    periodo: raw.periodo ?? 6,
    acessibilidade: raw.acessibilidade ?? true,
    email:
      raw.email || gerarEmailInstitucional(raw.nome, matricula, sigla),
    cra: typeof raw.cra === "number" ? raw.cra : 8.4,
    avatarIniciais: getIniciaisNome(raw.nome),
    telefone: raw.telefone || "(35) 99853-2026",
    cidade: raw.cidade || "Pouso Alegre / Santa Rita do Sapucaí - MG",
  };
}

export const PERFIS_PADRAO: Aluno[] = [
  criarPerfilAluno({
    id: "perfil-joao-853",
    nome: "João Pedro Chiachio de Paiva",
    curso: "Engenharia de Software",
    siglaCurso: "GES",
    matricula: "853",
    periodo: 6,
    cra: 8.4,
    acessibilidade: true,
    telefone: "(35) 99853-2026",
    cidade: "Pouso Alegre / Santa Rita do Sapucaí - MG",
  }),
  criarPerfilAluno({
    id: "perfil-lucas-853",
    nome: "Lucas Estagiário",
    curso: "Engenharia de Software",
    siglaCurso: "GES",
    matricula: "853",
    periodo: 6,
    cra: 8.4,
    acessibilidade: true,
    telefone: "(35) 99811-4420",
    cidade: "Santa Rita do Sapucaí - MG",
  }),
];

export const ALUNO_LOGADO: Aluno = PERFIS_PADRAO[0];

export const COMPETENCIAS_POR_CURSO: Record<string, string[]> = {
  GES: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Git",
    "Clean Code",
    "UI/UX",
  ],
  GEC: [
    "C / C++ Embarcado",
    "ESP32 & STM32",
    "MQTT / IoT",
    "Arquitetura de Computadores",
    "Linux & Redes",
    "Python",
  ],
  GET: [
    "Redes TCP/IP",
    "Fibra Óptica (GPON/DWDM)",
    "Grafana & Prometheus",
    "Telecomunicações 5G",
    "Linux",
    "Análise de Sinais",
  ],
  GEP: [
    "Gestão de Processos",
    "Lean Six Sigma",
    "Power BI & SQL",
    "Gestão Ágil (Scrum)",
    "Pesquisa Operacional",
  ],
  GEL: [
    "Circuitos Elétricos",
    "Eletrônica de Potência",
    "Sistemas de Controle",
    "MATLAB / Simulink",
    "Automação Elétrica",
  ],
  GEA: [
    "CLP & Supervisórios",
    "Controle Digital",
    "Robótica Industrial",
    "C / Python",
    "Sensores & Atuadores",
  ],
  GEB: [
    "Instrumentação Biomédica",
    "Processamento de Sinais",
    "Python & MATLAB",
    "Sistemas Embarcados",
    "Normas ANVISA / IEC",
  ],
};

export function formatarDataHoraAtual(): string {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const hora = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} às ${hora}`;
}

function getSlugPerfil(nome: string): string {
  return (
    removerAcentos(getPrimeiroESegundoNome(nome))
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "aluno-inatel"
  );
}

const EXPERIENCIAS_POR_CURSO: Record<string, CurriculoExperiencia[]> = {
  GES: [
    {
      id: "exp-ges-1",
      titulo: "Desenvolvedor Front-End • Projetos Web & IA",
      instituicao: "Inatel / Projetos Acadêmicos",
      periodo: "2025 - Atual",
      descricao:
        "Desenvolvimento de interfaces responsivas com React, Next.js, TypeScript e Tailwind CSS aplicando princípios de IHC, acessibilidade e integração com APIs de Inteligência Artificial.",
    },
    {
      id: "exp-ges-2",
      titulo: "Projeto FETIN • Aplicações Web Modernas",
      instituicao: "Feira Tecnológica do Inatel (FETIN)",
      periodo: "2024 - 2025",
      descricao:
        "Prototipação de fluxos centrados no usuário, validação com protótipos navegáveis e construção de sistemas web com arquitetura modular e persistência de estado.",
    },
  ],
};

export function criarCurriculoDadosPadrao(aluno: Aluno): CurriculoDados {
  const sigla = aluno.siglaCurso.toUpperCase();
  const skills = [
    ...(COMPETENCIAS_POR_CURSO[sigla] ?? COMPETENCIAS_POR_CURSO.GES),
  ];
  const slug = getSlugPerfil(aluno.nome);

  const resumoProfissional =
    sigla === "GES"
      ? "Estudante de Engenharia de Software no Inatel com foco em desenvolvimento Front-End (React, Next.js, TypeScript e Tailwind CSS) e integração de soluções com Inteligência Artificial."
      : `Estudante do ${aluno.periodo}º período de ${aluno.curso} no Inatel, com interesse em estágio na área de ${aluno.curso} aplicando boas práticas de engenharia, resolução de problemas e inovação tecnológica.`;

  const experiencias: CurriculoExperiencia[] = EXPERIENCIAS_POR_CURSO[sigla]
    ? EXPERIENCIAS_POR_CURSO[sigla].map((e) => ({ ...e }))
    : [
        {
          id: `exp-${sigla.toLowerCase()}-1`,
          titulo: `Projetos Acadêmicos em ${aluno.curso}`,
          instituicao: "Inatel — Instituto Nacional de Telecomunicações",
          periodo: "2025 - Atual",
          descricao: `Desenvolvimento de soluções práticas nos laboratórios do Inatel envolvendo ${skills.slice(0, 3).join(", ")}.`,
        },
        {
          id: `exp-${sigla.toLowerCase()}-2`,
          titulo: "Projeto FETIN • Inovação Tecnológica",
          instituicao: "Feira Tecnológica do Inatel (FETIN)",
          periodo: "2024 - 2025",
          descricao:
            "Participação em equipe multidisciplinar com documentação técnica, testes em bancada e apresentação para avaliadores da indústria.",
        },
      ];

  return {
    resumoProfissional,
    skills,
    experiencias,
    idiomasCertificacoes: ["Inglês Técnico", "Google Cloud & IA"],
    links: {
      github: `https://github.com/${slug}`,
      linkedin: `https://linkedin.com/in/${slug}`,
      portfolio: `https://${slug}.dev`,
    },
    ultimaEdicao: "10/11/2026",
  };
}

export const AULAS_INICIAIS: Aula[] = [
  {
    id: 1,
    codigo: "S05",
    disciplina: "S05 - Interface Homem-máquina",
    professor: "Prof. Me. Raphael Cardoso",
    data: "ter",
    horario: "10:00",
    local: "P1-S17",
    prova_alert: false,
    prova: "12/05",
    frequencia: "10/25",
    faltasAtuais: 4,
    limiteFaltas: 25,
    nota: "10",
  },
  {
    id: 2,
    codigo: "E01",
    disciplina: "E01 - Circuitos Elétricos em Corrente Contínua",
    professor: "Prof. Dr. Marcos Vinicius",
    data: "ter",
    horario: "10:00",
    local: "P1-S17",
    prova_alert: true,
    prova: "12/05",
    frequencia: "10/25",
    faltasAtuais: 10,
    limiteFaltas: 25,
    nota: "5",
  },
  {
    id: 3,
    codigo: "M02",
    disciplina: "M02 - Álgebra e Geometria Analítica",
    professor: "Profa. Dra. Helena Ribeiro",
    data: "ter",
    horario: "10:00",
    local: "P1-S17",
    prova_alert: true,
    prova: "12/05",
    frequencia: "10/25",
    faltasAtuais: 8,
    limiteFaltas: 25,
    nota: "7",
  },
];

export const EVENTOS_INATEL: Evento[] = [
  {
    id: 1,
    title: "Semana do Software 2026",
    date: "12/05",
    time: "10:00",
    location: "Salão de Eventos",
    type: "tech",
    description:
      "Uma semana inteira dedicada à tecnologia e inovação, com palestras, workshops e hackathons.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000&h=500",
  },
  {
    id: 2,
    title: "Workshop de IoT",
    date: "12/01",
    time: "08:00",
    location: "Laboratório CS&I",
    type: "tech",
    description:
      "Workshop prático sobre Internet das Coisas e suas aplicações na indústria 4.0.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000&h=500",
  },
  {
    id: 3,
    title: "Festa dos Alunos 2026",
    date: "18/05",
    time: "19:00",
    location: "Área Esportiva",
    type: "cultural",
    description:
      "Venha comemorar a melhor Festa dos Alunos de todos os tempos com música e integração!",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000&h=500",
  },
  {
    id: 4,
    title: "Feira de Oportunidades NESP",
    date: "04/05",
    time: "10:00",
    location: "Salão de Eventos",
    type: "academic",
    description:
      "Venha conhecer empresas parceiras do NESP e vagas de estágio na área da engenharia.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000&h=500",
  },
];

export const ARMARIOS_INICIAIS: Armario[] = [
  {
    id: 1,
    formato: "padrao",
    status: true,
    acessivel: false,
    localizacao: "Prédio 1 • Térreo Norte",
  },
  {
    id: 2,
    formato: "padrao",
    status: true,
    acessivel: false,
    localizacao: "Prédio 1 • Térreo Norte",
  },
  {
    id: 3,
    formato: "padrao",
    status: true,
    acessivel: false,
    localizacao: "Prédio 2 • Hall Central",
  },
  {
    id: 4,
    formato: "padrao",
    status: true,
    acessivel: true,
    localizacao: "Prédio 1 • Térreo Acessível",
  },
  {
    id: 5,
    formato: "padrao",
    status: false,
    acessivel: true,
    localizacao: "Prédio 1 • Térreo Acessível",
  },
  {
    id: 6,
    formato: "duplo",
    status: true,
    acessivel: true,
    localizacao: "Prédio 1 • Ala Leste Acessível",
  },
  {
    id: 7,
    formato: "duplo",
    status: true,
    acessivel: true,
    localizacao: "Prédio 3 • Bloco A Acessível",
  },
  {
    id: 8,
    formato: "duplo",
    status: false,
    acessivel: true,
    localizacao: "Prédio 3 • Bloco A Acessível",
  },
];

export const CURRICULO_INICIAL: CurriculoPDF = {
  curriculoId: 1,
  nomeArquivo: gerarNomeCurriculoPadrao(
    ALUNO_LOGADO.nome,
    ALUNO_LOGADO.matricula,
    ALUNO_LOGADO.siglaCurso
  ),
  tamanhoKB: 412,
  dataUpload: "10/11/2026",
  padraoPerfil: true,
  uploadManual: false,
};

export const VAGAS_NESP: VagaEstagio[] = [
  {
    vagaId: 1,
    titulo: "Estágio em Desenvolvimento Front-End",
    empresa: "HT Cabos & Tecnologia",
    area: "Desenvolvimento Web",
    cursoAlvo: "Engenharia de Software",
    periodoMinimo: 4,
    modalidade: "Híbrido",
    cargaHoraria: "30h semanais (6h/dia)",
    descricao:
      "Atue na modernização dos portais corporativos e dashboards de telemetria industrial utilizando React, Next.js e TypeScript ao lado de um time ágil.",
    atividades: [
      "Desenvolver interfaces responsivas com Next.js App Router e Tailwind CSS.",
      "Integrar APIs REST e otimizar performance e acessibilidade (WCAG).",
      "Participar de code reviews, dailies e sprints de entrega contínua.",
    ],
    requisitos: [
      "React / Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Git e Clean Code",
    ],
    bolsaAuxilio: 1850,
    beneficios: [
      "Vale-Transporte",
      "Auxílio Alimentação",
      "Horário Flexível p/ Provas",
    ],
    prazoInscricao: "25/11/2026",
    localidade: "Híbrido • Santa Rita / Pouso Alegre",
  },
  {
    vagaId: 2,
    titulo: "Estágio em UX/UI & Interfaces Mobile",
    empresa: "Inatel Competence Center (ICC)",
    area: "Design & Experiência do Usuário",
    cursoAlvo: "Engenharia de Software",
    periodoMinimo: 3,
    modalidade: "Presencial",
    cargaHoraria: "20h ou 30h semanais",
    descricao:
      "Colabore em projetos de P&D no campus do Inatel criando fluxos centrados no usuário, protótipos interativos e testes de usabilidade com foco em IHC.",
    atividades: [
      "Elaborar wireframes, fluxos HTA e protótipos navegáveis no Figma.",
      "Conduzir avaliações heurísticas e testes de usabilidade com usuários reais.",
      "Documentar Design Systems e tokens visuais para equipes de engenharia.",
    ],
    requisitos: [
      "Prototipação e Wireframes",
      "Ergonomia e Usabilidade (IHC)",
      "HTML/CSS/JS",
      "Figma",
    ],
    bolsaAuxilio: 1700,
    beneficios: [
      "Bolsa Institucional",
      "Seguro de Vida",
      "Mentoria Técnica no Campus",
    ],
    prazoInscricao: "28/11/2026",
    localidade: "Presencial • Campus Inatel",
  },
  {
    vagaId: 3,
    titulo: "Estágio em Inteligência Artificial & Agentes",
    empresa: "Vale da Eletrônica AI Labs",
    area: "Inteligência Artificial",
    cursoAlvo: "Engenharia de Software",
    periodoMinimo: 6,
    modalidade: "Remoto",
    cargaHoraria: "30h semanais (100% flexível)",
    descricao:
      "Integre modelos de linguagem de grande porte (LLMs) e pipelines de automação inteligente em produtos B2B com foco em confiabilidade e observabilidade.",
    atividades: [
      "Construir fluxos de agentes e RAG utilizando TypeScript e Python.",
      "Avaliar qualidade de respostas e latência de chamadas a APIs de IA.",
      "Desenvolver interfaces conversacionais rápidas e transparentes.",
    ],
    requisitos: [
      "Integração de APIs LLM",
      "TypeScript / Python",
      "Arquitetura de Prompt",
      "APIs REST & JSON",
    ],
    bolsaAuxilio: 2100,
    beneficios: ["100% Remoto", "Auxílio Home Office", "Plano de Saúde"],
    prazoInscricao: "30/11/2026",
    localidade: "100% Remoto",
  },
  {
    vagaId: 4,
    titulo: "Estágio em Redes e Telecomunicações",
    empresa: "Telecom Sul de Minas",
    area: "Infraestrutura & Redes",
    cursoAlvo: "Engenharia de Telecomunicações",
    periodoMinimo: 5,
    modalidade: "Presencial",
    cargaHoraria: "30h semanais",
    descricao:
      "Participe da operação e monitoramento de redes ópticas metropolitanas (GPON/DWDM) e painéis de disponibilidade para clientes corporativos.",
    atividades: [
      "Acompanhar ativos de rede TCP/IP e enlaces de fibra óptica no NOC.",
      "Configurar alertas e painéis de métricas no Grafana e Prometheus.",
      "Apoiar vistorias técnicas e documentação de topologias.",
    ],
    requisitos: [
      "Redes TCP/IP",
      "Fibra Óptica",
      "Monitoramento Grafana/Prometheus",
    ],
    bolsaAuxilio: 1650,
    beneficios: ["Vale-Refeição", "Seguro de Vida", "Auxílio Certificações"],
    prazoInscricao: "22/11/2026",
    localidade: "Presencial • Santa Rita do Sapucaí",
  },
  {
    vagaId: 5,
    titulo: "Estágio em Engenharia de Dados & Cloud",
    empresa: "FinTech Minas Labs",
    area: "Dados & Cloud Computing",
    cursoAlvo: "Engenharia de Software",
    periodoMinimo: 5,
    modalidade: "Híbrido",
    cargaHoraria: "30h semanais",
    descricao:
      "Apoie a construção de pipelines de dados escaláveis e serviços serverless na nuvem para produtos financeiros de alta disponibilidade.",
    atividades: [
      "Desenvolver consultas SQL otimizadas e rotinas ETL em Python.",
      "Auxiliar na manutenção de recursos em nuvem (AWS / Docker).",
      "Criar relatórios analíticos automatizados para o time de produto.",
    ],
    requisitos: ["SQL & Modelagem", "Python", "AWS / Cloud", "Docker"],
    bolsaAuxilio: 1950,
    beneficios: [
      "Vale-Alimentação",
      "Plano Odontológico",
      "Day Off de Aniversário",
    ],
    prazoInscricao: "02/12/2026",
    localidade: "Híbrido • Santa Rita do Sapucaí",
  },
  {
    vagaId: 6,
    titulo: "Estágio em Sistemas Embarcados & IoT",
    empresa: "SmartSense Automação Industrial",
    area: "Sistemas Embarcados",
    cursoAlvo: "Engenharia de Computação",
    periodoMinimo: 4,
    modalidade: "Presencial",
    cargaHoraria: "30h semanais",
    descricao:
      "Desenvolva firmware e gateways IoT para monitoramento preditivo de máquinas industriais no coração do Vale da Eletrônica.",
    atividades: [
      "Programar microcontroladores ESP32 e STM32 em linguagem C/C++.",
      "Implementar comunicação MQTT e LoRaWAN para coleta de sensores.",
      "Realizar testes em bancada no laboratório de hardware.",
    ],
    requisitos: ["C / C++ Embarcado", "ESP32 / STM32", "MQTT / LoRaWAN"],
    bolsaAuxilio: 1800,
    beneficios: [
      "Vale-Transporte",
      "Auxílio Alimentação",
      "Laboratório Equipado",
    ],
    prazoInscricao: "05/12/2026",
    localidade: "Presencial • Vale da Eletrônica",
  },
];

export const CURSOS_DISPONIVEIS = [
  "Todos",
  "Engenharia de Software",
  "Engenharia de Computação",
  "Engenharia de Telecomunicações",
];

