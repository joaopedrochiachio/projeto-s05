# Narração — Reel "Reels em Código"

Cole o bloco inteiro de uma vez na ElevenLabs. **Não troque nenhuma palavra**: as cenas e os efeitos
(impactos, toques, whoosh) estão presos a elas. Se quiser mudar o texto, me avise que eu ajusto o roteiro junto.

## Texto (copie daqui)

```
Seu aplicativo é incrível.
O vídeo dele, nem tanto.
E se ele mostrasse cada toque, cada tela, cada detalhe?
Telas reais. Toques reais. No ritmo da sua voz.
Mudou o texto? O vídeo inteiro se ajusta sozinho.
Outra cor, outra voz, outro idioma.
E o mesmo vídeo vira uma página que o cliente pode tocar.
Do roteiro ao post, em poucas horas.
Quer um assim pro seu produto?
Me chama no direct.
```

72 palavras, entre 26 e 32 segundos.

## Tom

Estilo **anúncio da Apple**: calmo, seguro, frases curtas com pausa entre elas. Nada de gritar.
Um sorriso leve em "nem tanto" e firmeza em "Telas reais. Toques reais." — é o momento de impacto.
Deixe uma pausa clara entre as frases: o vídeo usa essas pausas para sincronizar.

Vozes que combinam: uma voz masculina ou feminina **madura e calma** da biblioteca em pt-BR
(evite as vozes de "hook viral", que soam agitadas para esse estilo).

| Parâmetro | Valor |
|---|---|
| Modelo | Eleven v3 (ou Multilingual v2) |
| Stability | 0,55 a 0,65 (leitura mais estável e elegante) |
| Similarity | 0,75 |
| Style | 0,10 a 0,20 |
| Velocidade | 0,95 a 1,0 |
| Formato | MP3 44,1 kHz 128 kbps |

### Versão com marcações (Eleven v3, opcional)

```
[calm] Seu aplicativo é incrível.
[playful] O vídeo dele, nem tanto.
E se ele mostrasse cada toque, cada tela, cada detalhe?
[confident] Telas reais. Toques reais. No ritmo da sua voz.
Mudou o texto? O vídeo inteiro se ajusta sozinho.
Outra cor, outra voz, outro idioma.
E o mesmo vídeo vira uma página que o cliente pode tocar.
Do roteiro ao post, em poucas horas.
[warm] Quer um assim pro seu produto?
Me chama no direct.
```

## Pronúncia

| Palavra | Se sair errado, escreva assim | Observação |
|---|---|---|
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
