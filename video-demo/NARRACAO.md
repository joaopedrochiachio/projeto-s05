# Narração — Mural de Vagas NESP

Texto para colar na **ElevenLabs** (Text to Speech). Cole o bloco inteiro de uma vez, para a entonação
fluir entre as frases (capítulo 04 do guia). Não mude nenhuma palavra: o filme está preso às palavras
deste roteiro (`roteiro.json`). Se trocar algo, avise para eu atualizar o roteiro junto.

## Texto (copie daqui)

```
Quantas vagas de estágio você já perdeu por causa do prazo?
Elas chegam espalhadas: no e-mail, no mural do corredor, no grupo da turma.
E quando você vê, a inscrição já fechou.
Agora, o Mural de Vagas do Nesp está dentro do aplicativo do Inatel.
Ao entrar, o alerta já avisa: quatro vagas para o seu perfil.
O mural filtra sozinho, pelo seu curso e pelo seu período.
Escolheu uma vaga? Confira a bolsa, os requisitos e os benefícios.
Ficou na dúvida? Salve nos favoritos e decida depois.
Na hora de se candidatar, seu currículo padrão já está no perfil.
Um toque, e pronto: candidatura enviada, com protocolo.
Em Minhas Vagas, você acompanha cada etapa: enviado, em análise, entrevista.
Mural de Vagas Nesp. Seu estágio começa no aplicativo do Inatel.
```

Cerca de 130 palavras, entre 45 e 55 segundos.

## Configuração sugerida

| Parâmetro | Valor | Por quê |
|---|---|---|
| Modelo | **Eleven v3** (ou Multilingual v2, mais estável) | v3 soa mais natural em português |
| Voz | Uma voz pronta da biblioteca em **português do Brasil**, tom jovem e confiante | Vozes prontas soam melhor que clones caseiros |
| Stability | 0,50 | Varia o tom sem perder a firmeza |
| Similarity | 0,75 | Padrão |
| Style | 0,15 a 0,25 | Um pouco de expressão, sem exagero |
| Velocidade | 1,0 | O filme se ajusta ao ritmo |
| Formato | **MP3 44,1 kHz 128 kbps** | 192 kbps só nos planos pagos |

Gere **2 ou 3 tomadas** e escolha a que terminar as frases descendo (e a primeira pergunta subindo).

## Pronúncia — confira de ouvido

| Palavra | Se sair errado, troque por | Observação |
|---|---|---|
| Nesp | `Nésp` | deve soar como uma palavra, não "ene-e-esse-pê" |
| e-mail | `i-meio` | só se a voz ler "e mail" |
| Inatel | `Inatél` | tônica no fim |

Se precisar trocar a grafia, troque **só na ElevenLabs**; o roteiro continua com a grafia original.
(A sincronização compara a sequência de frases, então uma grafia fonética não quebra nada.)

### Versão com marcações (só para o Eleven v3, opcional)

Use apenas se a tomada sem marcação ficar monótona:

```
[curious] Quantas vagas de estágio você já perdeu por causa do prazo?
Elas chegam espalhadas: no e-mail, no mural do corredor, no grupo da turma.
[sighs] E quando você vê, a inscrição já fechou.
[confident] Agora, o Mural de Vagas do Nesp está dentro do aplicativo do Inatel.
Ao entrar, o alerta já avisa: quatro vagas para o seu perfil.
O mural filtra sozinho, pelo seu curso e pelo seu período.
Escolheu uma vaga? Confira a bolsa, os requisitos e os benefícios.
Ficou na dúvida? Salve nos favoritos e decida depois.
Na hora de se candidatar, seu currículo padrão já está no perfil.
[excited] Um toque, e pronto: candidatura enviada, com protocolo.
Em Minhas Vagas, você acompanha cada etapa: enviado, em análise, entrevista.
[confident] Mural de Vagas Nesp. Seu estágio começa no aplicativo do Inatel.
```

## Depois de gerar

Envie o MP3 aqui. Eu rodo:

```bash
python3 video-demo/tools/sincronizar.py narracao.mp3
```

que grava `vo.json` com o tempo real de cada palavra e copia o áudio para `audio/narracao.mp3`.
O filme inteiro se reposiciona sozinho e o player passa a tocar com som e legenda sincronizada.
