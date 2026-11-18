"""Sincroniza o filme com a narração real (capítulo 05 do guia: narração no tempo).

uso: python3 video-demo/tools/sincronizar.py <narracao.mp3|wav> [--modelo small] [--cauda 2.4] [--sem-whisper]

1. Converte o áudio (ffmpeg) e transcreve com faster-whisper, marcando o tempo de cada palavra.
2. Alinha por sequência as palavras do roteiro.json com as ouvidas pelo Whisper: a GRAFIA vem do
   roteiro (para wt('palavra') achar), o TEMPO vem do áudio. Palavras não reconhecidas são interpoladas.
3. Grava video-demo/vo.json (estimado: false) e copia o áudio para video-demo/audio/narracao.mp3.

Sem Whisper (modelo indisponível ou --sem-whisper): detecta as pausas reais do áudio com o
silencedetect do ffmpeg, encaixa as frases do roteiro nos trechos de fala (programação dinâmica)
e distribui as palavras de cada frase pelo tempo de fala, pulando as pausas. Precisão de frase
exata e de palavra aproximada, suficiente para prender as cenas.

Depois disso o filme inteiro se reposiciona sozinho: cada cena está presa a uma palavra.
Requer: ffmpeg no PATH; opcional: pip install faster-whisper
"""
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
NUM = {"4": "quatro", "6": "seis", "1": "um", "2": "dois", "3": "tres"}


def arg(nome, padrao, tipo=str):
    return tipo(sys.argv[sys.argv.index(nome) + 1]) if nome in sys.argv else padrao


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]", "", s)
    return NUM.get(s, s)


def duracao(arquivo):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def transcrever(arquivo, modelo):
    from faster_whisper import WhisperModel
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "vo16k.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", arquivo, "-ac", "1", "-ar", "16000", wav], check=True)
        m = WhisperModel(modelo, device="cpu", compute_type="int8")
        segs, _ = m.transcribe(wav, language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
        return [{"w": w.word.strip(), "t0": w.start, "t1": w.end} for s in segs for w in (s.words or [])]


def trechos_de_fala(arquivo, ruido="-38dB", minimo=0.16):
    """Intervalos [(t0, t1)] com fala, a partir do silencedetect do ffmpeg."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", arquivo, "-af", f"silencedetect=noise={ruido}:d={minimo}",
                        "-f", "null", "-"], capture_output=True, text=True)
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fim = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    total = duracao(arquivo)
    silencios = list(zip(ini, fim + [total] * (len(ini) - len(fim))))
    fala, t = [], 0.0
    for a, b in silencios:
        if a - t > 0.05:
            fala.append((t, a))
        t = b
    if total - t > 0.05:
        fala.append((t, total))
    return fala


def alinhar_por_pausas(arquivo, falas):
    """Encaixa as frases nos trechos de fala e distribui as palavras pelo tempo falado."""
    seg = trechos_de_fala(arquivo)
    n, m = len(falas), len(seg)
    if m < n:
        sys.exit(f"o áudio tem {m} trechos de fala para {n} frases: confira se a narração está completa")
    peso = [sum(len(norm(w)) + 1 for w in f.split()) for f in falas]
    fala_total = sum(b - a for a, b in seg)
    esperado = [fala_total * p / sum(peso) for p in peso]
    gap = [seg[j + 1][0] - seg[j][1] for j in range(m - 1)]
    INF = float("inf")
    # custo[i][j]: melhor encaixe das i primeiras frases nos j primeiros trechos
    custo = [[INF] * (m + 1) for _ in range(n + 1)]
    volta = [[0] * (m + 1) for _ in range(n + 1)]
    custo[0][0] = 0.0
    for i in range(1, n + 1):
        for j in range(i, m - (n - i) + 1):
            for k in range(i - 1, j):
                if custo[i - 1][k] == INF:
                    continue
                real = sum(b - a for a, b in seg[k:j])
                c = ((real - esperado[i - 1]) / max(esperado[i - 1], 0.5)) ** 2
                if j < m:
                    c -= 1.5 * min(gap[j - 1], 1.2)  # fronteira de frase prefere pausa longa
                if custo[i - 1][k] + c < custo[i][j]:
                    custo[i][j] = custo[i - 1][k] + c
                    volta[i][j] = k
    grupos, j = [], m
    for i in range(n, 0, -1):
        k = volta[i][j]
        grupos.append(seg[k:j])
        j = k
    grupos.reverse()

    words = []
    for fala, trechos in zip(falas, grupos):
        ws = fala.split()
        pesos = [len(norm(w)) + 1.5 for w in ws]
        # encaixa as palavras nos trechos de fala da frase (cada trecho recebe palavras contíguas),
        # comparando a duração real com a esperada e preferindo cortar na pontuação
        n, k = len(ws), len(trechos)
        if k > n:  # mais trechos que palavras: junta os trechos menores
            trechos = [(trechos[0][0], trechos[-1][1])]
            k = 1
        falado = sum(b - a for a, b in trechos)
        tot = sum(pesos)
        INF = float("inf")
        cst = [[INF] * (n + 1) for _ in range(k + 1)]
        vt = [[0] * (n + 1) for _ in range(k + 1)]
        cst[0][0] = 0.0
        for j in range(1, k + 1):
            dur = trechos[j - 1][1] - trechos[j - 1][0]
            for e in range(j, n - (k - j) + 1):
                for s0 in range(j - 1, e):
                    if cst[j - 1][s0] == INF:
                        continue
                    exp = falado * sum(pesos[s0:e]) / tot
                    c = ((dur - exp) / max(exp, 0.3)) ** 2
                    if j < k and re.search(r"[,.:;?!]$", ws[e - 1]):
                        c -= 0.6
                    if cst[j - 1][s0] + c < cst[j][e]:
                        cst[j][e] = cst[j - 1][s0] + c
                        vt[j][e] = s0
        cortes, e = [], n
        for j in range(k, 0, -1):
            s0 = vt[j][e]
            cortes.append((s0, e))
            e = s0
        cortes.reverse()
        for (a0, b0), (ta, tb) in zip(cortes, trechos):
            ps = pesos[a0:b0]
            acc = 0.0
            for w, p in zip(ws[a0:b0], ps):
                x0 = (tb - ta) * acc / sum(ps)
                acc += p
                x1 = (tb - ta) * acc / sum(ps)
                words.append({"w": w, "t0": round(ta + x0, 3), "t1": round(ta + x1, 3)})
    return words


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("--"):
        sys.exit(__doc__)
    audio = os.path.abspath(sys.argv[1])
    modelo = arg("--modelo", "small")
    cauda = arg("--cauda", 2.4, float)

    rot = json.load(open(os.path.join(DIR, "roteiro.json"), encoding="utf-8"))
    falas = rot["falas"]
    palavras, frase_de = [], []
    for i, fala in enumerate(falas):
        for w in fala.split():
            palavras.append(w)
            frase_de.append(i)

    ouvidas = None
    if "--sem-whisper" not in sys.argv:
        try:
            print(f"transcrevendo {os.path.basename(audio)} com faster-whisper ({modelo})…")
            ouvidas = transcrever(audio, modelo)
        except Exception as e:  # sem pacote ou sem acesso ao modelo
            print(f"Whisper indisponível ({type(e).__name__}); usando as pausas do áudio.")
    if ouvidas is None:
        words = alinhar_por_pausas(audio, falas)
        return gravar(audio, falas, frase_de, words, [], cauda, "pausas")
    a = [norm(w) for w in palavras]
    b = [norm(w["w"]) for w in ouvidas]

    tempos = [None] * len(palavras)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                tempos[i1 + k] = (ouvidas[j1 + k]["t0"], ouvidas[j1 + k]["t1"])
        elif tag == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):  # mesma quantidade: grafia diferente (ex.: "Nesp" → "NESP")
                tempos[i1 + k] = (ouvidas[j1 + k]["t0"], ouvidas[j1 + k]["t1"])
        elif tag == "replace" and j2 > j1:  # bloco desigual: distribui o intervalo ouvido
            t0, t1 = ouvidas[j1]["t0"], ouvidas[j2 - 1]["t1"]
            n = i2 - i1
            for k in range(n):
                tempos[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)

    faltou = [palavras[i] for i, x in enumerate(tempos) if x is None]
    # interpola o que o Whisper não ouviu
    for i in range(len(tempos)):
        if tempos[i] is None:
            ant = next((tempos[j][1] for j in range(i - 1, -1, -1) if tempos[j]), 0.0)
            prox = next((tempos[j][0] for j in range(i + 1, len(tempos)) if tempos[j]), ant + 0.4)
            tempos[i] = (ant, max(ant + 0.05, min(prox, ant + 0.4)))

    words = [{"w": w, "t0": round(t[0], 3), "t1": round(t[1], 3)} for w, t in zip(palavras, tempos)]
    return gravar(audio, falas, frase_de, words, faltou, cauda, f"whisper-{modelo}")


def gravar(audio, falas, frase_de, words, faltou, cauda, metodo):
    frases = []
    for i, fala in enumerate(falas):
        idx = [k for k, f in enumerate(frase_de) if f == i]
        frases.append({"texto": fala, "t0": words[idx[0]]["t0"], "t1": words[idx[-1]]["t1"], "words": [idx[0], idx[-1]]})

    dur_audio = duracao(audio)
    dur = round(max(dur_audio + 0.6, words[-1]["t1"] + cauda), 2)
    os.makedirs(os.path.join(DIR, "audio"), exist_ok=True)
    destino = os.path.join(DIR, "audio", "narracao.mp3")
    if audio.lower().endswith(".mp3"):
        if os.path.abspath(audio) != destino:
            shutil.copyfile(audio, destino)
    else:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", audio, "-b:a", "192k", destino], check=True)

    vo = {"estimado": False, "metodo": metodo, "fonte": os.path.basename(audio), "words": words, "frases": frases, "dur": dur, "faltou": faltou}
    json.dump(vo, open(os.path.join(DIR, "vo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"vo.json ({metodo}): {len(words)} palavras, {len(frases)} frases, filme com {dur}s (áudio {dur_audio:.2f}s)")
    if faltou:
        print(f"atenção: {len(faltou)} palavra(s) interpolada(s): {' '.join(faltou[:20])}")
    for f in frases:
        print(f"  {f['t0']:6.2f}s  {f['texto']}")


if __name__ == "__main__":
    main()
