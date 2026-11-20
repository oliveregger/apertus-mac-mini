# 1. Model selection

Status: **decided** (survey of Hugging Face on 2026-11-20).

## What Apertus 1.5 is

- Released 2026-07-24 by ETH Zurich, EPFL and CSCS under Apache 2.0.
- Two sizes: 8B and 70B. Both take text, images and audio as input and produce text.
- Context window of 262,144 tokens and an optional thinking mode.
- The official `swiss-ai` repos are gated: downloading needs a Hugging Face account that has accepted the contact-sharing form. They ship unquantized weights only (8B: 18 GB, 70B: 145 GB).
- The quantized builds are all community conversions.

## What fits in 64 GB

macOS lets the GPU use roughly three quarters of unified memory by default, so about 48 GB here. Weights plus context cache must stay under that.

| Model | Quantization | Size | Fits? |
|---|---|---|---|
| 8B | bf16 (unquantized) | 18 GB | yes |
| 8B | 8-bit | 10 GB | yes, large headroom |
| 8B | 4-bit | 5–6 GB | yes, but pointless on this machine |
| 70B | FP8 | 77 GB | no |
| 70B | FP6 | 59 GB | no |
| 70B | 4-bit | ~41 GB (estimate) | yes, tight; no published build |

## Candidate builds for the 8B

| Repo | Format | Quantizations | Multimodal | Gated | Notes |
|---|---|---|---|---|---|
| [m1rkocasu/Apertus-v1.5-8B-MLX-*](https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-MLX-8bit) | MLX | 8-bit, MXFP8, 6-bit, 5-bit, 4-bit DWQ, MXFP4 | image + audio | no | Needs an `install.py` patch that adds the `apertus1p5` architecture to mlx-vlm. Author publishes fidelity figures per variant. |
| [m1rkocasu/Apertus-v1.5-8B-text-MLX-*](https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-8bit) | MLX | same set | text only | no | Same decoder without the vision and audio towers, 8.6 GB at 8-bit. |
| [tokimoa/apertus-v1.5-8b-mlx-*](https://huggingface.co/tokimoa/apertus-v1.5-8b-mlx-8bit) | MLX | bf16, 8-bit, 4-bit | to verify | to verify | Converted with mlx-lm. |
| [faruk-zahiragic/Apertus-v1.5-8B-GGUF](https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF) | GGUF | Q4_K_M only | image + audio via mmproj | no | Card says it needs an Apertus-compatible llama.cpp fork at a specific commit. |
| [andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF](https://huggingface.co/andreasmartin/apertus-v1.5-8b-text-Q8_0-GGUF) | GGUF | Q8_0 | text only | no | 8.6 GB. |

## Choice

**`m1rkocasu/Apertus-v1.5-8B-MLX-8bit` on mlx-vlm + mlx-lm.**

- MLX is the native Apple Silicon runtime and the route the model's community has tested most on Macs.
- 8-bit has the lowest reported deviation from bf16 of the published variants (0.006, against 0.19 for 4-bit DWQ). With 64 GB there is no reason to trade quality for size.
- It keeps image and audio input.
- It is not gated, so no Hugging Face account is needed for the first phase.

Fallback if the mlx-vlm patch gives trouble: the text-only 8-bit MLX build, which should load with plain mlx-lm.

## Risks to check during setup

- The model card pins mlx-vlm 0.7.1 and mlx-lm 0.31.3 (verified 2026-09-19). Newer releases may have native Apertus 1.5 support, or may break the patch. Check before installing.
- `install.py` modifies the installed mlx-vlm package. Read it before running it, and keep the install in a dedicated virtual environment.
- This build has thinking mode **on** by default, unlike upstream.
- These are third-party conversions. The file hashes cannot be compared against an official quantized release because none exists.
