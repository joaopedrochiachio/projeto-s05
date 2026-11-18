# Narração — Reel "Reels em Código"

Cole o bloco inteiro de uma vez na ElevenLabs. **Não troque nenhuma palavra**: as cenas e os efeitos
(boom, pop, whoosh) estão presos a elas. Se quiser mudar o texto, me avise que eu ajusto o roteiro junto.

## Texto (copie daqui)

```
Já se imaginou fazendo vídeos assim?
Sem editor. Sem After Effects. Sem arrastar clipe por clipe.
Esse vídeo não foi editado. Ele foi programado.
Você escreve o roteiro, a inteligência artificial narra,
e cada cena entra exatamente na palavra falada.
Print real do aplicativo, animação, legenda e trilha.
Sessenta quadros por segundo, pronto pra postar.
Eu fiz esse aqui em poucas horas, do zero.
Quer um vídeo assim pro seu produto, ou aprender a fazer o seu?
Me chama no direct.
```

81 palavras, entre 28 e 35 segundos.

## Tom

Reel de venda: **energético, confiante, próximo**, como quem conta uma novidade para um amigo.
Ritmo rápido no começo, pausa curta antes de "Ele foi programado" (é o boom) e fechamento firme em
"Me chama no direct".

A voz que você já usou (**Marcio – Viral Hook Narrator**) combina com esse estilo.

| Parâmetro | Valor |
|---|---|
| Modelo | Eleven v3 (ou Multilingual v2) |
| Stability | 0,40 a 0,50 (um pouco mais de variação que no vídeo do NESP) |
| Similarity | 0,75 |
| Style | 0,30 a 0,45 |
| Formato | MP3 44,1 kHz 128 kbps |

### Versão com marcações (Eleven v3, opcional)

```
[excited] Já se imaginou fazendo vídeos assim?
Sem editor. Sem After Effects. Sem arrastar clipe por clipe.
Esse vídeo não foi editado... [confident] Ele foi programado.
Você escreve o roteiro, a inteligência artificial narra,
e cada cena entra exatamente na palavra falada.
Print real do aplicativo, animação, legenda e trilha.
[excited] Sessenta quadros por segundo, pronto pra postar.
Eu fiz esse aqui em poucas horas, do zero.
Quer um vídeo assim pro seu produto, ou aprender a fazer o seu?
[confident] Me chama no direct.
```

## Pronúncia

| Palavra | Se sair errado, escreva assim | Observação |
|---|---|---|
| After Effects | `Áfter Efécts` | nome do programa da Adobe |
| direct | `diréct` | como se fala no Instagram |
| pra | `pra` | já está informal de propósito |

## Depois de gerar

Me mande o MP3. Eu rodo:

```bash
python3 promo/tools/sincronizar.py narracao.mp3      # tempo real de cada palavra
NODE_PATH=$(npm root -g) node promo/tools/hits.mjs http://localhost:8091/index.html
python3 promo/tools/trilha.py                         # trilha com ducking sob a voz + efeitos
NODE_PATH=$(npm root -g) node promo/tools/render.mjs http://localhost:8091/index.html --fps 60
```
