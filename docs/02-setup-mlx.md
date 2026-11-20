# 2. Setup with MLX

Status: **planned**. Commands are taken from the model card and have not been run here yet. Replace this line with the date and the versions actually installed once done.

## 2.1 Environment

A dedicated virtual environment, because the model's `install.py` patches the installed mlx-vlm package.

```sh
mkdir -p ~/apertus && cd ~/apertus
uv venv --python 3.12
source .venv/bin/activate
uv pip install mlx-vlm mlx-lm "huggingface_hub[cli]"
```

mlx-vlm 0.7 and later no longer pulls in mlx-lm, so both must be named. The model card was verified against mlx-vlm 0.7.1 and mlx-lm 0.31.3. Record the installed versions:

```sh
uv pip list | grep -i -E "mlx|huggingface"
```

## 2.2 Download

```sh
hf download m1rkocasu/Apertus-v1.5-8B-MLX-8bit
```

About 10 GB, stored in `~/.cache/huggingface/hub`. No login needed.

## 2.3 Architecture patch

The repo ships an `install.py` that adds the `apertus1p5` architecture to mlx-vlm. Read it first, then:

```sh
cd "$(hf download m1rkocasu/Apertus-v1.5-8B-MLX-8bit)"
python install.py --check   # report only
python install.py
```

It has to be re-run after every mlx-vlm upgrade. If a newer mlx-vlm supports Apertus 1.5 natively, skip this step and note it here.

## 2.4 First prompts

Text:

```sh
mlx_vlm.generate --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit \
  --prompt "Erkläre in drei Sätzen, was ein FHIR Implementation Guide ist." \
  --max-tokens 512 --temperature 0.8 --top-p 0.9
```

Image:

```sh
mlx_vlm.generate --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit \
  --image photo.jpg --prompt "What is in this picture?" --max-tokens 512
```

Audio:

```sh
mlx_vlm.generate --model m1rkocasu/Apertus-v1.5-8B-MLX-8bit \
  --audio clip.wav --prompt "Transcribe this." --max-tokens 512
```

Recommended sampling from the model card: temperature 0.8, top_p 0.9, everything else at defaults.

## 2.5 Thinking mode

This build renders `Deliberation: enabled` by default, where upstream defaults to off. Over the API it is switched off per request with:

```json
"chat_template_kwargs": {"enable_thinking": false}
```

Reasoning is returned as `reasoning_content`, separate from `content`. The card notes that reasoning tends to be in English even when the question is not.

## 2.6 Checklist

- [ ] Versions recorded
- [ ] `install.py` read and applied
- [ ] Text prompt answers in German, French, Italian, English
- [ ] Image prompt works
- [ ] Audio prompt works
- [ ] Thinking mode toggles
- [ ] Peak memory noted (Activity Monitor, or the peak figure `mlx_vlm.generate` prints)
