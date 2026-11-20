# 2. Setup with MLX

Status: **done on 2026-11-20**. Text and thinking mode are verified. Image and audio input are not tested yet.

## Installed versions

| Package | Version | Model card verified against |
|---|---|---|
| mlx | 0.32.4 | |
| mlx-lm | 0.32.2 | 0.31.3 |
| mlx-vlm | 0.8.0 | 0.7.1 |
| transformers | 5.23.0 | |
| huggingface-hub | 2.4.0 | |

Model: `m1rkocasu/Apertus-v1.5-8B-MLX-8bit`, snapshot `1050141cd58ca49ec3ce43db2a9c700720c866f3`, 9.4 GB on disk.

## 2.1 Environment

A dedicated virtual environment, because the model needs extra architecture code inside the mlx-vlm package.

```sh
mkdir -p ~/apertus && cd ~/apertus
uv venv --python 3.12
uv pip install --python .venv/bin/python mlx-vlm mlx-lm "huggingface_hub[cli]"
```

mlx-vlm no longer pulls in mlx-lm, so both must be named.

## 2.2 Download

```sh
.venv/bin/hf download m1rkocasu/Apertus-v1.5-8B-MLX-8bit
```

No login needed. The files land in `~/.cache/huggingface/hub`.

## 2.3 Architecture code

mlx-vlm 0.8.0 ships an `apertus` architecture (the 1.0 text decoder) but not `apertus1p5`, so the model does not load out of the box. The model repo carries the missing code in an `apertus1p5/` folder (14 Python files, about 1,600 lines) and an `install.py` that copies it into mlx-vlm.

`install.py` also scans `/Applications` for other copies of mlx-vlm and can write a `.pth` hook into the user site-packages. That is more than this setup needs, so the files were copied by hand into the virtual environment only:

```sh
M=$(ls -d ~/.cache/huggingface/hub/models--m1rkocasu--Apertus-v1.5-8B-MLX-8bit/snapshots/*)
D=~/apertus/.venv/lib/python3.12/site-packages/mlx_vlm/models/apertus1p5
mkdir -p "$D" && cp -L "$M"/apertus1p5/*.py "$D"/
.venv/bin/python -c "import mlx_vlm.models.apertus1p5 as m; print(m.Model.__name__)"
```

Review done before copying: the code imports only mlx, numpy, transformers and (for images) torch, torchvision and PIL. It has no network, subprocess or eval calls. Its only file write is an opt-in debug log at `~/.lmstudio/apertus1p5-trace.log`, active only if a flag file exists or `APERTUS1P5_TRACE` is set.

**This copy must be repeated after every mlx-vlm upgrade**, until mlx-vlm supports `apertus1p5` upstream.

## 2.4 First prompt

```sh
.venv/bin/mlx_vlm.generate --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit \
  --prompt "Erkläre in drei Sätzen, was ein FHIR Implementation Guide ist." \
  --max-tokens 700 --temperature 0.8 --top-p 0.9
```

Result: a correct three-sentence answer in German.

Sampling recommended by the model card: temperature 0.8, top_p 0.9.

## 2.5 Thinking mode

Controlled per request with `"chat_template_kwargs": {"enable_thinking": true|false}`. With it on, the reasoning arrives in a separate `reasoning` field and is written in English even for a German question. Tested with a train-time question: 600 characters of reasoning, correct answer.

In the plain tool-call test without that parameter, no reasoning was produced, so do not rely on the model card's claim that thinking is on by default. Set it explicitly.

## 2.6 Checklist

- [x] Versions recorded
- [x] Architecture code reviewed and installed
- [x] Text prompt answers in German
- [ ] Text prompts in French, Italian, Romansh, English
- [ ] Image prompt (needs `torch` and `torchvision` in the environment)
- [ ] Audio prompt
- [x] Thinking mode toggles
- [x] Peak memory noted: 10.4 GB
