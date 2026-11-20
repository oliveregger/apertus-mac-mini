# Apertus 1.5 on a Mac mini

Setup notes for running the quantized [Apertus 1.5](https://huggingface.co/swiss-ai/Apertus-v1.5-8B) model (ETH Zurich / EPFL / CSCS, Apache 2.0) locally on a Mac mini.

> **Status: plan only.** Nothing below has been run on this machine yet. Each doc is marked *planned* until the step has been executed and the results recorded.

## Machine

| | |
|---|---|
| Model | Mac mini, Apple M5 Pro (18 cores) |
| Memory | 64 GB unified |
| Disk | 926 GB, ~849 GB free |
| OS | macOS 27.2.1 |
| Already installed | Homebrew, git, gh, uv, Python 3.12 (mise), Ollama 0.40.16 (server not running) |
| Not installed | mlx-lm, mlx-vlm, llama.cpp, Hugging Face CLI |

## Decision

Start with **Apertus 1.5 8B at 8-bit on MLX**. It is a 10 GB download, needs no Hugging Face account, uses about 9 GB of the 64 GB, and is the closest quantization to the original weights. The 70B model is a later, optional phase because no ready-made quantization fits this machine.

Details and alternatives: [docs/01-model-selection.md](docs/01-model-selection.md).

## Plan

| # | Step | Doc | Status |
|---|---|---|---|
| 1 | Pick model, quantization and runtime | [01-model-selection](docs/01-model-selection.md) | decided |
| 2 | Install MLX runtime, download 8B 8-bit, first text prompt | [02-setup-mlx](docs/02-setup-mlx.md) | planned |
| 3 | Test image and audio input, thinking mode on/off | [02-setup-mlx](docs/02-setup-mlx.md) | planned |
| 4 | Serve an OpenAI-compatible API, start at login | [03-serving](docs/03-serving.md) | planned |
| 5 | Measure tokens/s and memory, record results | [04-benchmarks](docs/04-benchmarks.md) | planned |
| 6 | Optional: GGUF route with llama.cpp or Ollama | [05-gguf-llama-cpp-ollama](docs/05-gguf-llama-cpp-ollama.md) | planned |
| 7 | Optional: Apertus 1.5 70B, self-quantized to 4-bit | [06-apertus-70b](docs/06-apertus-70b.md) | planned |

## Open questions

- Which use is the target: interactive chat, an API for other tools, or batch processing? This decides how much of step 4 is needed.
- Should the API be reachable from other machines on the network, or only from localhost?
- Is the 70B model wanted at all? It needs a Hugging Face account with the gate accepted and a 145 GB download.

## Sources

- [Apertus 1.5 announcement (CSCS)](https://www.cscs.ch/science/computer-science-hpc/2026/apertus-15-building-the-next-generation-of-open-ai-infrastructure)
- [swiss-ai/Apertus-v1.5-8B](https://huggingface.co/swiss-ai/Apertus-v1.5-8B) and [swiss-ai/Apertus-v1.5-70B](https://huggingface.co/swiss-ai/Apertus-v1.5-70B)
- [m1rkocasu/Apertus-v1.5-8B-MLX-8bit](https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-MLX-8bit)
- [faruk-zahiragic/Apertus-v1.5-8B-GGUF](https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF)
- [Liip: 6 ways to try Apertus 1.5](https://www.liip.ch/en/blog/apertus-1-5-6-ways-to-try-out-switzerland-s-updated-ai-model)
