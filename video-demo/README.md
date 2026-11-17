# Vídeo interativo — Mural de Vagas NESP

Demonstração 9:16 (1080×1920) da tarefa completa do aluno no App Inatel, feita no método
**Fábrica de Criativos**: o filme é uma função do tempo (`draw(ctx, t)`), as telas são **prints reais**
do app e cada cena começa numa **palavra da narração**.

## Abrir

Precisa de um servidor estático (módulos ES não abrem via `file://`):

```bash
cd video-demo && python3 -m http.server 8090
```

Depois abra `http://localhost:8090`. No GitHub Pages funciona direto.

## O que é interativo

- Play/pausa (clique no vídeo ou `Espaço`), linha do tempo arrastável com marcas de capítulo
- **11 capítulos** ligados à documentação: tela do wireframe, etapa da HTA e método do diagrama de classes
- Legenda karaokê presa ao `vo.json` (`C`), velocidade 0,5× a 2×, tela cheia (`F`)
- Navegação por quadro (`,` `.`), por capítulo (`↑` `↓`, `1`–`9`) e link direto para um instante (`#t=24.5`)

## Estrutura

| Arquivo | Papel |
|---|---|
| `film.js` | As 11 cenas, presas às palavras (`wt(VO, 'palavra')`) |
| `player.js` | Relógio (áudio ou interno), capítulos, legenda, atalhos, modo `?render=1` |
| `lib/motion.js` | Harness do Fábrica de Criativos / motion-reel (MIT): molas, easing, ruído com semente |
| `lib/vo.js` | `loadVO`, `wt`, `ph` (narração no tempo) |
| `roteiro.json` | Falas e textos de tela |
| `vo.json` | Tempo de cada palavra (estimado até a narração chegar) |
| `app/*.jpg` + `app/telas.json` | Prints reais do app (iPhone @3x) e posição dos elementos |
| `NARRACAO.md` | Texto e configuração para a ElevenLabs |

## Ferramentas

```bash
# prints reais do app (build de produção rodando em :3100)
NODE_PATH=$(npm root -g) node video-demo/tools/capturar.mjs http://localhost:3100

# tempos estimados a partir do roteiro (antes de existir áudio)
node video-demo/tools/estimar_vo.mjs

# sincroniza com a narração real (Whisper se disponível; senão, pelas pausas do áudio)
python3 video-demo/tools/sincronizar.py narracao.mp3

# folha de contato para revisão
NODE_PATH=$(npm root -g) node video-demo/tools/contato.mjs http://localhost:8090/index.html contato.jpg

# MP4 final 1080×1920 (junta audio/narracao.mp3 se existir)
NODE_PATH=$(npm root -g) node video-demo/tools/render.mjs http://localhost:8090/index.html --fps 60
```

Créditos: `lib/motion.js` deriva do motion-reel / Fábrica de Criativos (licença MIT).
