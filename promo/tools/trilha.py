"""Trilha + efeitos sonoros do Reel, compostos em código e presos às palavras (capítulo de som do método).

uso: python3 promo/tools/trilha.py
Lê   promo/hits.json (tempos das cenas e efeitos, exportados do film.js)
     promo/audio/narracao.mp3 (opcional: se existir, entra na mix com ducking da trilha)
Grava promo/audio/mix.mp3 (-14 LUFS, -1 dBTP), que o player e o render usam.

Tudo determinístico (ruído com semente): rodar de novo gera o mesmo áudio.
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SR = 44100
BPM = 120
BEAT = 60 / BPM
RNG = np.random.default_rng(7)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def lowpass_fft(x, corte):
    """Passa-baixas suave no domínio da frequência (estático)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / corte) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass_fft(x, centro, largura):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-((f - centro) / largura) ** 2)
    return np.fft.irfft(X, len(x))


def env(n, ataque=0.005, decai=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / decai)


def ruido(d):
    return RNG.standard_normal(int(d * SR))


def soma(alvo, sinal, t0, ganho=1.0):
    i = int(t0 * SR)
    if i >= len(alvo):
        return
    if i < 0:
        sinal, i = sinal[-i:], 0
    n = min(len(sinal), len(alvo) - i)
    alvo[i:i + n] += sinal[:n] * ganho


# ------------------------------------------------------------------ instrumentos
def kick():
    t = t_axis(0.45)
    freq = 45 + 110 * np.exp(-t / 0.045)
    fase = 2 * np.pi * np.cumsum(freq) / SR
    return np.tanh(1.6 * np.sin(fase) * np.exp(-t / 0.16))


def clap():
    n = ruido(0.25)
    e = np.zeros_like(n)
    for k in range(3):  # palmas em camadas
        e += np.roll(env(len(n), 0.001, 0.012), int(k * 0.011 * SR))
    e += env(len(n), 0.001, 0.09) * 0.6
    return bandpass_fft(n, 1500, 900) * e * 1.4


def hat(aberto=False):
    d = 0.22 if aberto else 0.05
    n = ruido(d)
    X = np.fft.rfft(n)
    f = np.fft.rfftfreq(len(n), 1 / SR)
    X *= (f > 7000)
    return np.fft.irfft(X, len(n)) * env(len(n), 0.001, 0.06 if aberto else 0.012)


def nota(freq, d, forma="saw", decai=0.25, detune=0.0):
    t = t_axis(d)
    s = np.zeros_like(t)
    for dt in ([0] if not detune else [-detune, detune]):
        fase = 2 * np.pi * freq * (1 + dt) * t
        s += (2 * ((fase / (2 * np.pi)) % 1) - 1) if forma == "saw" else np.sign(np.sin(fase)) * 0.6 if forma == "sq" else np.sin(fase)
    return s * env(len(t), 0.004, decai)


# ------------------------------------------------------------------ efeitos (SFX)
def sfx_boom(forte=True):
    d = 1.4 if forte else 0.6
    t = t_axis(d)
    freq = 32 + 140 * np.exp(-t / (0.12 if forte else 0.06))
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / (0.5 if forte else 0.18))
    ch = lowpass_fft(ruido(d), 2500) * env(len(t), 0.001, 0.12 if forte else 0.05)
    return np.tanh(2.2 * (sub + 0.6 * ch)) * (1.0 if forte else 0.7)


def sfx_whoosh(d=0.45, sobe=True):
    n = ruido(d)
    t = t_axis(d)
    forma = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    baixo, alto = lowpass_fft(n, 900), lowpass_fft(n, 6000)
    mixw = (t / d) if sobe else (1 - t / d)
    return (baixo * (1 - mixw) + alto * mixw) * forma * 0.8


def sfx_pop():
    t = t_axis(0.12)
    freq = 500 + 900 * (t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(t), 0.001, 0.04) * 0.7


def sfx_tick():
    t = t_axis(0.05)
    return (np.sin(2 * np.pi * 2400 * t) * 0.5 + hat() [:len(t)] * 0.5) * env(len(t), 0.0005, 0.012) * 0.6


def sfx_ding():
    t = t_axis(1.0)
    return (np.sin(2 * np.pi * 1318.5 * t) + 0.6 * np.sin(2 * np.pi * 1975.5 * t)) * env(len(t), 0.002, 0.35) * 0.45


def sfx_riser(d=0.6):
    t = t_axis(d)
    freq = 200 + 1600 * (t / d) ** 2
    tom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.3
    n = lowpass_fft(ruido(d), 5000) * 0.5
    return (tom + n) * (t / d) ** 2


def sfx_teclado(d):
    out = np.zeros(int(d * SR))
    k, tt = 0, 0.0
    while tt < d:
        soma(out, sfx_tick() * (0.5 + 0.5 * RNG.random()), tt)
        tt += 0.055 + 0.07 * RNG.random()
        k += 1
    return out * 0.7


# ------------------------------------------------------------------ montagem
def main():
    dados = json.load(open(os.path.join(DIR, "hits.json"), encoding="utf-8"))
    T, hits, dur = dados["T"], dados["hits"], dados["dur"]
    n = int((dur + 0.5) * SR)
    batida = np.zeros(n)
    musica = np.zeros(n)
    efeitos = np.zeros(n)

    # progressão Lá menor · Fá · Dó · Sol (um acorde por compasso de 4 tempos)
    acordes = [(110.0, [220.0, 261.6, 329.6]), (87.3, [174.6, 220.0, 261.6]), (130.8, [261.6, 329.6, 392.0]), (98.0, [196.0, 246.9, 293.7])]
    compasso = 4 * BEAT
    tt = 0.0
    while tt < dur + 0.5:
        raiz, triade = acordes[int(tt / compasso) % 4]
        for b in range(4):
            tb = tt + b * BEAT
            soma(batida, kick(), tb, 0.9)
            if b in (1, 3):
                soma(batida, clap(), tb, 0.45)
            soma(batida, hat(), tb, 0.18)
            soma(batida, hat(aberto=True), tb + BEAT / 2, 0.14)
            soma(musica, nota(raiz / 2, BEAT * 0.9, "sin", 0.35), tb + BEAT / 2, 0.55)  # baixo no contratempo
        for k in range(16):  # arpejo em semicolcheias
            soma(musica, nota(triade[k % 3] * (2 if k % 8 >= 4 else 1), 0.12, "sq", 0.07), tt + k * BEAT / 4, 0.08)
        for fq in triade:  # pad
            soma(musica, nota(fq, compasso, "saw", 1.6, detune=0.004), tt, 0.05)
        tt += compasso
    musica = lowpass_fft(musica, 3200)

    # dinâmica: gancho filtrado subindo, cortes de silêncio antes de cada boom, fim com fade
    t = np.arange(n) / SR
    abertura = np.clip(t / max(T["sem"], 0.1), 0, 1)
    filtrada = lowpass_fft(batida + musica, 700)
    cheia = batida + musica
    trilha = filtrada * (1 - abertura) + cheia * abertura
    booms = [h[0] for h in hits if h[1] == "boom"]
    gate = np.ones(n)
    for b in booms:
        i0, i1 = int((b - 0.32) * SR), int(b * SR)
        gate[max(0, i0):max(0, i1)] *= 0.08
    trilha *= gate
    trilha *= np.clip((dur + 0.4 - t) / 1.6, 0, 1)

    # efeitos presos aos HITS
    for tempo, tipo in hits:
        if tipo == "boom":
            soma(efeitos, sfx_boom(True), tempo, 0.95)
        elif tipo == "boom_leve":
            soma(efeitos, sfx_boom(False), tempo, 0.6)
        elif tipo == "whoosh":
            soma(efeitos, sfx_whoosh(0.45), tempo - 0.3, 0.6)
        elif tipo == "swoosh":
            soma(efeitos, sfx_whoosh(0.25, sobe=False), tempo - 0.1, 0.5)
        elif tipo == "pop":
            soma(efeitos, sfx_pop(), tempo, 0.55)
        elif tipo == "tick":
            soma(efeitos, sfx_tick(), tempo, 0.7)
        elif tipo == "ding":
            soma(efeitos, sfx_ding(), tempo, 0.8)
        elif tipo == "riser":
            soma(efeitos, sfx_riser(0.6), tempo - 0.55 if tempo > 0.6 else 0, 0.5)
        elif tipo == "enviar":
            soma(efeitos, sfx_whoosh(0.3, sobe=True), tempo - 0.25, 0.5)
            soma(efeitos, sfx_pop(), tempo, 0.6)
        elif tipo == "teclado":
            soma(efeitos, sfx_teclado(max(0.3, T["ia"] - 0.15 - tempo)), tempo, 0.55)

    # narração (se existir): ducking da trilha sob a voz
    vo_path = os.path.join(DIR, "audio", "narracao.mp3")
    voz = np.zeros(n)
    if os.path.exists(vo_path):
        with tempfile.TemporaryDirectory() as tmp:
            w = os.path.join(tmp, "vo.wav")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vo_path, "-ac", "1", "-ar", str(SR), w], check=True)
            with wave.open(w) as f:
                v = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        voz[: min(n, len(v))] = v[:n]
        janela = int(0.12 * SR)
        e = np.sqrt(np.convolve(voz ** 2, np.ones(janela) / janela, mode="same"))
        e = np.clip(e / (e.max() + 1e-9) * 3, 0, 1)
        trilha *= 1 - 0.55 * e
        print("narração encontrada: trilha com ducking sob a voz")
    else:
        print("sem narração ainda: mix com trilha + efeitos (prévia)")

    def norm(x, alvo):
        return x / (np.abs(x).max() + 1e-9) * alvo

    mix = norm(trilha, 0.45 if voz.any() else 0.7) + norm(efeitos, 0.6) + (norm(voz, 0.95) if voz.any() else 0)
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)

    os.makedirs(os.path.join(DIR, "audio"), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "mix.wav")
        with wave.open(wav, "wb") as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
        # loudness em duas passadas: -14 LUFS / -1 dBTP (padrão das redes)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True)
        m = json.loads(r.stderr[r.stderr.rindex("{"):])
        filtro = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                  f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
        saida = os.path.join(DIR, "audio", "mix.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", filtro, "-ac", "2", "-ar", "44100", "-b:a", "192k", saida], check=True)
    print(f"audio/mix.mp3: {dur:.2f}s, {len(hits)} efeitos")


if __name__ == "__main__":
    main()
