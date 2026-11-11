export type TemaKey = "inatel" | "dark" | "limao";

export interface CursoInatel {
  sigla: string;
  nome: string;
}

export interface Aluno {
  id: string;
  alunoId: number;
  nome: string;
  matricula: string;
  curso: string;
  siglaCurso: string;
  periodo: number;
  acessibilidade: boolean;
  email: string;
  cra: number;
  avatarIniciais: string;
  telefone: string;
  cidade: string;
}

export interface Aula {
  id: number;
  codigo: string;
  disciplina: string;
  professor: string;
  data: string;
  horario: string;
  local: string;
  prova_alert: boolean;
  prova: string;
  frequencia: string;
  faltasAtuais: number;
  limiteFaltas: number;
  nota: string;
}

export interface Evento {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "tech" | "cultural" | "academic";
  description: string;
  image: string;
}

export interface Armario {
  id: number;
  formato: "padrao" | "duplo";
  status: boolean;
  acessivel: boolean;
  localizacao: string;
  dataReserva?: string;
  dataEntrega?: string;
  protocolo?: string;
}

export interface CurriculoPDF {
  curriculoId: number;
  nomeArquivo: string;
  tamanhoKB: number;
  dataUpload: string;
  padraoPerfil: boolean;
  uploadManual?: boolean;
}

export interface CurriculoExperiencia {
  id: string;
  titulo: string;
  instituicao: string;
  periodo: string;
  descricao: string;
}

export interface CurriculoLinks {
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface CurriculoDados {
  resumoProfissional: string;
  skills: string[];
  experiencias: CurriculoExperiencia[];
  idiomasCertificacoes: string[];
  links: CurriculoLinks;
  ultimaEdicao: string;
}

export interface VagaEstagio {
  vagaId: number;
  titulo: string;
  empresa: string;
  area: string;
  cursoAlvo: string;
  periodoMinimo: number;
  modalidade: "Presencial" | "Híbrido" | "Remoto";
  cargaHoraria: string;
  descricao: string;
  atividades: string[];
  requisitos: string[];
  bolsaAuxilio: number;
  beneficios: string[];
  prazoInscricao: string;
  localidade: string;
}

export type StatusCandidatura =
  | "Recebido no NESP"
  | "Em análise pela Empresa"
  | "Entrevista Agendada";

export interface Candidatura {
  candidaturaId: number;
  vaga: VagaEstagio;
  dataEnvio: string;
  status: StatusCandidatura;
  curriculoUsado: string;
}

export interface NotificacaoItem {
  id: string;
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
  href: string;
  tipo: "nesp" | "armario" | "prova" | "status";
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

