# App Inatel + Mural de Vagas NESP

Protótipo funcional do portal acadêmico do Inatel integrado a um **mural de vagas de estágio do NESP**. Trabalho final da disciplina de **Interação Humano-Computador (IHC)**.

O aluno vê aulas, eventos e armário no painel, busca vagas com filtros, salva favoritas, edita o currículo e se candidata, acompanhando o status de cada candidatura.

🔗 **Demo:** https://joaopedrochiachio.github.io/projeto-s05/
🎬 **Vídeo interativo:** https://joaopedrochiachio.github.io/projeto-s05/demo/

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?logo=tailwindcss&logoColor=white)

## Funcionalidades

- **Login** no padrão visual do Inatel
- **Painel do aluno**: boas-vindas, grade de aulas, carrossel de eventos e armário
- **Mural de vagas**: busca, filtros, favoritas e prazo de inscrição
- **Detalhe da vaga** e **candidatura** com prévia do currículo
- **Minhas vagas**: acompanhamento do status das candidaturas
- **Perfil e currículo** editáveis
- **Modo avaliação de IHC**: selos na interface que ligam cada tela à etapa da HTA, ao wireframe e ao método usado

## Vídeo interativo

A pasta [`video-demo/`](video-demo/) tem um vídeo vertical (9:16) que percorre a tarefa completa do aluno, feito com prints reais do app e narração sincronizada palavra a palavra. Tem capítulos ligados à documentação de IHC, legenda e atalhos de teclado. Detalhes em [`video-demo/README.md`](video-demo/README.md).

## Estrutura

```
src/app/             Páginas: painel, vagas, detalhe da vaga, minhas vagas
src/components/      auth, dashboard, layout e nesp (vagas, candidatura, currículo)
src/context/         Estado global do app
src/data/            Dados de exemplo (vagas, empresas, aulas)
video-demo/          Vídeo interativo e ferramentas de captura/sincronização
scripts/             Montagem do site para o GitHub Pages
```

Os dados são de exemplo: não há backend.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Deploy

A cada push na `master`, o workflow [`pages.yml`](.github/workflows/pages.yml) gera o export estático do Next, junta o vídeo em `/demo` e publica no GitHub Pages.

## Licença

[MIT](LICENSE) © João Pedro Chiachio de Paiva
