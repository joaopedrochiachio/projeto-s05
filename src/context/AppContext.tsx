"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ARMARIOS_INICIAIS,
  AULAS_INICIAIS,
  criarCurriculoDadosPadrao,
  criarPerfilAluno,
  CURSOS_INATEL,
  EVENTOS_INATEL,
  formatarDataHoraAtual,
  gerarNomeCurriculoPadrao,
  getIniciaisNome,
  getPrimeiroESegundoNome,
  normalizarAluno,
  PERFIS_PADRAO,
  VAGAS_NESP,
} from "@/data/mockData";
import type {
  Aluno,
  Armario,
  Aula,
  Candidatura,
  CurriculoDados,
  CurriculoPDF,
  Evento,
  NotificacaoItem,
  StatusCandidatura,
  TemaKey,
  ToastMessage,
  VagaEstagio,
} from "@/types";

const STORAGE_KEY = "inatel_portal_nesp_v3";

interface PersistedState {
  tema: TemaKey;
  perfisSalvos: Aluno[];
  activeProfileId: string | null;
  favoritosIds: number[];
  curriculosPorPerfil: Record<string, CurriculoPDF>;
  curriculoDadosPorPerfil: Record<string, CurriculoDados>;
  candidaturas: Candidatura[];
  armarios: Armario[];
  armarioReservadoId: number | null;
  notificacoesEventos: NotificacaoItem[];
  notifsLidasIds: string[];
  modoAvaliacaoIhc: boolean;
}

interface NovoPerfilInput {
  nome: string;
  siglaCurso: string;
  curso: string;
  matricula: string;
  periodo: number;
}

export interface AtualizarPerfilInput {
  nome: string;
  siglaCurso: string;
  matricula: string;
  periodo: number;
  cra: number;
  email: string;
  telefone: string;
  cidade: string;
  acessibilidade: boolean;
}

interface AppContextValue {
  authReady: boolean;
  isAuthenticated: boolean;
  perfisSalvos: Aluno[];
  aluno: Aluno;
  verificarLogin: (profileId: string) => boolean;
  criarEEntrarPerfil: (dados: NovoPerfilInput) => boolean;
  atualizarPerfilAluno: (dados: AtualizarPerfilInput) => boolean;
  removerPerfilSalvo: (profileId: string) => void;
  logout: () => void;
  tema: TemaKey;
  setTema: (tema: TemaKey) => void;
  modoAvaliacaoIhc: boolean;
  toggleModoAvaliacaoIhc: () => void;
  aulas: Aula[];
  eventos: Evento[];
  vagas: VagaEstagio[];
  favoritosIds: number[];
  toggleFavorito: (vagaId: number) => void;
  isFavorita: (vagaId: number) => boolean;
  curriculoPerfil: CurriculoPDF;
  curriculoDados: CurriculoDados;
  atualizarCurriculoDados: (
    dados: Omit<CurriculoDados, "ultimaEdicao">
  ) => void;
  uploadCurriculo: (file: File) => boolean;
  candidaturas: Candidatura[];
  enviarCandidatura: (
    vaga: VagaEstagio,
    curriculoNome?: string
  ) => Promise<Candidatura | null>;
  simularAvancoStatus: (candidaturaId: number) => void;
  getCandidaturaPorVaga: (vagaId: number) => Candidatura | undefined;
  armarios: Armario[];
  armarioReservado: Armario | null;
  reservarArmario: (formato: "padrao" | "duplo") => {
    ok: boolean;
    message: string;
    armario?: Armario;
  };
  liberarArmario: () => void;
  buscaGlobal: string;
  setBuscaGlobal: (q: string) => void;
  notificacoes: NotificacaoItem[];
  naoLidasCount: number;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasLidas: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [tema, setTemaState] = useState<TemaKey>("inatel");
  const [perfisSalvos, setPerfisSalvos] = useState<Aluno[]>(PERFIS_PADRAO);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [favoritosIds, setFavoritosIds] = useState<number[]>([2]);
  const [curriculosPorPerfil, setCurriculosPorPerfil] = useState<
    Record<string, CurriculoPDF>
  >({});
  const [curriculoDadosPorPerfil, setCurriculoDadosPorPerfil] = useState<
    Record<string, CurriculoDados>
  >({});
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [armarios, setArmarios] = useState<Armario[]>(ARMARIOS_INICIAIS);
  const [armarioReservadoId, setArmarioReservadoId] = useState<number | null>(
    null
  );
  const [notificacoesEventos, setNotificacoesEventos] = useState<
    NotificacaoItem[]
  >([]);
  const [notifsLidasIds, setNotifsLidasIds] = useState<string[]>([]);
  const [modoAvaliacaoIhc, setModoAvaliacaoIhc] = useState<boolean>(false);
  const [buscaGlobal, setBuscaGlobal] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hydratedRef = useRef(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          if (
            parsed.tema === "inatel" ||
            parsed.tema === "dark" ||
            parsed.tema === "limao"
          ) {
            setTemaState(parsed.tema);
          }
          if (
            Array.isArray(parsed.perfisSalvos) &&
            parsed.perfisSalvos.length > 0
          ) {
            setPerfisSalvos(parsed.perfisSalvos.map(normalizarAluno));
          }
          if (
            typeof parsed.activeProfileId === "string" ||
            parsed.activeProfileId === null
          ) {
            setActiveProfileId(parsed.activeProfileId);
          }
          if (Array.isArray(parsed.favoritosIds)) {
            setFavoritosIds(parsed.favoritosIds);
          }
          if (
            parsed.curriculosPorPerfil &&
            typeof parsed.curriculosPorPerfil === "object"
          ) {
            setCurriculosPorPerfil(parsed.curriculosPorPerfil);
          }
          if (
            parsed.curriculoDadosPorPerfil &&
            typeof parsed.curriculoDadosPorPerfil === "object"
          ) {
            setCurriculoDadosPorPerfil(parsed.curriculoDadosPorPerfil);
          }
          if (Array.isArray(parsed.candidaturas)) {
            setCandidaturas(parsed.candidaturas);
          }
          if (Array.isArray(parsed.armarios) && parsed.armarios.length > 0) {
            setArmarios(parsed.armarios);
          }
          if (
            typeof parsed.armarioReservadoId === "number" ||
            parsed.armarioReservadoId === null
          ) {
            setArmarioReservadoId(parsed.armarioReservadoId);
          }
          if (Array.isArray(parsed.notificacoesEventos)) {
            setNotificacoesEventos(parsed.notificacoesEventos);
          }
          if (Array.isArray(parsed.notifsLidasIds)) {
            setNotifsLidasIds(parsed.notifsLidasIds);
          }
          if (typeof parsed.modoAvaliacaoIhc === "boolean") {
            setModoAvaliacaoIhc(parsed.modoAvaliacaoIhc);
          }
        }
      } catch {
        // Ignore corrupted localStorage entries
      } finally {
        hydratedRef.current = true;
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
  }, [tema]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const payload: PersistedState = {
        tema,
        perfisSalvos,
        activeProfileId,
        favoritosIds,
        curriculosPorPerfil,
        curriculoDadosPorPerfil,
        candidaturas,
        armarios,
        armarioReservadoId,
        notificacoesEventos,
        notifsLidasIds,
        modoAvaliacaoIhc,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    tema,
    perfisSalvos,
    activeProfileId,
    favoritosIds,
    curriculosPorPerfil,
    curriculoDadosPorPerfil,
    candidaturas,
    armarios,
    armarioReservadoId,
    notificacoesEventos,
    notifsLidasIds,
    modoAvaliacaoIhc,
  ]);

  const activeProfile = useMemo(
    () => perfisSalvos.find((p) => p.id === activeProfileId) ?? null,
    [perfisSalvos, activeProfileId]
  );

  const isAuthenticated = activeProfile !== null;
  const aluno = activeProfile ?? perfisSalvos[0] ?? PERFIS_PADRAO[0];

  // +verificarLogin(): bool (UML UsuarioApp)
  const verificarLogin = useCallback(
    (profileId: string): boolean => {
      const encontrado = perfisSalvos.find((p) => p.id === profileId);
      if (!encontrado) {
        showToast("Perfil não encontrado. Tente novamente.", "error");
        return false;
      }
      setActiveProfileId(encontrado.id);
      setBuscaGlobal("");
      showToast(
        `Bem-vindo, ${getPrimeiroESegundoNome(encontrado.nome)}! (${encontrado.siglaCurso} - ${encontrado.matricula})`,
        "success"
      );
      return true;
    },
    [perfisSalvos, showToast]
  );

  const criarEEntrarPerfil = useCallback(
    (dados: NovoPerfilInput): boolean => {
      const nomeLimpo = dados.nome.trim();
      const matLimpa = dados.matricula.trim();
      if (!nomeLimpo || !matLimpa) {
        showToast("Preencha nome completo e matrícula para entrar.", "warning");
        return false;
      }
      const novo = criarPerfilAluno({
        nome: nomeLimpo,
        siglaCurso: dados.siglaCurso,
        curso: dados.curso,
        matricula: matLimpa,
        periodo: dados.periodo,
      });
      setPerfisSalvos((prev) => [novo, ...prev]);
      setActiveProfileId(novo.id);
      setBuscaGlobal("");
      showToast(
        `Perfil salvo! Bem-vindo, ${getPrimeiroESegundoNome(novo.nome)} (${novo.siglaCurso} - ${novo.matricula}).`,
        "success"
      );
      return true;
    },
    [showToast]
  );

  const removerPerfilSalvo = useCallback(
    (profileId: string) => {
      if (perfisSalvos.length <= 1) {
        showToast("É necessário manter ao menos um perfil salvo.", "warning");
        return;
      }
      setPerfisSalvos((prev) => prev.filter((p) => p.id !== profileId));
      if (activeProfileId === profileId) {
        setActiveProfileId(null);
      }
      showToast("Perfil removido do navegador.", "info");
    },
    [perfisSalvos.length, activeProfileId, showToast]
  );

  const atualizarPerfilAluno = useCallback(
    (dados: AtualizarPerfilInput): boolean => {
      const nomeLimpo = dados.nome.trim();
      const matLimpa = dados.matricula.trim();
      const emailLimpo = dados.email.trim();
      if (nomeLimpo.length < 3 || !matLimpa || !emailLimpo) {
        showToast(
          "Preencha nome completo, matrícula e e-mail institucional.",
          "warning"
        );
        return false;
      }

      const siglaUpper = dados.siglaCurso.toUpperCase();
      const cursoSelecionado =
        CURSOS_INATEL.find((c) => c.sigla === siglaUpper) ?? CURSOS_INATEL[0];
      const craValido = Number.isFinite(dados.cra)
        ? Math.min(10, Math.max(0, Number(dados.cra.toFixed(1))))
        : aluno.cra;
      const matNum = Number.parseInt(matLimpa.replace(/\D/g, ""), 10);

      setPerfisSalvos((prev) =>
        prev.map((p) =>
          p.id === aluno.id
            ? {
                ...p,
                alunoId: Number.isNaN(matNum) ? p.alunoId : matNum,
                nome: nomeLimpo,
                siglaCurso: cursoSelecionado.sigla,
                curso: cursoSelecionado.nome,
                matricula: matLimpa,
                periodo: Math.min(10, Math.max(1, dados.periodo)),
                cra: craValido,
                email: emailLimpo,
                telefone: dados.telefone.trim() || "(35) 99853-2026",
                cidade:
                  dados.cidade.trim() ||
                  "Pouso Alegre / Santa Rita do Sapucaí - MG",
                acessibilidade: dados.acessibilidade,
                avatarIniciais: getIniciaisNome(nomeLimpo),
              }
            : p
        )
      );

      showToast("Informações do perfil atualizadas com sucesso!", "success");
      return true;
    },
    [aluno.cra, aluno.id, showToast]
  );

  const logout = useCallback(() => {
    setActiveProfileId(null);
    setBuscaGlobal("");
    showToast("Sessão encerrada. Selecione outro perfil.", "info");
  }, [showToast]);

  const setTema = useCallback(
    (novoTema: TemaKey) => {
      setTemaState(novoTema);
      const label =
        novoTema === "inatel"
          ? "Inatel Padrão"
          : novoTema === "dark"
            ? "Modo Escuro"
            : "Tema Limão";
      showToast(`Tema alterado para ${label}.`, "info");
    },
    [showToast]
  );

  const toggleModoAvaliacaoIhc = useCallback(() => {
    setModoAvaliacaoIhc((prev) => {
      const next = !prev;
      showToast(
        next
          ? "Guia HTA / IHC ativado: badges acadêmicas visíveis."
          : "Guia HTA / IHC desativado: modo produto padrão.",
        "info"
      );
      return next;
    });
  }, [showToast]);

  const curriculoPerfil = useMemo<CurriculoPDF>(() => {
    const salvo = curriculosPorPerfil[aluno.id];
    if (salvo && salvo.uploadManual) {
      return salvo;
    }
    return {
      curriculoId: salvo?.curriculoId ?? 1,
      nomeArquivo: gerarNomeCurriculoPadrao(
        aluno.nome,
        aluno.matricula,
        aluno.siglaCurso
      ),
      tamanhoKB: salvo?.tamanhoKB ?? 412,
      dataUpload: salvo?.dataUpload ?? "10/11/2026",
      padraoPerfil: true,
      uploadManual: false,
    };
  }, [aluno, curriculosPorPerfil]);

  const curriculoDados = useMemo<CurriculoDados>(() => {
    const salvo = curriculoDadosPorPerfil[aluno.id];
    if (salvo) return salvo;
    return criarCurriculoDadosPadrao(aluno);
  }, [aluno, curriculoDadosPorPerfil]);

  const atualizarCurriculoDados = useCallback(
    (dados: Omit<CurriculoDados, "ultimaEdicao">) => {
      const dataHora = formatarDataHoraAtual();
      setCurriculoDadosPorPerfil((prev) => ({
        ...prev,
        [aluno.id]: {
          ...dados,
          ultimaEdicao: dataHora,
        },
      }));

      setCurriculosPorPerfil((prev) => {
        const atual = prev[aluno.id];
        return {
          ...prev,
          [aluno.id]: {
            curriculoId: atual?.curriculoId ?? Date.now(),
            nomeArquivo:
              atual?.uploadManual && atual.nomeArquivo
                ? atual.nomeArquivo
                : gerarNomeCurriculoPadrao(
                    aluno.nome,
                    aluno.matricula,
                    aluno.siglaCurso
                  ),
            tamanhoKB: atual?.uploadManual ? atual.tamanhoKB : 428,
            dataUpload: dataHora,
            padraoPerfil: true,
            uploadManual: atual?.uploadManual ?? false,
          },
        };
      });

      showToast(
        "Currículo atualizado e pronto para envio em 1-toque!",
        "success"
      );
    },
    [aluno.id, aluno.matricula, aluno.nome, aluno.siglaCurso, showToast]
  );

  const toggleFavorito = useCallback(
    (vagaId: number) => {
      setFavoritosIds((prev) => {
        const exists = prev.includes(vagaId);
        if (exists) {
          showToast("Vaga removida dos seus favoritos.", "info");
          return prev.filter((id) => id !== vagaId);
        }
        showToast("Vaga salva nos Favoritos para revisão posterior!", "success");
        return [...prev, vagaId];
      });
    },
    [showToast]
  );

  const isFavorita = useCallback(
    (vagaId: number) => favoritosIds.includes(vagaId),
    [favoritosIds]
  );

  const uploadCurriculo = useCallback(
    (file: File): boolean => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        showToast("Selecione apenas arquivos em formato PDF.", "warning");
        return false;
      }
      const novo: CurriculoPDF = {
        curriculoId: Date.now(),
        nomeArquivo: file.name,
        tamanhoKB: Math.max(120, Math.round(file.size / 1024)),
        dataUpload: new Date().toLocaleDateString("pt-BR"),
        padraoPerfil: true,
        uploadManual: true,
      };
      setCurriculosPorPerfil((prev) => ({
        ...prev,
        [aluno.id]: novo,
      }));
      showToast(`Currículo "${file.name}" atualizado no seu perfil!`, "success");
      return true;
    },
    [aluno.id, showToast]
  );

  const getCandidaturaPorVaga = useCallback(
    (vagaId: number) => candidaturas.find((c) => c.vaga.vagaId === vagaId),
    [candidaturas]
  );

  const enviarCandidatura = useCallback(
    async (
      vaga: VagaEstagio,
      curriculoNome?: string
    ): Promise<Candidatura | null> => {
      const existente = candidaturas.find((c) => c.vaga.vagaId === vaga.vagaId);
      if (existente) {
        showToast(
          `Você já enviou candidatura para ${vaga.empresa} (#${existente.candidaturaId}).`,
          "info"
        );
        return existente;
      }

      await new Promise((resolve) => setTimeout(resolve, 650));

      const nova: Candidatura = {
        candidaturaId: Math.floor(1000 + Math.random() * 9000),
        vaga,
        dataEnvio: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Recebido no NESP",
        curriculoUsado: curriculoNome || curriculoPerfil.nomeArquivo,
      };

      setCandidaturas((prev) => [nova, ...prev]);
      setNotificacoesEventos((prev) => [
        {
          id: `notif-cand-${nova.candidaturaId}`,
          titulo: `Protocolo #${nova.candidaturaId} confirmado`,
          descricao: `Candidatura para ${vaga.titulo} enviada à ${vaga.empresa}.`,
          tempo: "Agora",
          lida: false,
          href: "/minhas-vagas",
          tipo: "status",
        },
        ...prev,
      ]);
      showToast(
        `Candidatura #${nova.candidaturaId} enviada para ${vaga.empresa}!`,
        "success"
      );
      return nova;
    },
    [candidaturas, curriculoPerfil.nomeArquivo, showToast]
  );

  const simularAvancoStatus = useCallback(
    (candidaturaId: number) => {
      let novoStatusAplicado: StatusCandidatura | null = null;
      let empresaNome = "";

      setCandidaturas((prev) =>
        prev.map((c) => {
          if (c.candidaturaId !== candidaturaId) return c;
          if (c.status === "Entrevista Agendada") return c;
          const proximoStatus: StatusCandidatura =
            c.status === "Recebido no NESP"
              ? "Em análise pela Empresa"
              : "Entrevista Agendada";
          novoStatusAplicado = proximoStatus;
          empresaNome = c.vaga.empresa;
          return { ...c, status: proximoStatus };
        })
      );

      if (novoStatusAplicado) {
        const statusMsg = novoStatusAplicado;
        setNotificacoesEventos((prev) => [
          {
            id: `notif-upd-${candidaturaId}-${Date.now()}`,
            titulo: `Atualização NESP #${candidaturaId}`,
            descricao: `${empresaNome}: status atualizado para "${statusMsg}".`,
            tempo: "Agora",
            lida: false,
            href: "/minhas-vagas",
            tipo: "status",
          },
          ...prev,
        ]);
        showToast(`Status atualizado: ${statusMsg}!`, "success");
      }
    },
    [showToast]
  );

  const armarioReservado = useMemo(
    () => armarios.find((a) => a.id === armarioReservadoId) ?? null,
    [armarios, armarioReservadoId]
  );

  const reservarArmario = useCallback(
    (formato: "padrao" | "duplo") => {
      const disponiveis = armarios.filter(
        (a) =>
          a.formato === formato &&
          a.status === true &&
          a.acessivel === aluno.acessibilidade
      );

      if (disponiveis.length === 0) {
        const msg = `Nenhum armário ${formato === "padrao" ? "Padrão" : "Duplo"} acessível disponível no momento.`;
        showToast(msg, "warning");
        return { ok: false, message: msg };
      }

      const sorteado =
        disponiveis[Math.floor(Math.random() * disponiveis.length)];
      const agora = new Date();
      const entrega = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
      const formatDate = (d: Date) =>
        d.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

      const protocolo = `ARM-${Math.floor(1000 + Math.random() * 9000)}`;
      const atualizado: Armario = {
        ...sorteado,
        status: false,
        dataReserva: formatDate(agora),
        dataEntrega: formatDate(entrega),
        protocolo,
      };

      setArmarios((prev) =>
        prev.map((a) => {
          if (a.id === armarioReservadoId) {
            return {
              ...a,
              status: true,
              dataReserva: undefined,
              dataEntrega: undefined,
              protocolo: undefined,
            };
          }
          return a.id === sorteado.id ? atualizado : a;
        })
      );
      setArmarioReservadoId(sorteado.id);

      const okMsg = `Armário Nº ${sorteado.id} reservado com sucesso (${protocolo})!`;
      showToast(okMsg, "success");
      return { ok: true, message: okMsg, armario: atualizado };
    },
    [armarios, armarioReservadoId, aluno.acessibilidade, showToast]
  );

  const liberarArmario = useCallback(() => {
    if (armarioReservadoId === null) return;
    setArmarios((prev) =>
      prev.map((a) =>
        a.id === armarioReservadoId
          ? {
              ...a,
              status: true,
              dataReserva: undefined,
              dataEntrega: undefined,
              protocolo: undefined,
            }
          : a
      )
    );
    setArmarioReservadoId(null);
    showToast("Armário devolvido e liberado para outros alunos.", "info");
  }, [armarioReservadoId, showToast]);

  const notificacoes = useMemo<NotificacaoItem[]>(() => {
    const compativeisCount = VAGAS_NESP.filter(
      (v) => v.cursoAlvo === aluno.curso && v.periodoMinimo <= aluno.periodo
    ).length;

    const base: NotificacaoItem[] = [
      {
        id: `notif-nesp-${aluno.id}`,
        titulo: `Vagas NESP para ${aluno.siglaCurso} - ${aluno.matricula}`,
        descricao:
          compativeisCount > 0
            ? `${compativeisCount} oportunidade(s) compatível(is) com ${aluno.curso} (${aluno.periodo}º período).`
            : `Explore as ${VAGAS_NESP.length} vagas abertas no Mural de Estágios do NESP.`,
        tempo: "Agora",
        lida: false,
        href: "/vagas",
        tipo: "nesp",
      },
      {
        id: "notif-armario",
        titulo: armarioReservado
          ? `Entrega do Armário Nº ${armarioReservado.id}`
          : "Lembrete de Armário no Campus",
        descricao: armarioReservado
          ? `Protocolo ${armarioReservado.protocolo}: devolução prevista até ${armarioReservado.dataEntrega}.`
          : "Reserve um armário acessível no Prédio 1 válido por 24 horas.",
        tempo: "Hoje",
        lida: false,
        href: "/#armarios",
        tipo: "armario",
      },
      {
        id: "notif-prova",
        titulo: "Alerta de Provas em 12/05",
        descricao: "E01 (Circuitos) e M02 (Álgebra) possuem avaliação agendada.",
        tempo: "2h atrás",
        lida: true,
        href: "/",
        tipo: "prova",
      },
    ];

    return [...notificacoesEventos, ...base].map((n) => ({
      ...n,
      lida: n.lida || notifsLidasIds.includes(n.id),
    }));
  }, [aluno, armarioReservado, notificacoesEventos, notifsLidasIds]);

  const marcarNotificacaoLida = useCallback((id: string) => {
    setNotifsLidasIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const marcarTodasLidas = useCallback(() => {
    setNotifsLidasIds((prev) => {
      const allIds = new Set([...prev, ...notificacoes.map((n) => n.id)]);
      return Array.from(allIds);
    });
  }, [notificacoes]);

  const naoLidasCount = useMemo(
    () => notificacoes.filter((n) => !n.lida).length,
    [notificacoes]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      authReady,
      isAuthenticated,
      perfisSalvos,
      aluno,
      verificarLogin,
      criarEEntrarPerfil,
      atualizarPerfilAluno,
      removerPerfilSalvo,
      logout,
      tema,
      setTema,
      modoAvaliacaoIhc,
      toggleModoAvaliacaoIhc,
      aulas: AULAS_INICIAIS,
      eventos: EVENTOS_INATEL,
      vagas: VAGAS_NESP,
      favoritosIds,
      toggleFavorito,
      isFavorita,
      curriculoPerfil,
      curriculoDados,
      atualizarCurriculoDados,
      uploadCurriculo,
      candidaturas,
      enviarCandidatura,
      simularAvancoStatus,
      getCandidaturaPorVaga,
      armarios,
      armarioReservado,
      reservarArmario,
      liberarArmario,
      buscaGlobal,
      setBuscaGlobal,
      notificacoes,
      naoLidasCount,
      marcarNotificacaoLida,
      marcarTodasLidas,
      toasts,
      showToast,
      dismissToast,
    }),
    [
      authReady,
      isAuthenticated,
      perfisSalvos,
      aluno,
      verificarLogin,
      criarEEntrarPerfil,
      atualizarPerfilAluno,
      removerPerfilSalvo,
      logout,
      tema,
      setTema,
      modoAvaliacaoIhc,
      toggleModoAvaliacaoIhc,
      favoritosIds,
      toggleFavorito,
      isFavorita,
      curriculoPerfil,
      curriculoDados,
      atualizarCurriculoDados,
      uploadCurriculo,
      candidaturas,
      enviarCandidatura,
      simularAvancoStatus,
      getCandidaturaPorVaga,
      armarios,
      armarioReservado,
      reservarArmario,
      liberarArmario,
      buscaGlobal,
      notificacoes,
      naoLidasCount,
      marcarNotificacaoLida,
      marcarTodasLidas,
      toasts,
      showToast,
      dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp deve ser usado dentro de AppProvider");
  }
  return ctx;
}

